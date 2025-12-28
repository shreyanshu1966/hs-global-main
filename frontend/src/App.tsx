import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Layout from "./components/Layout";
import LoadingSpinner from "./components/LoadingSpinner";
import ScrollToTop from "./components/ScrollToTop";
import InitialUserForm from "./components/InitialUserForm";
import SmoothScroll from "./components/SmoothScroll";

import Home from "./pages/Home";
import About from "./pages/About";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Gallery from "./pages/Gallery";
import GalleryDetails from "./pages/GalleryDetails";
import Contact from "./pages/Contact";
import Services from "./pages/Services";

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [showInitialForm, setShowInitialForm] = useState(false);
  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisited");
    const hasSubmittedForm = localStorage.getItem("hasSubmittedForm");
    if (hasSubmittedForm === "true") {
      setShowInitialForm(false);
    }

    if (!hasVisited) {
      localStorage.setItem("hasVisited", "true");
    }
  }, []);
  const handleFormSubmit = (data: {
    name: string;
    email: string;
    phone: string;
    requirements: string;
  }) => {
    const templateParams = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      requirements: data.requirements,
    };
    // Optionally send via EmailJS as well using shared helper
    // import("@emailjs/browser").then(({ default: emailjs }) =>
    //   emailjs
    //     .send((import.meta as any).env.VITE_EMAILJS_SERVICE_ID || 'service_6byqj89', (import.meta as any).env.VITE_EMAILJS_TEMPLATE_POPUP || 'template_83tzsh9', templateParams, {
    //       publicKey: (import.meta as any).env.VITE_EMAILJS_PUBLIC_KEY || 'xBA-VAyjd8xdlmmZu',
    //     })
    //     .catch(console.error)
    // );
    console.log("Form submitted:", data);
    localStorage.setItem("hasSubmittedForm", "true");
    localStorage.setItem("userDetails", JSON.stringify(data));
    setShowInitialForm(false);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }
  return (
    <HelmetProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <SmoothScroll>
          <ScrollToTop />
          <Layout>
            {showInitialForm && <InitialUserForm onSubmit={handleFormSubmit} />}

            <Routes>
              <Route path="*" element={<div>404 Not Found</div>} />
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/products" element={<Products />} />
              <Route path="/productsinfo/:id" element={<ProductDetails />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/gallery/:id" element={<GalleryDetails />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/services" element={<Services />} />
            </Routes>

          </Layout>
        </SmoothScroll>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
