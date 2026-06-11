import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import userService from '../services/userService';
import orderService from '../services/orderService';
import { getProductImage } from '../utils/imageMapper';
import "./ProfileCss.css"

function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    }
  });
  const { user, isAuthenticated, updateUser } = useAuth();

  // Fetch user profile and orders
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        // Fetch user profile
        const profileResult = await userService.getProfile();
        if (profileResult.success) {
          setProfileData({
            name: profileResult.user.name || '',
            email: profileResult.user.email || '',
            phone: profileResult.user.phone || '',
            address: {
              street: profileResult.user.address?.street || '',
              city: profileResult.user.address?.city || '',
              state: profileResult.user.address?.state || '',
              zipCode: profileResult.user.address?.zipCode || '',
              country: profileResult.user.address?.country || 'India'
            }
          });
        }

        // Fetch orders
        const ordersResult = await orderService.getOrders();
        if (ordersResult.success) {
          setOrders(ordersResult.orders);
        }
      } catch (error) {
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setProfileData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleProfileSave = async () => {
    try {
      const result = await userService.updateProfile(profileData);
      if (result.success) {
        updateUser(result.user);
        toast.success('Profile updated successfully');
        setIsEditing(false);
      } else {
        toast.error(result.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!isAuthenticated) {
    return (
      <div className="profile-unauthenticated-container">
        <div className="profile-unauthenticated-card">
          <div className="profile-unauthenticated-icon-wrapper">
            <svg className="profile-unauthenticated-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <h2>Login to View Profile</h2>
          <p>Access your personal dashboard, address book, and track active order shipments.</p>
          <Link to="/login" className="profile-login-btn">
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="profile-loading-container">
        <div className="spinner"></div>
        <p>Loading your profile details...</p>
      </div>
    );
  }

  return (
    <div className="profile-page-wrapper">
      <div className="profile-header-section">
        <h1>My Account</h1>
        <p>Manage your address, contact info, and track order deliveries.</p>
      </div>

      <div className="profile-grid-container">
        
        {/* Left Column: Personal & Address Information */}
        <div className="profile-left-column">
          <div className="profile-info-card">
            
            {/* User Avatar Initials block */}
            <div className="user-avatar-summary">
              <div className="avatar-circle">
                {getInitials(profileData.name)}
              </div>
              <div className="avatar-meta">
                <h2>{profileData.name || 'Member Account'}</h2>
                <span className="account-badge">🌾 Active Farmer Portal</span>
              </div>
            </div>

            <div className="card-section-header">
              <h3>Personal Details</h3>
              <button
                onClick={isEditing ? handleProfileSave : handleEditToggle}
                className={`edit-save-btn ${isEditing ? 'save-mode' : 'edit-mode'}`}
              >
                {isEditing ? '✓ Save Changes' : '✏️ Edit Profile'}
              </button>
            </div>

            {isEditing ? (
              <div className="profile-form">
                <div className="form-row">
                  <div className="form-group-item">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                  <div className="form-group-item">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleInputChange}
                      placeholder="10-digit phone number"
                    />
                  </div>
                </div>

                <div className="form-group-item disabled-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                  />
                  <small>Email address is locked and cannot be edited.</small>
                </div>

                <div className="address-section">
                  <h4>Delivery Address</h4>
                  <div className="form-group-item">
                    <label>Street Address</label>
                    <input
                      type="text"
                      name="address.street"
                      value={profileData.address.street}
                      onChange={handleInputChange}
                      placeholder="Flat, House no., Building, Street"
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group-item">
                      <label>City</label>
                      <input
                        type="text"
                        name="address.city"
                        value={profileData.address.city}
                        onChange={handleInputChange}
                        placeholder="City"
                      />
                    </div>
                    <div className="form-group-item">
                      <label>State</label>
                      <input
                        type="text"
                        name="address.state"
                        value={profileData.address.state}
                        onChange={handleInputChange}
                        placeholder="State"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group-item">
                      <label>ZIP / Postal Code</label>
                      <input
                        type="text"
                        name="address.zipCode"
                        value={profileData.address.zipCode}
                        onChange={handleInputChange}
                        placeholder="ZIP Code"
                      />
                    </div>
                    <div className="form-group-item">
                      <label>Country</label>
                      <input
                        type="text"
                        name="address.country"
                        value={profileData.address.country}
                        onChange={handleInputChange}
                        placeholder="Country"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="profile-display-details">
                <div className="display-item">
                  <span className="display-label">Email:</span>
                  <span className="display-val">{profileData.email}</span>
                </div>
                <div className="display-item">
                  <span className="display-label">Phone:</span>
                  <span className="display-val">{profileData.phone || <em className="not-provided">Not provided</em>}</span>
                </div>

                <div className="display-address-block">
                  <h4>Default Shipping Address</h4>
                  {profileData.address.street ? (
                    <div className="address-box-display">
                      <p className="addr-street">{profileData.address.street}</p>
                      <p className="addr-city-zip">{profileData.address.city}, {profileData.address.state} - {profileData.address.zipCode}</p>
                      <p className="addr-country">{profileData.address.country}</p>
                    </div>
                  ) : (
                    <div className="address-empty-alert">
                      <p>No default address provided. Click 'Edit Profile' to add shipping details.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order History */}
        <div className="profile-right-column">
          <div className="profile-orders-card">
            <h2>Order History</h2>
            {orders.length > 0 ? (
              <div className="orders-list-wrapper">
                {orders.map((order) => (
                  <div key={order._id} className="order-receipt-card">
                    
                    <div className="order-receipt-header">
                      <div>
                        <span className="order-number-lbl">Order Ref</span>
                        <h3>#{order.orderNumber}</h3>
                      </div>
                      <span className={`order-status-badge ${order.orderStatus.toLowerCase()}`}>
                        {order.orderStatus}
                      </span>
                    </div>

                    <div className="order-receipt-meta-grid">
                      <div className="meta-cell">
                        <span className="meta-lbl">Order Date</span>
                        <span className="meta-val">{formatDate(order.createdAt)}</span>
                      </div>
                      <div className="meta-cell">
                        <span className="meta-lbl">Payment Type</span>
                        <span className="meta-val">{order.paymentMethod.replace('_', ' ').toUpperCase()}</span>
                      </div>
                      <div className="meta-cell">
                        <span className="meta-lbl">Total Items</span>
                        <span className="meta-val">{order.totalItems} articles</span>
                      </div>
                      <div className="meta-cell">
                        <span className="meta-lbl">Total Cost</span>
                        <span className="meta-val cost-accent">Rs.{order.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>

                    <h4 className="receipt-items-title">Purchased Items</h4>
                    <div className="receipt-items-list">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="receipt-item-row">
                          <img
                            src={getProductImage(item.image)}
                            alt={item.name}
                          />
                          <div className="receipt-item-desc">
                            <h5>{item.name}</h5>
                            <div className="receipt-item-details-row">
                              <span>Qty: <strong>{item.quantity}</strong></span>
                              <span>Price: <strong>Rs.{item.price}</strong></span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="profile-orders-empty">
                <div className="empty-orders-icon">🛒</div>
                <h3>No Orders Found</h3>
                <p>You haven't placed any orders yet. Visit our products catalogue to add seeds, fertilizers, or tools to your farm inputs list.</p>
                <Link to="/products" className="start-shopping-btn">
                  Browse Catalog
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Profile;
