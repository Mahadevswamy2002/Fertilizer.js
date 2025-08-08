import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import "./NavbarCss.css";

function Navbar() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated, cartCount, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };
  return (     
    <nav id="navbar">       
      <div className="logo" id="logo">         
        <h1>Fertilizer<span>s</span></h1>       
      </div>       
      <ul id="nav-links">         
        <li id="home-link"><Link to="/">Home</Link></li>         
        <li id="products-link"><Link to="/products">Products</Link></li>         
        <li id="cart-link"><Link to="/cart">Cart ({cartCount})</Link></li>
        <li id="about-link"><Link to="/about">About Us</Link></li>
        {isAuthenticated ? (
          <>
            <li id="profile-link"><Link to="/profile">Profile</Link></li>
            <li id="logout-button"><button onClick={handleLogout}>Logout</button></li>
          </>
        ) : (
          <li id="login-link"><Link to="/login">Login</Link></li>
        )}
      </ul>
      <form className="search-form" id="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          id="search-input"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit" id="search-button">Search</button>
      </form>
    </nav>   
  ); 
}  

export default Navbar;
