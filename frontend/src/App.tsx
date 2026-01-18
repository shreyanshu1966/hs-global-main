import { useEffect, useState, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Layout from "./components/Layout";
import LoadingSpinner from "./components/LoadingSpinner";
import ScrollToTop from "./components/ScrollToTop";
import InitialUserForm from "./components/InitialUserForm";
import SmoothScroll from "./components/SmoothScroll";
import { AuthProvider } from "./contexts/AuthContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";

// Lazy load pages for better performance
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Gallery = lazy(() => import("./pages/Gallery"));
const GalleryDetails = lazy(() => import("./pages/GalleryDetails"));
const Contact = lazy(() => import("./pages/Contact"));
const Services = lazy(() => import("./pages/Services"));
const Blogs = lazy(() => import("./pages/Blogs"));
const BlogDetail = lazy(() => import("./pages/BlogDetail"));
const Checkout = lazy(() => import("./pages/Checkout"));
const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Profile = lazy(() => import("./pages/Profile"));
const OrderDetails = lazy(() => import("./pages/OrderDetails"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const LoginOTP = lazy(() => import("./pages/LoginOTP"));
const Admin = lazy(() => import("./pages/Admin"));
import { ProtectedRoute } from "./components/ProtectedRoute";

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
        <CurrencyProvider>
          <AuthProvider>
            <SmoothScroll>
              <ScrollToTop />
              <Layout>
                {showInitialForm && <InitialUserForm onSubmit={handleFormSubmit} />}

                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:id" element={<ProductDetails />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route path="/gallery/:id" element={<GalleryDetails />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/blog" element={<Blogs />} />
                    <Route path="/blog/:slug" element={<BlogDetail />} />
                    <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                    <Route path="/checkout-success" element={<ProtectedRoute><CheckoutSuccess /></ProtectedRoute>} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/login-otp" element={<LoginOTP />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />
                    <Route path="/verify-email/:token" element={<VerifyEmail />} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/orders/:orderId" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
                    <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                    <Route path="*" element={<div>404 Not Found</div>} />
                  </Routes>
                </Suspense>

              </Layout>
            </SmoothScroll>
          </AuthProvider>
        </CurrencyProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
