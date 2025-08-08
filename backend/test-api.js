const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testAPI() {
  try {
    console.log('🧪 Testing Fertilizer E-commerce API...\n');

    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check:', healthResponse.data.message);

    // Test 2: Get Products
    console.log('\n2. Testing Get Products...');
    const productsResponse = await axios.get(`${BASE_URL}/products`);
    console.log(`✅ Products Retrieved: ${productsResponse.data.count} products found`);
    console.log(`   Total Products: ${productsResponse.data.total}`);

    // Test 3: Get Single Product
    if (productsResponse.data.products.length > 0) {
      const firstProduct = productsResponse.data.products[0];
      console.log('\n3. Testing Get Single Product...');
      const singleProductResponse = await axios.get(`${BASE_URL}/products/${firstProduct._id}`);
      console.log(`✅ Single Product: ${singleProductResponse.data.product.name}`);
    }

    // Test 4: Register User
    console.log('\n4. Testing User Registration...');
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      phone: '9876543210'
    };
    
    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, userData);
      console.log('✅ User Registration Successful');
      
      const token = registerResponse.data.token;
      
      // Test 5: Get User Profile
      console.log('\n5. Testing Get User Profile...');
      const profileResponse = await axios.get(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ User Profile: ${profileResponse.data.user.name}`);

      // Test 6: Add to Cart
      if (productsResponse.data.products.length > 0) {
        console.log('\n6. Testing Add to Cart...');
        const cartData = {
          productId: productsResponse.data.products[0]._id,
          quantity: 2
        };
        
        const cartResponse = await axios.post(`${BASE_URL}/cart/add`, cartData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Item Added to Cart');
        console.log(`   Cart Total Items: ${cartResponse.data.cart.totalItems}`);
        console.log(`   Cart Total Price: ₹${cartResponse.data.cart.totalPrice}`);
      }

    } catch (authError) {
      if (authError.response && authError.response.status === 400) {
        console.log('ℹ️  User already exists, testing login instead...');
        
        // Test Login
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
          email: userData.email,
          password: userData.password
        });
        console.log('✅ User Login Successful');
      } else {
        throw authError;
      }
    }

    console.log('\n🎉 All API tests completed successfully!');
    console.log('\n📋 API Endpoints Available:');
    console.log('   • GET  /api/health - Health check');
    console.log('   • GET  /api/products - Get all products');
    console.log('   • GET  /api/products/:id - Get single product');
    console.log('   • POST /api/auth/register - Register user');
    console.log('   • POST /api/auth/login - Login user');
    console.log('   • GET  /api/auth/me - Get user profile');
    console.log('   • GET  /api/cart - Get user cart');
    console.log('   • POST /api/cart/add - Add to cart');
    console.log('   • POST /api/orders - Create order');
    console.log('   • GET  /api/orders - Get user orders');
    console.log('   • PUT  /api/users/profile - Update profile');

  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the backend server is running:');
      console.log('   cd backend && npm run dev');
    }
  }
}

// Run tests
testAPI();
