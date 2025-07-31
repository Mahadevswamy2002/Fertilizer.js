import React, { useState } from 'react';
import "./ProfileCss.css"

function Profile({ user, saveAddress }) {
  const [isEditing, setIsEditing] = useState(false);
  const [address, setAddress] = useState(user?.address || '');

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
  };

  const handleAddressSave = () => {
    saveAddress(address);
    setIsEditing(false);
  };

  return (
    <div className="profile">
      <h1>Profile</h1>
      {user ? (
        <>
          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>
          <h2>Address</h2>
          {isEditing ? (
            <div className="address-edit">
              <textarea
                value={address}
                onChange={handleAddressChange}
                rows="4"
              ></textarea>
              <button onClick={handleAddressSave}>Save</button>
            </div>
          ) : (
            <div className="address-display">
              <p>{address || "No address provided"}</p>
              <button onClick={handleEditToggle}>Edit Address</button>
            </div>
          )}
          <h2>My Orders</h2>
          {Array.isArray(user.orders) && user.orders.length > 0 ? (
            <div className="orders">
              {user.orders.map((order, index) => (
                <div key={index} className="order">
                  <h3>Order ID: {order.orderID}</h3>
                  <p>Payment Method: {order.paymentMethod}</p>
                  <p>Total Amount: Rs{order.totalAmount.toFixed(2)}</p>
                  <p>Shipping Address: {user.address}</p> {/* Display the address */}
                  {order.items.map((item, idx) => (
                    <div key={idx} className="order_item">
                      <img src={item.image} alt={item.name} />
                      <div className="order_item_details">
                        <h3>{item.name}</h3>
                        <p>{item.description}</p>
                        <p>Quantity: {item.size}</p>
                        <p>Price: {item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <p>No orders placed yet.</p>
          )}
        </>
      ) : (
        <p>Please <a href="/login">login</a> to see your profile.</p>
      )}
    </div>
  );
}

export default Profile;
