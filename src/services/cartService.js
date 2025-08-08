import API from './api';

class CartService {
  // Get user's cart
  async getCart() {
    try {
      const response = await API.get('/cart');
      if (response.data.success) {
        return { success: true, cart: response.data.cart };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch cart'
      };
    }
  }

  // Add item to cart
  async addToCart(productId, quantity = 1, size = '') {
    try {
      const response = await API.post('/cart/add', {
        productId,
        quantity,
        size
      });
      if (response.data.success) {
        return { success: true, cart: response.data.cart };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add item to cart'
      };
    }
  }

  // Update item quantity in cart
  async updateCartItem(productId, quantity, size = '') {
    try {
      const response = await API.put('/cart/update', {
        productId,
        quantity,
        size
      });
      if (response.data.success) {
        return { success: true, cart: response.data.cart };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update cart item'
      };
    }
  }

  // Remove item from cart
  async removeFromCart(productId, size = '') {
    try {
      const params = size ? `?size=${encodeURIComponent(size)}` : '';
      const response = await API.delete(`/cart/remove/${productId}${params}`);
      if (response.data.success) {
        return { success: true, cart: response.data.cart };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to remove item from cart'
      };
    }
  }

  // Clear entire cart
  async clearCart() {
    try {
      const response = await API.delete('/cart/clear');
      if (response.data.success) {
        return { success: true, cart: response.data.cart };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to clear cart'
      };
    }
  }

  // Get cart count (for navbar)
  async getCartCount() {
    try {
      const result = await this.getCart();
      if (result.success) {
        return { success: true, count: result.cart.totalItems || 0 };
      }
      return { success: false, count: 0 };
    } catch (error) {
      return { success: false, count: 0 };
    }
  }
}

export default new CartService();
