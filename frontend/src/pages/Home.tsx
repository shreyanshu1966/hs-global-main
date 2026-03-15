import { Helmet } from "react-helmet-async";
import Header from "../components/itsbits/Header";
import Footer from "../components/itsbits/Footer";
import HomePage from "../components/itsbits/HomePage";
import "../styles/itsbits-home.css";

const Home = () => {
  return (
    <>
      <Helmet>
        <title>HS Global Export | Premium Marble and Granite Solutions</title>
        <meta name="description" content="Explore HS Global's premium marble, granite, custom fabrication, and global export services for luxury interiors and architectural projects." />
      </Helmet>

      <div className="itsbits-home font-sans text-gray-900 bg-white min-h-screen selection:bg-gray-200 overflow-x-hidden">
        <Header />
        <HomePage />
        <Footer />
      </div>
    </>
  );
};

export default Home;
