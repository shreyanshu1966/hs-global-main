import { Helmet } from "react-helmet-async";
import HomePage from "../components/itsbits/HomePage";

const Home = () => {
  return (
    <>
      <Helmet>
        <title>HS Global Export : Premium Granite & Marble Solutions - Handcrafted Products Manufacturers with Free Delivery | USA | UK</title>
        <meta name="description" content="Hs Global Export – Best marble furniturers offering premium granite & marble solutions. Handcrafted products with free delivery to USA & UK and across world" />
        <meta name="keywords" content="Premium Granite Furniture Exporter, Marble Furniture Manufacturer, Italian Onyx Furniture, Indian Marble Furniture Export, Beige and Grey Marble Furniture, Marble Sinks and Tiles Exporter, Global Granite & Marble Supplier, Luxury Marble Furniture, Custom Marble Furniture, High-Quality Marble Tiles Export, Premium Marble Sink Manufacturers, Marble Home Décor Exporter, Natural Stone Furniture Manufacturer, Marble Bathroom Sinks, Granite & Marble Export Worldwide, Onyx Marble Furniture Exporter, Luxury Stone Furniture for Export, Global Supplier of Marble Tiles, High-End Marble Furniture, Wholesale Marble Furniture Exporter." />
        <meta name="author" content="HS Global Export" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="Canonical Tag" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.hsglobalexport.com/" />
        <meta property="og:site_name" content="HS Global Export" />
        <meta property="og:title" content="HS Global Export : Premium Granite & Marble Solutions - Handcrafted Products Manufacturers with Free Delivery | USA | UK" />
        <meta property="og:description" content="Hs Global Export – Best marble furniturers offering premium granite & marble solutions. Handcrafted products with free delivery to USA & UK and across world" />
        <meta property="og:image" content="https://www.hsglobalexport.com/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://www.hsglobalexport.com/" />
        <meta name="twitter:title" content="HS Global Export : Premium Granite & Marble Solutions - Handcrafted Products Manufacturers with Free Delivery | USA | UK" />
        <meta name="twitter:description" content="Hs Global Export – Best marble furniturers offering premium granite & marble solutions. Handcrafted products with free delivery to USA & UK and across world" />
        <meta name="twitter:image" content="https://www.hsglobalexport.com/og-image.jpg" />
      </Helmet>

      <div className="itsbits-home font-sans text-gray-900 bg-white min-h-screen selection:bg-gray-200 overflow-x-hidden">
        <HomePage />
      </div>
    </>
  );
};

export default Home;
