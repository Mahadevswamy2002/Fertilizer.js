import React, { useState } from 'react';
import "./PaymentCss.css";
import payment from "../images/payment.jpg";

function Payment({ clearCart, cart, saveOrder }) {
  const [paymentMethod, setPaymentMethod] = useState('');

  const handlePayment = () => {
    if (cart.length === 0) {
      alert('Your cart is empty. Please add items to the cart before proceeding to payment.');
      return;
    }

    if (paymentMethod) {
      const order = {
        orderID: Math.floor(Math.random() * 10000), // Example order ID
        paymentMethod: paymentMethod,
        totalAmount: cart.reduce((total, item) => total + parseFloat(item.price.replace('Rs', '')), 0), // Calculate total amount
    
        items: cart,
      };
      saveOrder(order); // Save order
      clearCart(); // Clear the cart after successful payment
      alert(`Payment successful with Rs{paymentMethod}`);
    } else {
      alert('Please select a payment method');
    }
  };

  return (
    <div className="payment">
      <h1>Payment</h1>
      <p>Select a payment method:</p>
      <div>
        <label>
          <input 
            type="radio" 
            value="Cash on Delivery" 
            checked={paymentMethod === 'Cash on Delivery'} 
            onChange={(e) => setPaymentMethod(e.target.value)} 
          />
          Cash on Delivery
        </label>
        <label>
          <input 
            type="radio" 
            value="Online Payment" 
            checked={paymentMethod === 'Online Payment'} 
            onChange={(e) => setPaymentMethod(e.target.value)} 
          />
          Online Payment
        </label>
        {paymentMethod === 'Online Payment' && (
          <div className="payment-methods-image">
            <img src={payment} alt="Available Online Payment Methods" />
          </div>
        )}
      </div>
      <button onClick={handlePayment}>Proceed to Pay</button>
    </div>
  );
}

export default Payment;


