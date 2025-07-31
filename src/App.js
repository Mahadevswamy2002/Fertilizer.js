import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Products from "./components/ProductCard";
import Cart from "./components/Cart";
import Profile from "./components/Profile";
import Payment from "./components/Payment";
import Login from "./components/Login";
import AboutUs from "./components/AboutUs"; 
  // Import About Us component

import fertilizer1 from "./images/fertilizer1.png";
import fertilizer2 from "./images/fertilizer2.png";
import fertilizer3 from "./images/fertilizer3.png";
import fertilizer4 from "./images/fertilizer4.png";
import fertilizer5 from "./images/fertilizer5.png";
import fertilizer6 from "./images/fertilizer6.png";
import fertilizer7 from "./images/fertilizer7.png";
import fertilizer8 from "./images/fertilizer8.png";
import fertilizer9 from "./images/fertilizer9.jpeg";
import fertilizer10 from "./images/fertilizer10.jpeg";
import fertilizer11 from "./images/fertilizer11.jpeg";
import fertilizer12 from "./images/fertilizer12.jpeg";



function App() {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState({ name: "", email: "", address: "", orders: [] });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const products = [
    {
      id: 1,
      image: fertilizer1,
      alt: "fertilizer",
      name: "Cottonseed Meal",
      title: "6% N, 3% P, 1% K",
      description:
        "A common plant fertilizer in areas where cotton is grown, this is a favored year-end, pre-winter mix.",
      price: "999",
      stars: 5,
    },
    {
      id: 2,
      image: fertilizer2,
      alt: "fertilizer",
      name: "Utkarsh Zincoz",
      title: "Zinc Solubilising Bacteria",
      description:
        "It's used to improve plant maturity, increase leaf size, and improve internode length.",
      price: "400",
      stars: 4.5,
    },
    // Add more products as needed
    {
      id: 3,
      image: fertilizer3,
      alt: "fertilizer",
      name: "BACF Humus",
      title: "Potassium Humate",
      description:
        "plant growth promoter and soil conditioner that contains humic acid, fulvic acid, potassium humate.",
      price: "500",
      stars: 4.5,
    },
    {
      id: 4,
      image: fertilizer4,
      alt: "fertilizer",
      name: "Rock Phosphate",
      title: "calcium phosphate, fluoroapatite",
      description:
        "sedimentary rock that contains high levels of phosphate minerals, and is a valuable source of plant nutrients.",
      price: "600",
      stars: 4.5,
    },
    {
      id: 5,
      image: fertilizer5,
      alt: "fertilizer",
      name: "Organic ALFALFA",
      title: " crude protein and fibre, minerals",
      description:
        "A legume hay, cover crop, or green manure that's high in protein and fiber.",
      price: "550",
      stars: 4.5,
    },
    {
      id: 6,
      image: fertilizer6,
      alt: "fertilizer",
      name: "Epsom Salt",
      title: "magnesium sulfate",
      description:
        "help seeds germinate, increase chlorophyll production, and make plants grow bushier. ",
      price: "450",
      stars: 4.5,
    },
    {
      id: 7,
      image: fertilizer7,
      alt: "fertilizer",
      name: "Urea",
      title: "Nitrogen",
      description:
        "nitrogen-rich fertilizer used in agriculture to help plants grow and improve crop yields.",
      price: "600",
      stars: 4.5,
    },
    {
      id: 8,
      image: fertilizer8,
      alt: "fertilizer",
      name: "Amino Gold",
      title: "Amino Acids",
      description:
        " a plant growth promoter that contains amino acids and is used to help plants in many ways.",
      price: "700",
      stars: 4.5,
    },
    {
      id: 9,
      image: fertilizer9,
      alt: "Seeds",
      name: "Bhendi Abhay",
      title: "Bhendi",
      description:
        " Bhendi is a tropical crop that needs warm weather and plenty of sunshine.",
      price: "550",
      stars: 4.5,
    },
    {
      id: 10,
      image: fertilizer10,
      alt: "Seeds",
      name: "Tomato Shankar",
      title: "Tomato",
      description:
        " Top in tomatos. Days to first harvest 62-67 days.",
      price: "460",
      stars: 4.5,
    },
    {
      id: 11,
      image: fertilizer11,
      alt: "Seeds",
      name: "WaterMelon Seeds",
      title: "WaterMelon",
      description:
        " This popular heavy yielding icebox type hybrid matures in 62-65 days.",
      price: "750",
      stars: 4.5,
    },
    {
      id: 12,
      image: fertilizer12,
      alt: "Seeds",
      name: "Chilli Seeds",
      title: "Chilli",
      description:
        " Suitable for cultivation in kharif and rabi seasons under irrigated conditions.",
      price: "950",
      stars: 4.5,
    }
  ];

  const addToCart = (product, size) => {
    setCart([...cart, { ...product, size }]);
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(product => product.id !== productId));
  };

  const handleLogin = (userData) => {
    console.log("User data saved to database:", userData);
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setUser({ name: "", email: "", address: "", orders: [] });
    setIsLoggedIn(false);
  };

  const clearCart = () => {
    setCart([]);
  };

  const saveOrder = (order) => {
    setUser(prevUser => ({
      ...prevUser,
      orders: Array.isArray(prevUser.orders) ? [...prevUser.orders, order] : [order]
    }));
  };

  const saveAddress = (newAddress) => {
    setUser(prevUser => ({
      ...prevUser,
      address: newAddress
    }));
    console.log("Address saved:", newAddress);
  };

  return (
    <Router>
      <div className="App">
        <Navbar
          cartCount={cart.length}
          isLoggedIn={isLoggedIn}
          handleLogout={handleLogout}
        />
        <Routes>
          <Route path="/" element={<Home products={products} addToCart={addToCart} />} />
          <Route path="/products" element={<Products products={products} addToCart={addToCart} />} />
          <Route path="/cart" element={<Cart cart={cart} removeFromCart={removeFromCart} />} />
          <Route path="/profile" element={<Profile user={user} saveAddress={saveAddress} />} />
          <Route 
            path="/payment" 
            element={<Payment clearCart={clearCart} cart={cart} saveOrder={saveOrder} />} 
          />
          <Route path="/login" element={<Login handleLogin={handleLogin} />} />
          <Route path="/about" element={<AboutUs />} /> {/* Added About Us route */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
