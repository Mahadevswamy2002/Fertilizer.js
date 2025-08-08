import API from './api';

class UserService {
  // Get user profile
  async getProfile() {
    try {
      const response = await API.get('/users/profile');
      if (response.data.success) {
        return { success: true, user: response.data.user };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch profile'
      };
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await API.put('/users/profile', profileData);
      if (response.data.success) {
        // Update stored user data
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return { success: true, user: response.data.user };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile'
      };
    }
  }

  // Update user address
  async updateAddress(addressData) {
    try {
      const response = await API.put('/users/address', addressData);
      if (response.data.success) {
        return { success: true, address: response.data.address };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update address'
      };
    }
  }

  // Change password
  async changePassword(passwordData) {
    try {
      const response = await API.put('/users/password', passwordData);
      if (response.data.success) {
        return { success: true, message: response.data.message };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to change password'
      };
    }
  }

  // Delete user account
  async deleteAccount(password) {
    try {
      const response = await API.delete('/users/account', {
        data: { password }
      });
      if (response.data.success) {
        // Clear stored data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return { success: true, message: response.data.message };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete account'
      };
    }
  }
}

export default new UserService();
