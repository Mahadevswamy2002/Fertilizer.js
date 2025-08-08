const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Test endpoint
// @route   POST /api/orders/test
// @access  Public
router.post('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Order route is working',
    method: req.method,
    url: req.url,
    body: req.body
  });
});

// @desc    Test authenticated endpoint
// @route   POST /api/orders/test-auth
// @access  Private
router.post('/test-auth', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Authenticated order route is working',
    method: req.method,
    url: req.url,
    user: req.user?.id,
    body: req.body
  });
});

// @desc    Simple order creation (no validation)
// @route   POST /api/orders/simple
// @access  Private
router.post('/simple', protect, async (req, res) => {
  try {
    console.log('🚀 Simple order creation hit!');
    console.log('User:', req.user?.id);

    res.json({
      success: true,
      message: 'Simple order route working',
      user: req.user?.id,
      body: req.body
    });
  } catch (error) {
    console.error('Error in simple order:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    console.log('🚀 POST /api/orders hit!');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('User:', req.user?.id);
    console.log('Body:', req.body);

    // Basic validation
    const { shippingAddress, paymentMethod, notes } = req.body;
    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address and payment method are required'
      });
    }

    // Get user's cart
    console.log('🛒 Creating order for user:', req.user.id);
    const cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'name title image price stock isActive');

    console.log('📋 Cart found:', !!cart, 'Items:', cart?.items?.length || 0);

    if (!cart || cart.items.length === 0) {
      console.log('❌ Cart is empty');
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Verify stock availability for all items
    console.log('🔍 Validating cart items...');
    for (const item of cart.items) {
      console.log(`📦 Checking item: ${item.product?.name || 'Unknown'}`);
      console.log(`   - Product exists: ${!!item.product}`);
      console.log(`   - isActive: ${item.product?.isActive}`);
      console.log(`   - Stock: ${item.product?.stock}`);
      console.log(`   - Requested: ${item.quantity}`);

      // Check if product exists
      if (!item.product) {
        console.log('❌ Product not found');
        return res.status(400).json({
          success: false,
          message: 'One or more products in your cart no longer exist'
        });
      }

      // Check if product is active
      if (item.product.isActive === false) {
        console.log('❌ Product not active');
        return res.status(400).json({
          success: false,
          message: `Product ${item.product.name} is no longer available`
        });
      }

      // Check stock availability
      if (item.product.stock < item.quantity) {
        console.log('❌ Insufficient stock');
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.product.name}. Available: ${item.product.stock}, Requested: ${item.quantity}`
        });
      }

      console.log('✅ Item validation passed');
    }

    // Calculate order totals
    const subtotal = cart.totalPrice;
    const tax = Math.round(subtotal * 0.18 * 100) / 100; // 18% GST
    const shipping = subtotal > 500 ? 0 : 50; // Free shipping above ₹500
    const totalAmount = subtotal + tax + shipping;

    // Create order items
    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      image: item.product.image,
      price: item.price,
      quantity: item.quantity,
      size: item.size
    }));

    // Create order
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalItems: cart.totalItems,
      subtotal,
      tax,
      shipping,
      totalAmount,
      shippingAddress,
      paymentMethod,
      notes
    });

    // Update product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(
        item.product._id,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Add order to user's orders
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { orders: order._id } }
    );

    // Clear cart
    await cart.clearCart();

    // Populate order for response
    await order.populate('items.product', 'name title image');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
router.get('/', protect, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('status').optional().isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid order status')
], async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { user: req.user.id };
    if (req.query.status) {
      filter.orderStatus = req.query.status;
    }

    // Get orders with pagination
    const orders = await Order.find(filter)
      .populate('items.product', 'name title image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await Order.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      totalPages,
      currentPage: page,
      orders
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    console.log('🔍 GET /api/orders/:id hit!');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Params:', req.params);
    console.log('Order ID:', req.params.id);

    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name title image')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order or is admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Check if order can be cancelled
    if (['shipped', 'delivered', 'cancelled'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    // Update order status
    order.orderStatus = 'cancelled';
    await order.save();

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
