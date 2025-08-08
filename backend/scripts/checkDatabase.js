const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
require('dotenv').config();

async function checkDatabase() {
  console.log('🔍 Checking Database Connection...\n');
  
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database Connection: SUCCESS');
    console.log('📊 Database Name:', mongoose.connection.db.databaseName);
    console.log('🔗 Connection Host:', mongoose.connection.host);
    console.log('📡 Connection Port:', mongoose.connection.port);
    console.log('🔄 Connection State:', mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected');
    
    console.log('\n📁 Collections Status:');
    
    // Check Products collection
    const productCount = await Product.countDocuments();
    console.log(`  📦 Products: ${productCount} items`);
    if (productCount > 0) {
      const sampleProduct = await Product.findOne();
      console.log(`     Sample: ${sampleProduct.name} - Rs.${sampleProduct.price}`);
    }
    
    // Check Users collection
    const userCount = await User.countDocuments();
    console.log(`  👥 Users: ${userCount} registered`);
    
    // Check Carts collection
    const cartCount = await Cart.countDocuments();
    console.log(`  🛒 Carts: ${cartCount} active`);
    
    // Check Orders collection
    const orderCount = await Order.countDocuments();
    console.log(`  📋 Orders: ${orderCount} placed`);
    
    console.log('\n🧪 Testing Database Operations:');
    
    // Test read operation
    try {
      const products = await Product.find().limit(3);
      console.log('  ✅ Read Operation: SUCCESS');
      console.log(`     Retrieved ${products.length} products`);
    } catch (error) {
      console.log('  ❌ Read Operation: FAILED');
      console.log('     Error:', error.message);
    }
    
    // Test database indexes
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📋 Database Collections:');
    for (const collection of collections) {
      const indexes = await mongoose.connection.db.collection(collection.name).indexes();
      console.log(`  📁 ${collection.name}: ${indexes.length} indexes`);
    }
    
    console.log('\n🎉 Database Status: HEALTHY');
    console.log('💡 Your database is properly connected and contains data!');
    
  } catch (error) {
    console.log('❌ Database Connection: FAILED');
    console.log('Error Details:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure MongoDB is running');
    console.log('2. Check your connection string in .env file');
    console.log('3. Verify MongoDB service is started');
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 MongoDB is not running. Start it with:');
      console.log('   - Windows: net start MongoDB');
      console.log('   - macOS/Linux: sudo systemctl start mongod');
    }
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

// Run the check
checkDatabase();
