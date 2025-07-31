import React, { useState } from "react";
import "./ProductsCss.css";

function Product({ product = {}, addToCart }) {
  const [size, setSize] = useState("");

  const handleAddToCart = () => {
    if (size) {
      addToCart(product, size);
    } else {
      alert("Please select Quantity");
    }
  };

  return (
    <div className="product">
      <img
        src={product.image}
        alt={product.name || "Product Image"}
      />
      <h2>{product.name || "Product Name"}</h2>
      <p>{product.description || "Product Description"}</p>
      <h3>Rs.{product.price || "0.00"}</h3>
      <select value={size} onChange={(e) => setSize(e.target.value)}>
        <option value="">Select quantity</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
      </select>
      <button onClick={handleAddToCart}>Add to cart</button>
    </div>
  );
}

export default Product;
