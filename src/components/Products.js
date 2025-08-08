import React, { useState } from "react";
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import cartService from '../services/cartService';
import { getProductImage } from '../utils/imageMapper';
import "./ProductsCss.css";

function Product({ product = {} }) {
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, updateCartCount } = useAuth();

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    if (!quantity) {
      toast.error("Please select quantity");
      return;
    }

    setLoading(true);
    try {
      const result = await cartService.addToCart(product._id, parseInt(quantity));
      if (result.success) {
        toast.success(`${product.name} added to cart!`);
        updateCartCount(); // Update cart count in navbar
        setQuantity(""); // Reset quantity selection
      } else {
        toast.error(result.message || 'Failed to add item to cart');
      }
    } catch (error) {
      toast.error('Failed to add item to cart');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product">
      <img
        src={getProductImage(product.image)}
        alt={product.name || "Product Image"}
      />
      <h2>{product.name || "Product Name"}</h2>
      <p>{product.description || "Product Description"}</p>
      <h3>Rs.{product.price || "0.00"}</h3>
      <div className="product-rating">
        {'★'.repeat(Math.floor(product.stars || 0))}
        {'☆'.repeat(5 - Math.floor(product.stars || 0))}
        <span> ({product.stars || 0})</span>
      </div>
      <select value={quantity} onChange={(e) => setQuantity(e.target.value)}>
        <option value="">Select quantity</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
      </select>
      <button
        onClick={handleAddToCart}
        disabled={loading || (product.stock !== undefined && product.stock <= 0)}
        style={{
          opacity: loading || (product.stock !== undefined && product.stock <= 0) ? 0.6 : 1,
          cursor: loading || (product.stock !== undefined && product.stock <= 0) ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Adding...' : (product.stock !== undefined && product.stock <= 0) ? 'Out of Stock' : 'Add to cart'}
      </button>
      {product.stock !== undefined && (
        <p style={{ color: product.stock < 10 ? 'orange' : 'green', fontSize: '12px', margin: '5px 0' }}>
          {product.stock < 10 ? `Only ${product.stock} left in stock!` : `${product.stock} in stock`}
        </p>
      )}
    </div>
  );
}

export default Product;
