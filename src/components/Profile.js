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

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      confirmed: '#17a2b8',
      processing: '#fd7e14',
      shipped: '#6f42c1',
      delivered: '#28a745',
      cancelled: '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  if (!isAuthenticated) {
    return (
      <div className="profile">
        <h1>Profile</h1>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Please <Link to="/login">login</Link> to view your profile.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="profile">
        <h1>Profile</h1>
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="profile">
      <h1>Profile</h1>

      {/* Profile Information */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Personal Information</h2>
          <button
            onClick={isEditing ? handleProfileSave : handleEditToggle}
            style={{
              padding: '8px 16px',
              background: isEditing ? '#28a745' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {isEditing ? 'Save' : 'Edit'}
          </button>
        </div>

        {isEditing ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label>Phone:</label>
              <input
                type="tel"
                name="phone"
                value={profileData.phone}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label>Email:</label>
              <input
                type="email"
                value={profileData.email}
                disabled
                style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px', background: '#f5f5f5' }}
              />
              <small style={{ color: '#666' }}>Email cannot be changed</small>
            </div>

            <h3 style={{ gridColumn: '1 / -1', marginTop: '20px', marginBottom: '10px' }}>Address</h3>
            <div style={{ gridColumn: '1 / -1' }}>
              <label>Street:</label>
              <input
                type="text"
                name="address.street"
                value={profileData.address.street}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label>City:</label>
              <input
                type="text"
                name="address.city"
                value={profileData.address.city}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label>State:</label>
              <input
                type="text"
                name="address.state"
                value={profileData.address.state}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label>ZIP Code:</label>
              <input
                type="text"
                name="address.zipCode"
                value={profileData.address.zipCode}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label>Country:</label>
              <input
                type="text"
                name="address.country"
                value={profileData.address.country}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
          </div>
        ) : (
          <div>
            <p><strong>Name:</strong> {profileData.name || 'Not provided'}</p>
            <p><strong>Email:</strong> {profileData.email}</p>
            <p><strong>Phone:</strong> {profileData.phone || 'Not provided'}</p>
            <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>Address</h3>
            {profileData.address.street ? (
              <div>
                <p>{profileData.address.street}</p>
                <p>{profileData.address.city}, {profileData.address.state} {profileData.address.zipCode}</p>
                <p>{profileData.address.country}</p>
              </div>
            ) : (
              <p style={{ color: '#666' }}>No address provided</p>
            )}
          </div>
        )}
      </div>

      {/* Orders Section */}
      <div>
        <h2>My Orders</h2>
        {orders.length > 0 ? (
          <div className="orders">
            {orders.map((order) => (
              <div key={order._id} style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h3>Order #{order.orderNumber}</h3>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    background: getStatusColor(order.orderStatus),
                    color: 'white',
                    fontSize: '12px',
                    textTransform: 'uppercase'
                  }}>
                    {order.orderStatus}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <p><strong>Order Date:</strong> {formatDate(order.createdAt)}</p>
                  <p><strong>Payment Method:</strong> {order.paymentMethod.replace('_', ' ').toUpperCase()}</p>
                  <p><strong>Total Amount:</strong> Rs.{order.totalAmount.toFixed(2)}</p>
                  <p><strong>Items:</strong> {order.totalItems}</p>
                </div>

                <h4>Items:</h4>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {order.items.map((item, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '15px',
                      padding: '10px',
                      background: '#f8f9fa',
                      borderRadius: '4px'
                    }}>
                      <img
                        src={getProductImage(item.image)}
                        alt={item.name}
                        style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                      <div style={{ flex: 1 }}>
                        <h5 style={{ margin: '0 0 5px 0' }}>{item.name}</h5>
                        <p style={{ margin: '0', color: '#666' }}>Quantity: {item.quantity}</p>
                        <p style={{ margin: '0', fontWeight: 'bold' }}>Rs.{item.price} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>No orders placed yet.</p>
            <Link to="/products">
              <button style={{ marginTop: '15px', padding: '10px 20px' }}>Start Shopping</button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
