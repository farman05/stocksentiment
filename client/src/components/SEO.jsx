import { Helmet } from "react-helmet-async";

const SEO = () => {
  return (
    <>
      <Helmet>
        <title>Stock Sentiment - AI-Powered Market Analysis</title>
        <meta name="description" content="Get AI-driven stock analysis and trends. Stay ahead in the stock market with real-time data." />
        <meta property="og:title" content="Stock Sentiment - AI-Powered Market Analysis" />
        <meta property="og:description" content="Stay ahead in stock trading with real-time AI analysis." />
        <meta property="og:image" content="https://stocksentiment.in/stocksentiment.png" />
        <script type="application/ld+json">
        {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FinancialService",
            "name": "Stock Sentiment",
            "description": "Get AI-powered stock insights and market trends in real-time.",
            "url": "https://stocksentiment.in",
            "logo": "https://stocksentiment.in/stocksentiment.png",
            
        })}
</script>

      </Helmet>
    </>
  );
};

export default SEO;
