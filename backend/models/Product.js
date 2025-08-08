const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true,
    maxlength: [100, 'Product name cannot be more than 100 characters']
  },
  title: {
    type: String,
    required: [true, 'Please provide a product title'],
    trim: true,
    maxlength: [150, 'Product title cannot be more than 150 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a product description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please provide a product price'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  discount: {
    type: Number,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot be more than 100%'],
    default: 0
  },
  category: {
    type: String,
    required: [true, 'Please provide a product category'],
    enum: ['fertilizer', 'seeds', 'tools', 'pesticides', 'organic'],
    default: 'fertilizer'
  },
  subcategory: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    required: [true, 'Please provide a product image']
  },
  images: [{
    type: String
  }],
  alt: {
    type: String,
    default: 'Product image'
  },
  stars: {
    type: Number,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5'],
    default: 0
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true,
      maxlength: [500, 'Review comment cannot be more than 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  stock: {
    type: Number,
    required: [true, 'Please provide stock quantity'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  weight: {
    value: Number,
    unit: {
      type: String,
      enum: ['kg', 'g', 'lb', 'oz'],
      default: 'kg'
    }
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      enum: ['cm', 'inch'],
      default: 'cm'
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  manufacturer: {
    type: String,
    trim: true
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

// Index for search functionality
productSchema.index({ name: 'text', title: 'text', description: 'text' });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ price: 1 });
productSchema.index({ stars: -1 });

// Calculate average rating
productSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.stars = 0;
  } else {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.stars = Math.round((totalRating / this.reviews.length) * 10) / 10;
  }
  return this.stars;
};

module.exports = mongoose.model('Product', productSchema);
