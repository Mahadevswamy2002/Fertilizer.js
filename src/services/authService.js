import API from './api';

class AuthService {
  // Register new user
  async register(userData) {
    try {
      const response = await API.post('/auth/register', userData);
      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true, user, token };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  }

  // Login user
  async login(email, password) {
    try {
      const response = await API.post('/auth/login', { email, password });
      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true, user, token };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  }

  // Logout user
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { success: true };
  }

  // Get current user
  async getCurrentUser() {
    try {
      const response = await API.get('/auth/me');
      if (response.data.success) {
        const user = response.data.user;
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true, user };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get user'
      };
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  // Get stored user data
  getStoredUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Get stored token
  getStoredToken() {
    return localStorage.getItem('token');
  }
}

export default new AuthService();
