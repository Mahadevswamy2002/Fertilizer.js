import API from './api';

class ProductService {
  // Get all products with optional filters
  async getProducts(params = {}) {
    try {
      const response = await API.get('/products', { params });
      if (response.data.success) {
        return {
          success: true,
          products: response.data.products,
          total: response.data.total,
          totalPages: response.data.totalPages,
          currentPage: response.data.currentPage
        };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch products'
      };
    }
  }

  // Get single product by ID
  async getProduct(id) {
    try {
      const response = await API.get(`/products/${id}`);
      if (response.data.success) {
        return { success: true, product: response.data.product };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch product'
      };
    }
  }

  // Search products
  async searchProducts(searchTerm, filters = {}) {
    try {
      const params = { search: searchTerm, ...filters };
      return await this.getProducts(params);
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Search failed'
      };
    }
  }

  // Get products by category
  async getProductsByCategory(category, params = {}) {
    try {
      const searchParams = { category, ...params };
      return await this.getProducts(searchParams);
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch products by category'
      };
    }
  }

  // Get featured products (highest rated)
  async getFeaturedProducts(limit = 8) {
    try {
      const params = { sort: '-stars', limit };
      return await this.getProducts(params);
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch featured products'
      };
    }
  }
}

export default new ProductService();
