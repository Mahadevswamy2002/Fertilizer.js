import React, { createContext, useContext, useReducer, useEffect } from 'react';
import authService from '../services/authService';
import cartService from '../services/cartService';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  cartCount: 0
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  UPDATE_CART_COUNT: 'UPDATE_CART_COUNT'
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        cartCount: 0
      };
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: action.payload
      };
    case AUTH_ACTIONS.UPDATE_CART_COUNT:
      return {
        ...state,
        cartCount: action.payload
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      if (authService.isAuthenticated()) {
        const storedUser = authService.getStoredUser();
        if (storedUser) {
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: { user: storedUser }
          });
          
          // Get cart count for authenticated user
          await updateCartCount();
        }
      }
      
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    };

    initializeAuth();
  }, []);

  // Update cart count
  const updateCartCount = async () => {
    if (state.isAuthenticated) {
      const result = await cartService.getCartCount();
      if (result.success) {
        dispatch({
          type: AUTH_ACTIONS.UPDATE_CART_COUNT,
          payload: result.count
        });
      }
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const result = await authService.login(email, password);
      if (result.success) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user: result.user }
        });
        
        // Get cart count after login
        await updateCartCount();
        
        return { success: true, user: result.user };
      }
      return { success: false, message: result.message };
    } catch (error) {
      return { success: false, message: 'Login failed' };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const result = await authService.register(userData);
      if (result.success) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user: result.user }
        });
        
        return { success: true, user: result.user };
      }
      return { success: false, message: result.message };
    } catch (error) {
      return { success: false, message: 'Registration failed' };
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  // Update user profile
  const updateUser = (userData) => {
    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: userData
    });
  };

  // Context value
  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    updateCartCount
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
