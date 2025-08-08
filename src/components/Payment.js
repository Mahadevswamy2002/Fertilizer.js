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
      <div className="payment">
        <h1>Payment</h1>
        <p>Please login to proceed with payment.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="payment">
        <h1>Payment</h1>
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="payment">
        <h1>Payment</h1>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Your cart is empty.</p>
          <button onClick={() => navigate('/products')}>Continue Shopping</button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment">
      <h1>Checkout</h1>

      {/* Order Summary */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>Order Summary</h2>
        {cart.items.map((item) => (
          <div key={`${item.product._id}-${item.size}`} style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '10px 0',
            borderBottom: '1px solid #eee'
          }}>
            <span>{item.product.name} x {item.quantity}</span>
            <span>Rs.{(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '15px 0',
          fontWeight: 'bold',
          fontSize: '18px',
          borderTop: '2px solid #ddd',
          marginTop: '10px'
        }}>
          <span>Total: Rs.{cart.totalPrice.toFixed(2)}</span>
        </div>
      </div>

      {/* Shipping Address */}
      <div style={{ marginBottom: '30px' }}>
        <h2>Shipping Address</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={shippingAddress.name}
            onChange={handleAddressChange}
            required
            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={shippingAddress.phone}
            onChange={handleAddressChange}
            required
            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <input
            type="text"
            name="street"
            placeholder="Street Address"
            value={shippingAddress.street}
            onChange={handleAddressChange}
            required
            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px', gridColumn: '1 / -1' }}
          />
          <input
            type="text"
            name="city"
            placeholder="City"
            value={shippingAddress.city}
            onChange={handleAddressChange}
            required
            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <input
            type="text"
            name="state"
            placeholder="State"
            value={shippingAddress.state}
            onChange={handleAddressChange}
            required
            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <input
            type="text"
            name="zipCode"
            placeholder="ZIP Code"
            value={shippingAddress.zipCode}
            onChange={handleAddressChange}
            required
            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
      </div>

      {/* Payment Method */}
      <div style={{ marginBottom: '30px' }}>
        <h2>Payment Method</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="radio"
              value="cash_on_delivery"
              checked={paymentMethod === 'cash_on_delivery'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            Cash on Delivery
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="radio"
              value="upi"
              checked={paymentMethod === 'upi'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            UPI Payment
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="radio"
              value="net_banking"
              checked={paymentMethod === 'net_banking'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            Net Banking
          </label>
          {(paymentMethod === 'upi' || paymentMethod === 'net_banking') && (
            <div className="payment-methods-image" style={{ marginTop: '15px' }}>
              <img src={payment} alt="Available Online Payment Methods" style={{ maxWidth: '100%', height: 'auto' }} />
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handlePayment}
        disabled={processing}
        style={{
          width: '100%',
          padding: '15px',
          fontSize: '18px',
          background: processing ? '#ccc' : '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: processing ? 'not-allowed' : 'pointer'
        }}
      >
        {processing ? 'Processing...' : `Place Order - Rs.${cart.totalPrice.toFixed(2)}`}
      </button>
    </div>
  );
}

export default Payment;


