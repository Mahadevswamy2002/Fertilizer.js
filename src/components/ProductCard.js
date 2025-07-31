import React from "react";
import Product from "./Products";
import "./ProductCardCss.css"

function Products({ products = [], addToCart }) {
  return (
    <div className="productcart">
      <h1>products</h1>
      <div className="products">
        {products.map((product) => (
          <Product key={product.id} product={product} addToCart={addToCart} />
        ))}
      </div>
    </div>
  );
}

export default Products;
