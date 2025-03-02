import React, { useEffect, useState } from "react";

const StockCandleLoader = () => {
  const [candles, setCandles] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newCandle = {
        high: Math.random() * 200 + 1000, // Random high price
        low: Math.random() * 200 + 900, // Random low price
        open: Math.random() * 200 + 950, // Random open price
        close: Math.random() * 200 + 950, // Random close price
      };
      setCandles((prev) => [...prev.slice(-10), newCandle]); // Keep only last 10 candles
    }, 700);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-64 bg-gray-900 text-white rounded-lg shadow-lg p-6">
      <div className="text-xl font-semibold mb-3">Analyzing Market Trends...</div>
      <div className="flex space-x-1">
        {candles.map((candle, index) => {
          const isBullish = candle.close > candle.open;
          return (
            <div key={index} className="flex flex-col items-center">
              <div
                className="w-1 bg-gray-400"
                style={{ height: `${(candle.high - candle.low) / 5}px` }}
              ></div>
              <div
                className={`w-3 ${isBullish ? "bg-green-500" : "bg-red-500"}`}
                style={{
                  height: `${Math.abs(candle.open - candle.close) / 5}px`,
                }}
              ></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StockCandleLoader;
