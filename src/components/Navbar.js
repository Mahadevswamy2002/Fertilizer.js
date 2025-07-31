import React from 'react'; 
import { Link } from 'react-router-dom'; 
import "./NavbarCss.css";  

function Navbar({ cartCount, isLoggedIn, handleLogout }) {   
  return (     
    <nav id="navbar">       
      <div className="logo" id="logo">         
        <h1>Fertilizer<span>s</span></h1>       
      </div>       
      <ul id="nav-links">         
        <li id="home-link"><Link to="/">Home</Link></li>         
        <li id="products-link"><Link to="/products">Products</Link></li>         
        <li id="cart-link"><Link to="/cart">Cart ({cartCount})</Link></li>         
        <li id="about-link"><Link to="/about">About Us</Link></li> {/* About Us link */}         
        {isLoggedIn ? (           
          <>             
            <li id="profile-link"><Link to="/profile">Profile</Link></li>             
            <li id="logout-button"><button onClick={handleLogout}>Logout</button></li>           
          </>         
        ) : (           
          <li id="login-link"><Link to="/login">Login</Link></li>         
        )}       
      </ul>       
      <div className="search-form" id="search-form">         
        <input type="text" id="search-input" placeholder="Search..." />         
        <button id="search-button">Search</button>       
      </div>     
    </nav>   
  ); 
}  

export default Navbar;
