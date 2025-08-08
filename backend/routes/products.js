const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Product = require('../models/Product');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @desc    Database status check
// @route   GET /api/products/db-status
// @access  Public
router.get('/db-status', async (req, res, next) => {
  try {
    const productCount = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isActive: true });
    const categories = await Product.distinct('category');

    res.status(200).json({
      success: true,
      database: {
        connected: true,
        name: 'fertilizer_ecommerce',
        host: 'localhost',
        port: 27017
      },
      collections: {
        products: {
          total: productCount,
          active: activeProducts,
          categories: categories
        }
      },
      message: 'Database is connected and healthy!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      database: {
        connected: false,
        error: error.message
      },
      message: 'Database connection failed!'
    });
  }
});

// @desc    Get all products with filtering, sorting, and pagination
// @route   GET /api/products
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sort').optional().isIn(['name', 'price', 'stars', 'createdAt', '-name', '-price', '-stars', '-createdAt']).withMessage('Invalid sort field'),
  query('category').optional().isIn(['fertilizer', 'seeds', 'tools', 'pesticides', 'organic']).withMessage('Invalid category'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Minimum price must be non-negative'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Maximum price must be non-negative')
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
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const sort = req.query.sort || '-createdAt';

    // Build filter object
    const filter = { isActive: true };
    
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    if (req.query.subcategory) {
      filter.subcategory = new RegExp(req.query.subcategory, 'i');
    }
    
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }
    
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
    }

    // Get products with pagination
    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-reviews'); // Exclude reviews for performance

    // Get total count for pagination
    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages,
      currentPage: page,
      products
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('reviews.user', 'name');

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, authorize('admin'), [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required and must be less than 100 characters'),
  body('title').trim().isLength({ min: 1, max: 150 }).withMessage('Title is required and must be less than 150 characters'),
  body('description').trim().isLength({ min: 1, max: 1000 }).withMessage('Description is required and must be less than 1000 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').isIn(['fertilizer', 'seeds', 'tools', 'pesticides', 'organic']).withMessage('Invalid category'),
  body('image').isURL().withMessage('Image must be a valid URL'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
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

    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Soft delete - set isActive to false
    product.isActive = false;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
