const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
require('dotenv').config();

async function testOrderCreation() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 Connected to database');

    // 1. Find or create a test user
    let user = await User.findOne({ email: 'test@example.com' });
    if (!user) {
      console.log('👤 Creating test user...');
      user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
    }
    console.log('✅ User found/created:', user.name);

    // 2. Get a product
    const product = await Product.findOne({ isActive: true });
    if (!product) {
      console.log('❌ No active products found');
      process.exit(1);
    }
    console.log('📦 Product found:', product.name);

    // 3. Create/update cart
    let cart = await Cart.findOne({ user: user._id });
    if (!cart) {
      cart = new Cart({ user: user._id, items: [] });
    }

    // Clear existing items and add test item
    cart.items = [{
      product: product._id,
      quantity: 2,
      price: product.price,
      size: ''
    }];
    await cart.save();
    console.log('🛒 Cart updated with test item');

    // 4. Test order creation
    console.log('\n🧪 Testing Order Creation...');
    
    const orderData = {
      user: user._id,
      items: [{
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: 2,
        size: ''
      }],
      totalItems: 2,
      subtotal: product.price * 2,
      tax: Math.round(product.price * 2 * 0.18 * 100) / 100,
      shipping: 0,
      totalAmount: product.price * 2 + Math.round(product.price * 2 * 0.18 * 100) / 100,
      shippingAddress: {
        name: 'Test User',
        street: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        country: 'India',
        phone: '1234567890'
      },
      paymentMethod: 'cash_on_delivery'
    };

    console.log('📋 Creating order with data:', {
      user: orderData.user,
      totalItems: orderData.totalItems,
      totalAmount: orderData.totalAmount,
      paymentMethod: orderData.paymentMethod
    });

    const order = await Order.create(orderData);
    console.log('✅ Order created successfully!');
    console.log('📄 Order Number:', order.orderNumber);
    console.log('💰 Total Amount:', order.totalAmount);
    console.log('📅 Created At:', order.createdAt);

    console.log('\n🎉 Order creation test passed!');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    if (error.errors) {
      console.log('Validation errors:');
      Object.keys(error.errors).forEach(key => {
        console.log(`- ${key}: ${error.errors[key].message}`);
      });
    }
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

testOrderCreation();
