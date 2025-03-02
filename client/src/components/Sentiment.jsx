import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const SentimentAnalysis = ({ sentiment }) => {
  if (!sentiment) return <p className="text-center text-white">Loading...</p>;

  const {
    overall_sentiment_label,
    positive,
    neutral,
    negative,
    explanation,
    details,
  } = sentiment;

  const data = [
    { name: "Positive", value: positive, color: "#16a34a" }, // Green
    { name: "Neutral", value: neutral, color: "#facc15" }, // Yellow
    { name: "Negative", value: negative, color: "#dc2626" }, // Red
  ];

  return (
    <div className="bg-gray-900 shadow-xl rounded-2xl p-8 w-full max-w-5xl mx-auto">
      {/* Sentiment Label */}
      <h3
        className={`text-xl font-bold text-center uppercase tracking-wider ${
          overall_sentiment_label === "Positive"
            ? "text-green-400"
            : overall_sentiment_label === "Neutral"
            ? "text-yellow-400"
            : "text-red-400"
        }`}
      >
        Overall Sentiment: {overall_sentiment_label}
      </h3>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
        {/* Pie Chart */}
        <div className="flex justify-center">
          <PieChart width={400} height={400}>
            <Pie
              data={data}
              dataKey="value"
              cx="50%"
              cy="50%"
              outerRadius={130}
              label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              labelStyle={{ fill: "white", fontSize: "14px", fontWeight: "bold" }}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: "#333", color: "#fff" }} />
            <Legend iconSize={14} wrapperStyle={{ color: "white", fontSize: "14px" }} />
          </PieChart>
        </div>

        {/* Explanation & Details */}
        <div className="bg-gray-800 p-6 rounded-xl text-white shadow-lg">
          <strong className="block text-yellow-300 text-2xl mb-3">
            📝 Explanation:
          </strong>
          <p className="text-lg leading-relaxed mb-4">{explanation}</p>

          {/* Detailed Insights */}
          <ul className="list-disc pl-5 space-y-2 text-md">
            {details.map((point, index) => (
              <li key={index} className="text-gray-300">
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SentimentAnalysis;
