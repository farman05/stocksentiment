import React, { useEffect, useState } from "react";
import {
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Line,
  ResponsiveContainer,
} from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { date, open, close, high, low, prevClose } = payload[0].payload;

    // Calculate percentage change
    const percentageChange = prevClose
      ? ((close - prevClose) / prevClose) * 100
      : 0;
    const changeColor =
      percentageChange >= 0 ? "text-green-500" : "text-red-500";

    return (
      <div className="bg-gray-900 p-3 border border-gray-200 rounded shadow-md text-xs">
        <p>
          <strong>Date:</strong> {date}
        </p>
        <p>
          <strong>Open:</strong> {open}
        </p>
        <p>
          <strong>Close:</strong> {close}
        </p>
        <p>
          <strong>High:</strong> {high}
        </p>
        <p>
          <strong>Low:</strong> {low}
        </p>
        <p className={`${changeColor} font-semibold`}>
          <strong>Change:</strong> {percentageChange.toFixed(2)}%
        </p>
      </div>
    );
  }
  return null;
};

const CandlestickChart = ({ prices }) => {
  const [chartData, setChartData] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const dataSlice = isMobile ? 30 : 60; // Show 30 days on mobile, 60 days on desktop
    setChartData(prices.slice(-dataSlice));
  }, [prices, isMobile]);

  let profitDays = 0,
    lossDays = 0;
  let highestGain = { date: null, percentage: -Infinity };
  let highestLoss = { date: null, percentage: Infinity };

  // Process data and calculate stats
  const processedData = chartData.map((item, index) => {
    const prevClose = index > 0 ? chartData[index - 1].close : null;
    const percentageChange =
      prevClose !== null ? ((item.close - prevClose) / prevClose) * 100 : null;

    if (percentageChange > 0) profitDays++;
    if (percentageChange < 0) lossDays++;

    if (
      percentageChange !== null &&
      percentageChange > highestGain.percentage
    ) {
      highestGain = { date: item.date, percentage: percentageChange };
    }
    if (
      percentageChange !== null &&
      percentageChange < highestLoss.percentage
    ) {
      highestLoss = { date: item.date, percentage: percentageChange };
    }

    return { ...item, prevClose, percentageChange };
  });

  return (
    <div className="mb-10 p-4 bg-gray-50 rounded-lg shadow-md">
      {/* Stock Summary Section */}
      <div className="mb-5 p-4 rounded-lg shadow-sm bg-white border border-gray-200">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">
          Stock Summary ({isMobile ? "30 Days" : "60 Days"})
        </h3>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800">
          <p>
            <strong>📈 Profit Days:</strong>{" "}
            <span className="text-green-600 font-medium">{profitDays}</span>
          </p>
          <p>
            <strong>📉 Loss Days:</strong>{" "}
            <span className="text-red-600 font-medium">{lossDays}</span>
          </p>

          <p className="flex items-center gap-2">
            <strong>🚀 Highest Gain:</strong>
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
              {highestGain.date} ({highestGain.percentage.toFixed(2)}%)
            </span>
          </p>

          <p className="flex items-center gap-2">
            <strong>📉 Highest Loss:</strong>
            <span className="bg-red-100 text-red-700 px-2 py-1 rounded">
              {highestLoss.date} ({highestLoss.percentage.toFixed(2)}%)
            </span>
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={isMobile ? 300 : 450}>
          <ComposedChart
            data={processedData}
            margin={{ top: 20, right: 10, left: 0, bottom: 50 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#333" }}
              angle={processedData.length > 15 ? -30 : 0}
              textAnchor="end"
              interval={processedData.length > 30 ? 6 : 4} // Dynamic tick interval
            />
            <YAxis
              domain={["dataMin", "dataMax"]}
              tick={{ fontSize: 12, fill: "#333" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="close"
              stroke="#4F46E5"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CandlestickChart;
