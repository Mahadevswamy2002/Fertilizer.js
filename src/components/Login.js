import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import "./LoginCss.css"

function Login() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when typing
    if (name === 'password' || name === 'confirmPassword') {
      setPasswordError('');
    }
    setGeneralError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPasswordError('');
    setGeneralError('');

    try {
      if (isLoginMode) {
        // Login
        const result = await login(formData.email, formData.password);
        if (result.success) {
          toast.success('Login successful!');
          navigate('/');
        } else {
          // Check if unregistered email
          if (result.message && result.message.toLowerCase().includes('not registered')) {
            toast.warn('This email is not registered! Switching to Register...');
            setIsLoginMode(false);
            setFormData({
              name: '',
              email: '',
              password: '',
              confirmPassword: '',
              phone: ''
            });
          } else if (result.message && result.message.toLowerCase().includes('password')) {
            // Wrong password error displayed directly under input field
            setPasswordError('Incorrect password. Please try again.');
          } else {
            setGeneralError(result.message || 'Login failed. Please check your credentials.');
          }
        }
      } else {
        // Register
        if (formData.password !== formData.confirmPassword) {
          setPasswordError('Passwords do not match');
          setLoading(false);
          return;
        }

        const userData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone
        };

        const result = await register(userData);
        if (result.success) {
          toast.success('Registration successful!');
          navigate('/');
        } else {
          // Check if user already exists
          if (result.message && (result.message.toLowerCase().includes('already exists') || result.message.toLowerCase().includes('exists'))) {
            toast.warn('An account with this email already exists! Switching to Sign In...');
            setIsLoginMode(true);
            setFormData({
              name: '',
              email: '',
              password: '',
              confirmPassword: '',
              phone: ''
            });
          } else {
            setGeneralError(result.message || 'Registration failed');
          }
        }
      }
    } catch (error) {
      setGeneralError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const setMode = (loginMode) => {
    setIsLoginMode(loginMode);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setPasswordError('');
    setGeneralError('');
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: ''
    });
  };

  return (
    <div className="login-page">
      <div className={`login-card ${isLoginMode ? 'login-mode' : 'register-mode'}`}>
        {/* Brand Header */}
        <div className="login-brand">
          <span className="brand-icon">🌱</span>
          <h2>Agro Agencies</h2>
          <p>Access your farmer portal for personalized pricing and orders.</p>
        </div>

        {/* Auth Mode Toggle Tabs */}
        <div className="auth-tabs">
          <button 
            type="button" 
            className={`auth-tab ${isLoginMode ? 'active' : ''}`}
            onClick={() => setMode(true)}
          >
            Sign In
          </button>
          <button 
            type="button" 
            className={`auth-tab ${!isLoginMode ? 'active' : ''}`}
            onClick={() => setMode(false)}
          >
            Register
          </button>
        </div>

        {/* General Error Alert Box */}
        {generalError && (
          <div className="auth-alert-error">
            <span className="alert-icon">⚠️</span>
            <span className="alert-message">{generalError}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={onSubmit} className="auth-form" autoComplete="off">
          
          {!isLoginMode && (
            <div className="form-group">
              <label htmlFor="name-input">Full Name</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  id="name-input"
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email-input">Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon">✉️</span>
              <input
                id="email-input"
                type="email"
                name="email"
                placeholder="Enter your account email"
                value={formData.email}
                onChange={handleInputChange}
                required
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password-input">Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                id="password-input"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleInputChange}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="eye-icon">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="eye-icon">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
            {passwordError && !isLoginMode && formData.password !== formData.confirmPassword && (
              <span className="field-error-msg">⚠️ {passwordError}</span>
            )}
            {passwordError && isLoginMode && (
              <span className="field-error-msg">⚠️ {passwordError}</span>
            )}
          </div>

          {!isLoginMode && (
            <>
              <div className="form-group">
                <label htmlFor="confirmPassword-input">Confirm Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    id="confirmPassword-input"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="eye-icon">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="eye-icon">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
                {passwordError && formData.password !== formData.confirmPassword && (
                  <span className="field-error-msg">⚠️ {passwordError}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone-input">Phone Number</label>
                <div className="input-wrapper">
                  <span className="input-icon">📞</span>
                  <input
                    id="phone-input"
                    type="tel"
                    name="phone"
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    pattern="[0-9]{10}"
                    autoComplete="new-password"
                  />
                </div>
              </div>
            </>
          )}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <span className="btn-spinner-text">Processing...</span>
            ) : (
              isLoginMode ? 'Sign In to Account' : 'Register Account'
            )}
          </button>

          <div className="mode-toggle-link">
            {isLoginMode ? (
              <p>
                New user?{" "}
                <button type="button" onClick={() => setMode(false)}>
                  Create an account here
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button type="button" onClick={() => setMode(true)}>
                  Sign In here
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
