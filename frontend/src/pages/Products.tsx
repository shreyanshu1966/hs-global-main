import React from "react";
import { Helmet } from "react-helmet-async";
import { ProductsModernVariant } from "../components/ProductsModernVariant";

const Products = () => {
  return (
    <>
      <Helmet>
        {/* Basic SEO */}
        <title>Premium Granite & Marble Products | HS Global Export</title>
        <meta name="description" content="Explore our extensive collection of premium granite, marble, sandstone, and natural stone products. Custom furniture and slabs for luxury interiors and architecture." />
        <meta name="keywords" content="granite products, marble slabs, natural stone, stone furniture, granite countertops, marble tiles, sandstone, onyx, travertine, luxury stone products" />
        <meta name="author" content="HS Global Export" />
        <meta name="robots" content="index, follow" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://hsglobalexport.com/products" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hsglobalexport.com/products" />
        <meta property="og:site_name" content="HS Global Export" />
        <meta property="og:title" content="Premium Granite & Marble Products | HS Global Export" />
        <meta property="og:description" content="Explore our extensive collection of premium granite, marble, sandstone, and natural stone products for luxury interiors." />
        <meta property="og:image" content="https://hsglobalexport.com/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="HS Global Export - Premium Stone Products" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://hsglobalexport.com/products" />
        <meta name="twitter:title" content="Premium Granite & Marble Products | HS Global Export" />
        <meta name="twitter:description" content="Explore our extensive collection of premium granite, marble, and natural stone products." />
        <meta name="twitter:image" content="https://hsglobalexport.com/og-image.jpg" />
        <meta name="twitter:image:alt" content="HS Global Export - Premium Stone Products" />

        {/* Schema.org ItemList */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Premium Stone Products",
            "description": "Collection of premium granite, marble, and natural stone products",
            "url": "https://hsglobalexport.com/products",
            "numberOfItems": "500+",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "item": {
                  "@type": "ProductGroup",
                  "name": "Granite Furniture",
                  "description": "Custom granite furniture including tables, countertops, and decorative pieces"
                }
              },
              {
                "@type": "ListItem",
                "position": 2,
                "item": {
                  "@type": "ProductGroup",
                  "name": "Marble Slabs",
                  "description": "Premium marble slabs in various colors and patterns"
                }
              },
              {
                "@type": "ListItem",
                "position": 3,
                "item": {
                  "@type": "ProductGroup",
                  "name": "Granite Slabs",
                  "description": "High-quality granite slabs for construction and design"
                }
              },
              {
                "@type": "ListItem",
                "position": 4,
                "item": {
                  "@type": "ProductGroup",
                  "name": "Natural Stone Collection",
                  "description": "Sandstone, onyx, travertine, and other natural stones"
                }
              }
            ]
          })}
        </script>
      </Helmet>

      <ProductsModernVariant />
    </>
  );
};

export default Products;
