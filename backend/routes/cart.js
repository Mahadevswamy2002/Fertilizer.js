const express = require('express');
const { body, validationResult } = require('express-validator');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Debug cart data
// @route   GET /api/cart/debug
// @access  Private
router.get('/debug', protect, async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product');

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: 'No cart found',
        cart: null
      });
    }

    // Debug info
    const debugInfo = {
      cartId: cart._id,
      userId: cart.user,
      totalItems: cart.totalItems,
      totalPrice: cart.totalPrice,
      items: cart.items.map(item => ({
        productId: item.product?._id,
        productName: item.product?.name,
        isActive: item.product?.isActive,
        stock: item.product?.stock,
        quantity: item.quantity,
        price: item.price
      }))
    };

    res.status(200).json({
      success: true,
      debug: debugInfo,
      cart
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'name title image price stock isActive');

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    // Filter out inactive products
    cart.items = cart.items.filter(item => item.product && item.product.isActive);
    
    // Recalculate totals if items were filtered
    if (cart.items.length !== cart.totalItems) {
      await cart.save();
    }

    res.status(200).json({
      success: true,
      cart
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
router.post('/add', protect, [
  body('productId').isMongoId().withMessage('Invalid product ID'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('size').optional().trim()
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

    const { productId, quantity = 1, size = '' } = req.body;

    // Check if product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check stock availability
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock available'
      });
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    // Add item to cart
    await cart.addItem(productId, quantity, size, product.price);

    // Populate cart items for response
    await cart.populate('items.product', 'name title image price stock');

    res.status(200).json({
      success: true,
      message: 'Item added to cart successfully',
      cart
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update item quantity in cart
// @route   PUT /api/cart/update
// @access  Private
router.put('/update', protect, [
  body('productId').isMongoId().withMessage('Invalid product ID'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('size').optional().trim()
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

    const { productId, quantity, size = '' } = req.body;

    // Get cart
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // If quantity is 0, remove item
    if (quantity === 0) {
      await cart.removeItem(productId, size);
    } else {
      // Check stock availability
      const product = await Product.findById(productId);
      if (!product || !product.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock available'
        });
      }

      await cart.updateItemQuantity(productId, quantity, size);
    }

    // Populate cart items for response
    await cart.populate('items.product', 'name title image price stock');

    res.status(200).json({
      success: true,
      message: 'Cart updated successfully',
      cart
    });
  } catch (error) {
    if (error.message === 'Item not found in cart') {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }
    next(error);
  }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:productId
// @access  Private
router.delete('/remove/:productId', protect, async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { size = '' } = req.query;

    // Get cart
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    await cart.removeItem(productId, size);

    // Populate cart items for response
    await cart.populate('items.product', 'name title image price stock');

    res.status(200).json({
      success: true,
      message: 'Item removed from cart successfully',
      cart
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
router.delete('/clear', protect, async (req, res, next) => {
  try {
    // Get cart
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    await cart.clearCart();

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      cart
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
