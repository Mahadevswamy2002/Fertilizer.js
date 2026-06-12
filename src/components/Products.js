import React, { useState } from "react";
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import cartService from '../services/cartService';
import { getProductImage } from '../utils/imageMapper';
import "./ProductsCss.css";

function Product({ product = {}, onProductClick }) {
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

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'fertilizer': return 'Fertilizer';
      case 'seeds': return 'Seeds';
      case 'organic': return 'Organic';
      case 'pesticides': return 'Pesticide';
      default: return cat;
    }
  };

  return (
    <div className="product">
      <div 
        className="product-image-container product-clickable" 
        onClick={() => onProductClick && onProductClick(product)}
      >
        <img
          src={getProductImage(product.image)}
          alt={product.name || "Product Image"}
          className="product-image"
        />
        {product.category && (
          <span className={`product-badge badge-${product.category}`}>
            {getCategoryLabel(product.category)}
          </span>
        )}
      </div>
      <div className="product-info">
        <h2 
          className="product-name product-clickable" 
          onClick={() => onProductClick && onProductClick(product)}
        >
          {product.name || "Product Name"}
        </h2>
        <div className="product-rating">
          <span className="stars">
            {'★'.repeat(Math.floor(product.stars || 0))}
            {'☆'.repeat(5 - Math.floor(product.stars || 0))}
          </span>
          <span className="rating-num"> ({product.stars || 0})</span>
        </div>
        <p className="product-desc">{product.description || "Product Description"}</p>
        <div className="product-price-row">
          <span className="product-price">Rs.{product.price || "0.00"}</span>
          {product.stock !== undefined && (
            <span className={`product-stock ${product.stock <= 0 ? 'stock-out' : product.stock < 10 ? 'stock-low' : 'stock-ok'}`}>
              {product.stock <= 0 ? 'Out of Stock' : product.stock < 10 ? `Only ${product.stock} left!` : 'In Stock'}
            </span>
          )}
        </div>
      </div>
      <div className="product-actions">
        <select className="product-qty-select" value={quantity} onChange={(e) => setQuantity(e.target.value)}>
          <option value="">Qty</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
        <button
          className="product-add-btn"
          onClick={handleAddToCart}
          disabled={loading || (product.stock !== undefined && product.stock <= 0)}
        >
          {loading ? 'Adding...' : product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}

export default Product;
