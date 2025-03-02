import { useState } from "react";

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim().toUpperCase());
    }
  };
  

  return (
    <div className="flex items-center gap-2 p-4">
      <input
        type="text"
        placeholder="Enter stock symbol (e.g., TCS, RELIANCE)"
        className="border p-2 rounded-lg w-64"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button
        onClick={handleSearch}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg"
      >
        Search
      </button>
    </div>
  );
}
