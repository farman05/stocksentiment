require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const OpenAI = require("openai");
const xml2js = require("xml2js");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 5000;


// Serve static files from React build
app.use(express.static(path.join(__dirname, "client", "dist"))); // Assuming Vite build is inside `client/dist`

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_DB, {})
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit the process if DB connection fails
  });

app.use(cors());
app.use(express.json());

// 📌 Stock Schema
const stockSchema = new mongoose.Schema({
  symbol: String,
  news: Array,
  sentiment: Object,
  prices: Array, // Last 15 days of stock prices
  searchCount: { type: Number, default: 1 },
  lastUpdated: { type: String, required: true }, // Stores the date (YYYY-MM-DD)
});

const stockList = new mongoose.Schema({
  value: String,
  name: String,
  sector: String
});

const Stock = mongoose.model("Stock", stockSchema);
const StockList = mongoose.model("StockList", stockList);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Fetch Stock Data from Yahoo Finance API
 */
async function fetchStockData(symbol) {
  try {
    const endDate = Math.floor(Date.now() / 1000);
    const startDate = endDate - 90 * 24 * 60 * 60;
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.NS?interval=1d&period1=${startDate}&period2=${endDate}`;

    const response = await axios.get(url);
    const chartData = response.data.chart.result[0];
    const timestamps = chartData.timestamp;
    const quote = chartData.indicators.quote[0];
    const adjclose = chartData.indicators.adjclose[0].adjclose;

    const formattedData = timestamps
      .map((timestamp, index) => {
        const date = new Date(timestamp * 1000);
        if (date.getDay() === 0 || date.getDay() === 6) return null; // Skip weekends
        return {
          date: date.toISOString().split("T")[0],
          open: quote.open[index]?.toFixed(2),
          high: quote.high[index]?.toFixed(2),
          low: quote.low[index]?.toFixed(2),
          close: quote.close[index]?.toFixed(2),
          volume: quote.volume[index]?.toFixed(2),
          adjclose: adjclose[index]?.toFixed(2),
        };
      })
      .filter(Boolean).slice(-60);
    return formattedData;
  } catch (error) {
    throw error;
  }
}

/**
 * Fetch Latest Stock News
 */
async function getGoogleNews(symbol) {
  try {
    const url = `https://news.google.com/rss/search?q=${symbol}+stock+India`;
    const { data } = await axios.get(url);
    const result = await xml2js.parseStringPromise(data);
    const articles = result.rss.channel[0].item || [];

    return articles.slice(0, 5).map((item) => ({
      title: item.title[0],
      link: item.link[0],
      pubDate: item.pubDate[0],
    }));
  } catch (error) {
    console.error("Error fetching Google News:", error);
    throw error;
  }
}

/**
 * AI-Powered Sentiment Analysis
 */
const analyzeSentiment = async (symbol, stockData, news) => {
  const newsHeadlines = news.map((article) => article.title).join("\n");

  const prompt = `Analyze the sentiment for the stock ${symbol} based on the given stock price movement and news headlines, the analysis should have high priority on the price movement and then news.

  Key Considerations for Analysis:

    Identify trends in price movement, such as upward or downward momentum.
    Assess volatility, support, and resistance levels in recent trading sessions.
    Examine volume spikes and their impact on sentiment.
    Incorporate news headlines into the analysis, considering whether they reinforce or contradict the price trend.
    Provide a professional evaluation like a financial expert, explaining what these indicators suggest about the stock’s future potential.
    Discuss any potential buy/sell signals and investor sentiment in a structured format.
    The explanation should be in bullet-point format for clarity.

  - Stock Data: ${JSON.stringify(stockData)}
  - News Headlines: ${newsHeadlines}

  - The response should be written in a professional yet conversational tone, similar to how an experienced market analyst would explain it to an investor. The explanation should be clear, avoiding overly technical jargon while still maintaining depth.

  Instead of just stating percentages, provide an engaging summary of what’s happening with the stock, potential risks, and opportunities, along with a final recommendation for investors—whether they should stay cautious, buy on dips, or avoid for now."
  the json format should be like below
  {
    "overall_sentiment_label": "Positive | Neutral | Negative",
    "positive": 45,   // Percentage of positive sentiment
    "neutral": 30,    // Percentage of neutral sentiment
    "negative": 25,   // Percentage of negative sentiment
    "explanation": "Provide a detailed explanation like a financial expert’s perspective on the stock’s trend, interpreting the price movement, volume, and recent news. Discuss any support/resistance levels, potential buy/sell signals, and investor sentiment.Your explanation should be like the reader can make his mind what to do with the stocks",
    "details":[
      "The stock is currently in an uptrend, breaking past key resistance levels.",
      "Trading volume has increased significantly, indicating strong investor interest.",
      "Recent news reports highlight positive earnings, reinforcing bullish sentiment.",
      "Resistance is seen around 750, while strong support lies at 700.",
      "If the stock sustains above 750, further upside is expected."
    ]
  }
  ;`;

  try {
    const aiResponse = await openai.chat.completions.create({
      response_format: { type: "json_object" },
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: prompt }],
    });
    if (aiResponse.choices[0].message.content) {
      return JSON.parse(aiResponse.choices[0].message.content);
    }

    // return aiResponse.choices[0].message.content;
  } catch (error) {
    console.error("Error analyzing sentiment:", error.message);
    return "Sentiment analysis failed.";
  }
};

/**
 * Handle stock search and caching
 */
const searchStock = async (symbol) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    let stock = await Stock.findOne({ symbol });

    if (!stock || stock.lastUpdated !== today) {
      console.log(`Fetching new data for ${symbol}...`);
      const prices = await fetchStockData(symbol);
      const news = await getGoogleNews(symbol);
      const sentiment = await analyzeSentiment(symbol, prices, news);
      if (prices.length && news.length && sentiment) {
        stock = await Stock.findOneAndUpdate(
          { symbol },
          { prices, news, sentiment, lastUpdated: today },
          { upsert: true, new: true }
        );
      }
    }

    return stock;
  } catch (error) {
    console.error("Error searching stock:", error.message);
    throw new Error("Stock data retrieval failed.");
  }
};

/**
 * API Route to Get Stock Data
 */
app.get("/api/sentiment/:symbol", async (req, res, next) => {
  try {
    const { symbol } = req.params;
    if (!symbol)
      return res.status(400).json({ error: "Stock symbol required" });

    const data = await searchStock(symbol);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
});

app.get("/api/stocks", async (req, res) => {
  try {
    //give alias to stocks
    const data = await StockList.aggregate([
      {
        $project: {
          label: "$name", // Rename "name" to "label"
          _id: 0, // Remove `_id` if not needed
          value:1
        },
      },
    ]);    res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
})

async function getCookies() {
  const response = await axios.get("https://www.nseindia.com", {
    headers: {
      accept: "*/*",
      "accept-language": "en-IN,en-US;q=0.9,en-GB;q=0.8,en;q=0.7",
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
    },
  });
  return response.headers["set-cookie"];
}
// getNifty500Data()
async function getNifty500Data() {
  try {
    const cookies = await getCookies();

    const response = await axios.get(
      "https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%20TOTAL%20MARKET",
      {
        headers: {
          accept: "*/*",
          cookie: cookies.join("; "),
          "accept-language": "en-IN,en-US;q=0.9,en-GB;q=0.8,en;q=0.7",
          referer: "https://www.nseindia.com/market-data/live-equity-market",
          "user-agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
        },
      }
    );

    const stockData = response.data.data.map((stock) => ({
      value: stock.symbol,
      // lastPrice: stock.lastPrice,
      // volume: stock.totalTradedVolume,
      sector: stock.meta?.industry,
      name: stock.meta?.companyName,
    }));
    console.log(stockData)
    const result = await StockList.insertMany(stockData);
    return stockData
    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    const fileName = `nifty200_data_${new Date().toISOString().replace(/:/g, '-')}.json`;
    const filePath = path.join(outputDir, fileName);

    fs.writeFileSync(filePath, JSON.stringify(stockData, null, 2));
    console.log(`Nifty 50 Stock Data saved to: ${filePath}`);

    return stockData;
  } catch (error) {
    console.error("Error fetching Nifty 50 data:", error.message);
    return [];
  }
}

/**
 * Error Handling Middleware
 */
app.use((err, req, res, next) => {
  console.error("Internal Server Error:", err.message);
  res
    .status(500)
    .json({ error: "Something went wrong, please try again later." });
});

/**
 * Handle Uncaught Errors and Restart Process
 */
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  process.exit(1);
});

/**
 * Start the Server
 */

// Serve React app for all non-API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
