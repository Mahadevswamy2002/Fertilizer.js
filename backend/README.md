# Fertilizer E-commerce Backend API

A comprehensive REST API for a fertilizer e-commerce application built with Express.js and MongoDB.

## Features

- **User Authentication & Authorization** - JWT-based auth with role-based access control
- **Product Management** - CRUD operations with search, filtering, and pagination
- **Shopping Cart** - Add, update, remove items with stock validation
- **Order Management** - Order creation, tracking, and history
- **User Profile Management** - Profile updates, address management, password changes
- **Data Validation** - Comprehensive input validation using express-validator
- **Security** - Rate limiting, CORS, helmet, password hashing
- **Error Handling** - Centralized error handling with detailed responses

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Security**: bcryptjs, helmet, cors, express-rate-limit
- **Development**: nodemon, morgan (logging)

## Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection configuration
├── middleware/
│   ├── auth.js              # Authentication middleware
│   └── errorHandler.js      # Global error handling
├── models/
│   ├── User.js              # User schema and methods
│   ├── Product.js           # Product schema and methods
│   ├── Cart.js              # Shopping cart schema
│   └── Order.js             # Order schema and methods
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── products.js          # Product management routes
│   ├── cart.js              # Shopping cart routes
│   ├── orders.js            # Order management routes
│   └── users.js             # User profile routes
├── scripts/
│   └── seedProducts.js      # Database seeding script
├── .env                     # Environment variables
├── .env.example             # Environment variables template
├── package.json             # Dependencies and scripts
└── server.js                # Main application entry point
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
Copy the example environment file and configure your settings:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
MONGODB_URI=mongodb://localhost:27017/fertilizer_ecommerce
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3. Database Setup
Make sure MongoDB is running, then seed the database with sample products:
```bash
node scripts/seedProducts.js
```

### 4. Start the Server
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - Logout user

### Products
- `GET /api/products` - Get all products (with filtering, sorting, pagination)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Shopping Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update item quantity
- `DELETE /api/cart/remove/:productId` - Remove item from cart
- `DELETE /api/cart/clear` - Clear entire cart

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/cancel` - Cancel order

### User Profile
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/address` - Update user address
- `PUT /api/users/password` - Change password
- `DELETE /api/users/account` - Deactivate account
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get single user (Admin only)

### Health Check
- `GET /api/health` - API health status

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### User Roles
- **user**: Regular customer (default)
- **admin**: Administrator with full access

## Request/Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ] // Validation errors if applicable
}
```

## Query Parameters

### Products Endpoint
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 12, max: 100)
- `sort`: Sort field (name, price, stars, createdAt with - for descending)
- `category`: Filter by category (fertilizer, seeds, tools, pesticides, organic)
- `search`: Text search in name, title, description
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter

Example: `GET /api/products?category=fertilizer&sort=-price&page=1&limit=10`

## Development

### Available Scripts
- `npm start`: Start production server
- `npm run dev`: Start development server with nodemon
- `npm test`: Run tests (when implemented)

### Adding New Features
1. Create/update models in `models/` directory
2. Add routes in `routes/` directory
3. Update middleware if needed
4. Add validation using express-validator
5. Update this documentation

## Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured for frontend domain
- **Helmet**: Security headers
- **Input Validation**: express-validator for all inputs
- **Error Handling**: No sensitive data in error responses

## Database Schema

### User
- Personal information (name, email, phone)
- Address details
- Password (hashed)
- Role and status
- Order history references

### Product
- Product details (name, title, description)
- Pricing and inventory
- Categories and tags
- Images and ratings
- Reviews system

### Cart
- User reference
- Cart items with quantities
- Automatic total calculations

### Order
- User and shipping information
- Order items snapshot
- Payment and order status
- Tracking information

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.
