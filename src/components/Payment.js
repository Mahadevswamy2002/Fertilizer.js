import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import cartService from '../services/cartService';
import orderService from '../services/orderService';
import "./PaymentCss.css";
import payment from "../images/payment.jpg";

function Payment() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    phone: ''
  });
  const { user, isAuthenticated, updateCartCount } = useAuth();
  const navigate = useNavigate();

  // Fetch cart and initialize address
  useEffect(() => {
    const fetchCart = async () => {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      try {
        const result = await cartService.getCart();
        if (result.success) {
          setCart(result.cart);

          // Pre-fill address from user profile
          if (user?.address) {
            setShippingAddress({
              name: user.name || '',
              street: user.address.street || '',
              city: user.address.city || '',
              state: user.address.state || '',
              zipCode: user.address.zipCode || '',
              phone: user.phone || ''
            });
          } else {
            setShippingAddress(prev => ({ ...prev, name: user?.name || '' }));
          }
        } else {
          toast.error('Failed to load cart');
          navigate('/cart');
        }
      } catch (error) {
        toast.error('Failed to load cart');
        navigate('/cart');
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [isAuthenticated, user, navigate]);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const required = ['name', 'street', 'city', 'state', 'zipCode', 'phone'];
    for (const field of required) {
      if (!shippingAddress[field]?.trim()) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    if (!/^\d{10}$/.test(shippingAddress.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    if (!cart || cart.items.length === 0) {
      toast.error('Your cart is empty. Please add items before proceeding.');
      navigate('/cart');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setProcessing(true);
    try {
      const orderData = {
        shippingAddress,
        paymentMethod,
        notes: ''
      };

      const result = await orderService.createOrder(orderData);
      if (result.success) {
        updateCartCount(); // Update cart count in navbar
        toast.success('Order placed successfully!');
        navigate('/profile'); // Redirect to profile to see order history
      } else {
        toast.error(result.message || 'Failed to place order');
      }
    } catch (error) {
      toast.error('Failed to place order');
    } finally {
      setProcessing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="checkout-empty-state">
        <div className="empty-state-card">
          <h1>Checkout</h1>
          <p>Please login to proceed with your checkout.</p>
          <button className="primary-btn" onClick={() => navigate('/login')}>Login Now</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="checkout-loading-state">
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <p>Preparing checkout...</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="checkout-empty-state">
        <div className="empty-state-card">
          <h1>Checkout</h1>
          <p>Your cart is currently empty. Add some quality farm supplies to get started!</p>
          <button className="primary-btn" onClick={() => navigate('/products')}>Browse Products</button>
        </div>
      </div>
    );
  }

  // Calculate order totals (matching backend routes/orders.js exactly)
  const subtotal = cart.totalPrice;
  const tax = Math.round(subtotal * 0.18 * 100) / 100; // 18% GST
  const shipping = subtotal > 500 ? 0 : 50; // Free shipping above ₹500
  const totalAmount = subtotal + tax + shipping;

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <h1>Checkout</h1>
        <p className="checkout-subtitle">Secure order placement and address verification</p>
      </div>

      <div className="checkout-layout">
        {/* Left Column: Shipping & Payment Info */}
        <div className="checkout-main">
          {/* Shipping Address */}
          <div className="checkout-section-card">
            <h2 className="section-title">
              <span className="section-number">1</span> Shipping Address
            </h2>
            <div className="address-form-grid">
              <div className="form-group">
                <label className="input-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="e.g. Rahul Sharma"
                  value={shippingAddress.name}
                  onChange={handleAddressChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="input-label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  placeholder="10-digit mobile number"
                  value={shippingAddress.phone}
                  onChange={handleAddressChange}
                  required
                />
              </div>
              <div className="form-group col-span-2">
                <label className="input-label">Street Address</label>
                <input
                  type="text"
                  name="street"
                  className="form-input"
                  placeholder="Flat/House no., Colony, Street"
                  value={shippingAddress.street}
                  onChange={handleAddressChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="input-label">City</label>
                <input
                  type="text"
                  name="city"
                  className="form-input"
                  placeholder="City"
                  value={shippingAddress.city}
                  onChange={handleAddressChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="input-label">State</label>
                <input
                  type="text"
                  name="state"
                  className="form-input"
                  placeholder="State"
                  value={shippingAddress.state}
                  onChange={handleAddressChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="input-label">ZIP Code</label>
                <input
                  type="text"
                  name="zipCode"
                  className="form-input"
                  placeholder="6-digit PIN code"
                  value={shippingAddress.zipCode}
                  onChange={handleAddressChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="checkout-section-card">
            <h2 className="section-title">
              <span className="section-number">2</span> Payment Method
            </h2>
            <div className="payment-options-list">
              <label className={`payment-option-card ${paymentMethod === 'cash_on_delivery' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash_on_delivery"
                  checked={paymentMethod === 'cash_on_delivery'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="payment-radio"
                />
                <div className="payment-option-info">
                  <span className="payment-option-title">Cash on Delivery (COD)</span>
                  <span className="payment-option-desc">Pay with cash when your package is delivered.</span>
                </div>
              </label>

              <label className={`payment-option-card ${paymentMethod === 'upi' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={paymentMethod === 'upi'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="payment-radio"
                />
                <div className="payment-option-info">
                  <span className="payment-option-title">UPI Payment</span>
                  <span className="payment-option-desc">Scan QR or use UPI apps (GPay, PhonePe, Paytm).</span>
                </div>
              </label>

              <label className={`payment-option-card ${paymentMethod === 'net_banking' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="net_banking"
                  checked={paymentMethod === 'net_banking'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="payment-radio"
                />
                <div className="payment-option-info">
                  <span className="payment-option-title">Net Banking</span>
                  <span className="payment-option-desc">Transfer directly via your net banking portal.</span>
                </div>
              </label>

              {(paymentMethod === 'upi' || paymentMethod === 'net_banking') && (
                <div className="payment-methods-preview-box">
                  <img src={payment} alt="Supported Payment Gateways" className="payment-methods-img" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Summary */}
        <div className="checkout-sidebar">
          <div className="checkout-summary-card">
            <h2 className="summary-title">Order Summary</h2>
            <div className="summary-items-list">
              {cart.items.map((item) => (
                <div key={`${item.product._id}-${item.size}`} className="summary-item-row">
                  <div className="summary-item-details">
                    <span className="item-name">{item.product.name}</span>
                    <span className="item-qty">Qty: {item.quantity}</span>
                  </div>
                  <span className="item-price">Rs.{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="summary-totals-box">
              <div className="totals-row">
                <span>Product Cost (Subtotal)</span>
                <span>Rs.{subtotal.toFixed(2)}</span>
              </div>
              <div className="totals-row">
                <span>GST (18% Tax)</span>
                <span>Rs.{tax.toFixed(2)}</span>
              </div>
              <div className="totals-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="shipping-free">FREE</span> : `Rs.${shipping.toFixed(2)}`}</span>
              </div>
              <div className="totals-row grand-total-row">
                <span>Total Cost</span>
                <span>Rs.{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <button
              className="place-order-btn"
              onClick={handlePayment}
              disabled={processing}
            >
              {processing ? 'Processing Order...' : `Place Order • Rs.${totalAmount.toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;


