const AffiliateProduct = ({ products, title }) => {
  products.length = window.innerWidth < 768 ? 1 : 3;
  return (
    <div className="w-full max-w-6xl bg-gray-900 shadow-xl rounded-xl p-6 mt-10">
      <h2 className="text-2xl font-bold text-white text-center mb-6">
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((product, index) => (
          <a
            key={index}
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-800 p-4 rounded-lg shadow-lg hover:shadow-2xl transition transform hover:scale-105 text-white flex flex-col items-center"
          >
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-40 object-contain mb-4"
            />
            <h3 className="text-lg font-semibold text-center">
              {product.title}
            </h3>
            <button className="mt-3 w-full bg-[#FF9900] text-white font-bold py-2 rounded-lg hover:bg-[#e68a00] transition">
              Buy Now
            </button>
          </a>
        ))}
      </div>
    </div>
  );
};

export default AffiliateProduct;
