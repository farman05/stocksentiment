import Select from "react-select";
import { useState } from "react";
const StockSelector = ({ onSelect, stocks }) => {
  const [selectedStock, setSelectedStock] = useState(null);



  const handleChange = (selectedOption) => {
    console.log({selectedOption})
    setSelectedStock(selectedOption);
    onSelect(selectedOption); // Send selected stock to parent component
  };

  return (
    <div className="w-full max-w-lg">
      <Select
        options={stocks}
        value={selectedStock}
        onChange={handleChange}
        isSearchable
        placeholder="Search & Select a Stock..."
        className="text-black "
      />
    </div>
  );
};

export default StockSelector;
