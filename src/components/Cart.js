import React from 'react';
import { Link } from 'react-router-dom';
import './CartCss.css';

function Cart({ cart = [], removeFromCart }) {
  console.log("Cart Items: ", cart); // Debugging line

  return (
    <div className="cart">
      <h1>Cart</h1>
      <div className="cart_items">
        {cart.length === 0 && <p>Your cart is empty</p>}
        {cart.map((item, index) => (
          <div className="cart_item" key={index}>
            <img src={item.image || 'default-image.png'} alt={item.name || 'Product Image'} />
            <div className="cart_item_details">
              <h2>{item.name || 'Product Name'}</h2>
              <p>{item.description || 'Product Description'}</p>
              <h3>Rs.{item.price || '0.00'}</h3>
              <p>Quantity: {item.size || 'N/A'}</p>
              <button onClick={() => removeFromCart(item.id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
      {cart.length > 0 && (
        <Link to="/payment"><button>Proceed to Payment</button></Link>
      )}
    </div>
  );
}

export default Cart;
