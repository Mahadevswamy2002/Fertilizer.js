const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
require('dotenv').config();

async function testOrderFlow() {
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
    console.log('📦 Product found:', product.name, 'Stock:', product.stock, 'Active:', product.isActive);

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

    // 4. Test cart population (like in order creation)
    const populatedCart = await Cart.findOne({ user: user._id })
      .populate('items.product', 'name title image price stock isActive');

    console.log('\n🔍 Cart Debug Info:');
    console.log('Cart ID:', populatedCart._id);
    console.log('Total Items:', populatedCart.totalItems);
    console.log('Total Price:', populatedCart.totalPrice);

    if (populatedCart.items.length > 0) {
      const item = populatedCart.items[0];
      console.log('\n📋 First Cart Item:');
      console.log('- Product exists:', !!item.product);
      console.log('- Product ID:', item.product?._id);
      console.log('- Product name:', item.product?.name);
      console.log('- Product isActive:', item.product?.isActive);
      console.log('- Product stock:', item.product?.stock);
      console.log('- Item quantity:', item.quantity);
      console.log('- Item price:', item.price);

      // 5. Test the validation logic from order creation
      console.log('\n🧪 Testing Order Validation:');
      
      if (!item.product) {
        console.log('❌ FAIL: Product not found');
      } else if (item.product.isActive === false) {
        console.log('❌ FAIL: Product not active');
      } else if (item.product.stock < item.quantity) {
        console.log('❌ FAIL: Insufficient stock');
      } else {
        console.log('✅ PASS: Item validation successful');
      }
    }

    console.log('\n🎯 Test completed successfully!');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log(error.stack);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

testOrderFlow();
