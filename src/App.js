import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./App.css";
import Navbar from "./components/Navbar";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./components/Home";
import Products from "./components/ProductCard";
import Cart from "./components/Cart";
import Profile from "./components/Profile";
import Payment from "./components/Payment";
import Login from "./components/Login";
import AboutUs from "./components/AboutUs";
import { AuthProvider } from "./contexts/AuthContext";
import { ProductModalProvider } from "./contexts/ProductModalContext";
import productService from "./services/productService";
import fallbackProducts from "./data/fallbackProducts";

function App() {
  const [products, setProducts] = useState(fallbackProducts);

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const result = await productService.getProducts();
        if (result.success) {
          setProducts(result.products);
        } else {
          setProducts(fallbackProducts);
        }
      } catch (err) {
        setProducts(fallbackProducts);
      }
    };

    fetchProducts();
  }, []);

  return (
    <AuthProvider>
      <ProductModalProvider>
        <Router>
          <ScrollToTop />
          <div className="App">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home products={products} />} />
              <Route path="/products" element={<Products products={products} />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/login" element={<Login />} />
              <Route path="/about" element={<AboutUs />} />
            </Routes>
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </div>
        </Router>
      </ProductModalProvider>
    </AuthProvider>
  );
}

export default App;
