import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import cartService from '../services/cartService';
import { getProductImage } from '../utils/imageMapper';
import './CartCss.css';

function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const { isAuthenticated, updateCartCount } = useAuth();

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

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
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
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="cart">
        <h1>Cart</h1>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Please <Link to="/login">login</Link> to view your cart.</p>
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
            onClick={handleClearCart}
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
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Your cart is empty</p>
            <Link to="/products">
              <button style={{ marginTop: '20px' }}>Continue Shopping</button>
            </Link>
          </div>
        )}

        {cartItems.map((item) => (
          <div className="cart_item" key={`${item.product._id}-${item.size}`}>
            <img
              src={getProductImage(item.product.image)}
              alt={item.product.name || 'Product Image'}
            />
            <div className="cart_item_details">
              <h2>{item.product.name || 'Product Name'}</h2>
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
    </div>
  );
}

export default Cart;
