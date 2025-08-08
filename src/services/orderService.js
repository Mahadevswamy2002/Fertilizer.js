import API from './api';

class OrderService {
  // Create new order
  async createOrder(orderData) {
    try {
      console.log('🛒 Creating order with data:', orderData);
      const response = await API.post('/orders', orderData);
      console.log('✅ Order response:', response.data);
      if (response.data.success) {
        return { success: true, order: response.data.order };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error('❌ Order creation error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create order'
      };
    }
  }

  // Get user's orders
  async getOrders(params = {}) {
    try {
      const response = await API.get('/orders', { params });
      if (response.data.success) {
        return {
          success: true,
          orders: response.data.orders,
          total: response.data.total,
          totalPages: response.data.totalPages,
          currentPage: response.data.currentPage
        };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch orders'
      };
    }
  }

  // Get single order by ID
  async getOrder(orderId) {
    try {
      const response = await API.get(`/orders/${orderId}`);
      if (response.data.success) {
        return { success: true, order: response.data.order };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch order'
      };
    }
  }

  // Cancel order
  async cancelOrder(orderId) {
    try {
      const response = await API.put(`/orders/${orderId}/cancel`);
      if (response.data.success) {
        return { success: true, order: response.data.order };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to cancel order'
      };
    }
  }

  // Get order history for profile
  async getOrderHistory(limit = 5) {
    try {
      const params = { limit, sort: '-createdAt' };
      return await this.getOrders(params);
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch order history'
      };
    }
  }
}

export default new OrderService();
