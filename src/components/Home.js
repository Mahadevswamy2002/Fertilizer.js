import React from 'react';
import Product from './Products';
import './HomeCss.css';
import "./ProductsCss.css"

function Home({ products = [] }) {
  return (
    <div className="home">
      <div className="home-interface">
        <h1>Nirmala Agro Agencies </h1>
        <h3>Honest Products For Honest Farmers!</h3>
      </div>
      <div className="home-products">
       <center><h2>Our Products</h2></center> 
        <div className="products">
          {products.map(product => (
            <Product key={product._id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
