import React, { useState, useEffect } from "react";
import axios from "axios";
const CandleStickChart = React.lazy(() => import("./components/PriceChart"));
const SentimentComponent = React.lazy(() => import("./components/Sentiment"));
const NewsComponent = React.lazy(() => import("./components/News"));
const StockSelector = React.lazy(() => import("./components/StockSelector"));
const StockLoader = React.lazy(() => import("./components/Loader"));
const SEO = React.lazy(() => import("./components/SEO"));
const AffiliateProduct = React.lazy(() => import("./components/AffiliateProduct"));
import { booksList, mustHaveList } from "./products";
import { getRandomThree } from "./utils/helper";
// import NewsComponent from "./components/News";
// import StockSelector from "./components/StockSelector";
// import StockLoader from "./components/Loader";
// import SEO from "./components/SEO";
const apiUrl = import.meta.env.VITE_API_URL;
export default function App() {
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stocks, setStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState("");
  const [books, setBooks] = useState([]);
  const [mustHave, setMustHave] = useState([]);
  useEffect(() => {
    // Fetch available stocks
    const fetchStocks = async () => {
      try {
        const response = await axios.get(`${apiUrl}stocks`);
        setStocks(response.data);
      } catch (error) {
        console.error("Error fetching stocks:", error);
      }
    };
    setBooks(getRandomThree(booksList));
    setMustHave(getRandomThree(mustHaveList));
    fetchStocks();
  }, []);

  const fetchStockData = async (symbol) => {
    if(!symbol?.value){
      return
    }

    if (window.gtag) {
      window.gtag("event", "click", {
        event_category: "Stock Search",
        event_label: symbol.value,
      });
    }
    setLoading(true);
    setError("");
    setStockData(null);

    try {
      const response = await axios.get(
        `${apiUrl}sentiment/${symbol.value}`
      );
      setStockData(response.data);
    } catch (err) {
      setError("Failed to fetch stock data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center p-6">
      {/* Full-Width Container */}
      <SEO />
      <div className="w-full max-w-6xl bg-gray-900 shadow-xl rounded-xl p-6 md:p-10 mx-4">
        {/* Title */}
        <div className="flex items-center justify-center gap-3">
          {/* <img src="/logo.png" alt="Logo" className="w-12 h-12" /> */}
          <h1 className="text-4xl font-bold text-white">
            📊 Stock Sentiment Analyzer
          </h1>
        </div>

        {/* Dropdown Search */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <StockSelector onSelect={setSelectedStock} stocks={stocks} />
          {/* <select
            className="w-full sm:w-72 p-3 text-lg bg-gray-800 text-white rounded-lg outline-none"
            value={selectedStock}
            onChange={(e) => setSelectedStock(e.target.value)}
          >
            {stocks.map((stock) => (
              <option key={stock} value={stock}>
                {stock}
              </option>
            ))}
          </select> */}
          <button
            onClick={() => fetchStockData(selectedStock)}
            className="px-6 py-3 !bg-[#22C55E] hover:!bg-[#16A34A] text-white text-lg font-semibold rounded-lg transition shadow-md border !border-[#22C55E] hover:!border-[#16A34A]"
            disabled = {loading}
          
            >
            Analyze
          </button>
        </div>
        <AffiliateProduct
           products={books}
           title="Recommended Trading books"
        />
       

        {/* Loading & Error Messages */}
        {loading &&       <StockLoader/> }
        {error && <p className="text-center text-lg text-red-400 mt-4">{error}</p>}

        {/* Stock Data Section */}
        {stockData && (
          <div className="mt-8">
            <h2 className="text-3xl font-semibold text-center text-white border-b border-gray-700 pb-2">
              Stock: {stockData.symbol}
            </h2>
            {/* Sentiment Section */}
            <div className="mt-6">
              {/* <h3 className="text-2xl font-semibold text-white mb-3">Sentiment Analysis</h3> */}
              <SentimentComponent sentiment={stockData.sentiment} />
              <AffiliateProduct
              products={mustHave}
              title="Must-Have Tools for Every Trader"
              />
            </div>

            {/* Price Chart */}
            <div className="mt-6">
              <h3 className="text-2xl font-semibold text-white mb-3">Price Chart</h3>
              <CandleStickChart prices={stockData.prices} />
            </div>

            {/* News Section */}
            <div className="mt-6">
              <h3 className="text-2xl font-semibold text-white mb-3">Latest News</h3>
              <NewsComponent news={stockData.news} />
            </div>
            {/* Affiliate Section (Below News) */}
              {/* <AffiliateProduct
              title="Top 5 Books for Stock Market Success"
              image="https://via.placeholder.com/80"
              link="https://www.amazon.in/dp/YOUR_AFFILIATE_ID"
            /> */}
          </div>
        )}
      </div>
    </div>
  );
}
