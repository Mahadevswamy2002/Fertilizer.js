import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { useProductModal } from '../contexts/ProductModalContext';
import cartService from '../services/cartService';
import { getProductImage } from '../utils/imageMapper';
import './CartCss.css';

function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const { isAuthenticated, updateCartCount } = useAuth();
  const { openProductModal } = useProductModal();

  // Fetch cart on component mount
  useEffect(() => {
    const fetchCart = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        const result = await cartService.getCart();
        if (result.success) {
          setCart(result.cart);
        } else {
          toast.error('Failed to load cart');
        }
      } catch (error) {
        toast.error('Failed to load cart');
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [isAuthenticated]);

  const handleRemoveItem = async (productId) => {
    setUpdating(prev => ({ ...prev, [productId]: true }));
    try {
      const result = await cartService.removeFromCart(productId);
      if (result.success) {
        setCart(result.cart);
        updateCartCount();
        toast.success('Item removed from cart');
      } else {
        toast.error(result.message || 'Failed to remove item');
      }
    } catch (error) {
      toast.error('Failed to remove item');
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    setUpdating(prev => ({ ...prev, [productId]: true }));
    try {
      const result = await cartService.updateCartItem(productId, newQuantity);
      if (result.success) {
        setCart(result.cart);
        updateCartCount();
      } else {
        toast.error(result.message || 'Failed to update quantity');
      }
    } catch (error) {
      toast.error('Failed to update quantity');
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleClearCartClick = () => {
    setClearModalOpen(true);
  };

  const handleClearCartConfirm = async () => {
    setClearModalOpen(false);
    setLoading(true);
    try {
      const result = await cartService.clearCart();
      if (result.success) {
        setCart(result.cart);
        updateCartCount();
        toast.success('Cart cleared');
      } else {
        toast.error('Failed to clear cart');
      }
    } catch (error) {
      toast.error('Failed to clear cart');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="cart-unauthenticated-container">
        <div className="cart-unauthenticated-card">
          <div className="cart-unauthenticated-icon-wrapper">
            <svg className="cart-unauthenticated-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </div>
          <h2>Login to View Your Cart</h2>
          <p>Please sign in to access your items, review active selections, and proceed to payment details.</p>
          <Link to="/login" className="cart-login-btn">
            Sign In Now
          </Link>
          <div className="cart-continue-link">
            <Link to="/products">Or continue shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="cart">
        <h1>Cart</h1>
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      </div>
    );
  }

  const cartItems = cart?.items || [];
  const totalPrice = cart?.totalPrice || 0;

  return (
    <div className="cart">
      <h1>Cart</h1>

      {cartItems.length > 0 && (
        <div style={{ textAlign: 'right', marginBottom: '20px' }}>
          <button
            onClick={handleClearCartClick}
            style={{
              background: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Clear Cart
          </button>
        </div>
      )}

      <div className="cart_items">
        {cartItems.length === 0 && (
          <div className="cart-empty-container">
            <div className="cart-empty-card">
              <div className="cart-empty-icon-wrapper">
                <svg className="cart-empty-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  <line x1="17" y1="12" x2="11" y2="12"></line>
                </svg>
              </div>
              <h2>Your Cart is Empty</h2>
              <p>Looks like you haven't added any products to your cart yet. Explore our top quality seeds and fertilizers to get started.</p>
              <Link to="/products" className="cart-empty-shop-btn">
                Start Shopping
              </Link>
            </div>
          </div>
        )}

        {cartItems.map((item) => (
          <div className="cart_item" key={`${item.product._id}-${item.size}`}>
            <img
              className="product-clickable"
              src={getProductImage(item.product.image)}
              alt={item.product.name || 'Product Image'}
              onClick={() => openProductModal(item.product)}
            />
            <div className="cart_item_details">
              <h2 
                className="product-clickable"
                onClick={() => openProductModal(item.product)}
              >
                {item.product.name || 'Product Name'}
              </h2>
              <p>{item.product.title || 'Product Title'}</p>
              <h3>Rs.{item.price || '0.00'} each</h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '10px 0' }}>
                <label>Quantity:</label>
                <button
                  onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                  disabled={updating[item.product._id] || item.quantity <= 1}
                  style={{ padding: '5px 10px' }}
                >
                  -
                </button>
                <span style={{ padding: '0 10px', fontWeight: 'bold' }}>
                  {item.quantity}
                </span>
                <button
                  onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                  disabled={updating[item.product._id]}
                  style={{ padding: '5px 10px' }}
                >
                  +
                </button>
              </div>

              <p><strong>Subtotal: Rs.{(item.price * item.quantity).toFixed(2)}</strong></p>

              <button
                onClick={() => handleRemoveItem(item.product._id)}
                disabled={updating[item.product._id]}
                style={{
                  background: '#dc3545',
                  color: 'white',
                  opacity: updating[item.product._id] ? 0.6 : 1
                }}
              >
                {updating[item.product._id] ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {cartItems.length > 0 && (
        <div style={{
          borderTop: '2px solid #ddd',
          paddingTop: '20px',
          marginTop: '20px',
          textAlign: 'right'
        }}>
          <h2>Total: Rs.{totalPrice.toFixed(2)}</h2>
          <Link to="/payment">
            <button style={{
              background: '#28a745',
              color: 'white',
              padding: '12px 24px',
              fontSize: '16px',
              marginTop: '10px'
            }}>
              Proceed to Payment
            </button>
          </Link>
        </div>
      )}
      {clearModalOpen && (
        <div className="clear-modal-overlay" onClick={() => setClearModalOpen(false)}>
          <div className="clear-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="clear-modal-icon">🗑️</div>
            <h3>Clear Shopping Cart</h3>
            <p className="clear-modal-text">Are you sure you want to remove all items from your cart?</p>
            <p className="clear-modal-warn">This action cannot be undone. You will lose all your currently selected items and quantities.</p>
            <div className="clear-modal-actions">
              <button className="confirm-clear-btn" onClick={handleClearCartConfirm}>Yes, Clear Cart</button>
              <button className="close-clear-btn" onClick={() => setClearModalOpen(false)}>No, Keep Items</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
