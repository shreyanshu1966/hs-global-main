import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Search, FileX } from "lucide-react";

const NotFound = () => {

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.6 }
  };

  const textVariants = {
    initial: { y: 30, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  const iconVariants = {
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.6, ease: "backOut" }
  };

  const buttonVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.6, delay: 0.3 }
  };

  return (
    <div className="bg-[#FFFFFF] text-gray-900 min-h-[80vh] flex items-center justify-center pt-24 md:pt-32">
      <Helmet>
        <title>Page Not Found | HS Global Export</title>
        <meta name="description" content="The page you are looking for could not be found. Return to HS Global Export homepage or explore our products and services." />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://hsglobalexport.com/404" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Page Not Found | HS Global Export" />
        <meta property="og:description" content="The page you are looking for could not be found. Return to HS Global Export homepage." />
        <meta property="og:url" content="https://hsglobalexport.com/404" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Page Not Found | HS Global Export" />
        <meta name="twitter:description" content="The page you are looking for could not be found." />
      </Helmet>

      <motion.div
        className="container mx-auto px-6 text-center max-w-2xl"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        {/* 404 Icon */}
        <motion.div
          className="mb-8 flex justify-center"
          variants={iconVariants}
          initial="initial"
          animate="animate"
        >
          <div className="relative">
            <FileX className="w-24 h-24 text-gray-300" strokeWidth={1} />
            <motion.div
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, -10, 10, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              !
            </motion.div>
          </div>
        </motion.div>

        {/* 404 Text */}
        <motion.div
          className="mb-6"
          variants={textVariants}
          initial="initial"
          animate="animate"
        >
          <h1 className="text-8xl md:text-9xl font-bold text-gray-200 mb-4">
            404
          </h1>
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-700 mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-gray-500 max-w-lg mx-auto leading-relaxed">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          variants={buttonVariants}
          initial="initial"
          animate="animate"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors duration-300 group"
          >
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            Go Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            Go Back
          </button>
        </motion.div>

        {/* Additional Navigation */}
        <motion.div
          className="mt-12 pt-8 border-t border-gray-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            You might be looking for:
          </h3>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/products"
              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-300"
            >
              Products
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              to="/gallery"
              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-300"
            >
              Gallery
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              to="/about"
              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-300"
            >
              About
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              to="/contact"
              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-300"
            >
              Contact
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              to="/services"
              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-300"
            >
              Services
            </Link>
          </div>
        </motion.div>

        {/* Search Suggestion */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="bg-gray-50 rounded-lg p-6">
            <Search className="w-6 h-6 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600">
              Can't find what you're looking for? Try searching our products or contact us for assistance.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;