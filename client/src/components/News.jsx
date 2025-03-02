import React from "react";

const NewsComponent = ({ news }) => {
  return (
    <div className=" p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2 flex items-center gap-2">
        📰 Latest News
      </h2>
      <div className="space-y-4">
        {news.map((article, index) => (
          <a
            key={index}
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-gray-50 rounded-lg overflow-hidden shadow hover:shadow-md transition duration-300 hover:bg-gray-100"
          >
            <div className="flex items-start p-4 gap-4">
              {article.image && (
                <img
                  src={article.image}
                  alt="News"
                  className="w-20 h-20 object-cover rounded-lg"
                />
              )}
              <div className="flex flex-col justify-between">
                <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {article.pubDate
                    ? new Date(article.pubDate).toLocaleDateString()
                    : "Unknown Date"}
                </p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default NewsComponent;
