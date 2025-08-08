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
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLoginMode) {
        // Login
        const result = await login(formData.email, formData.password);
        if (result.success) {
          toast.success('Login successful!');
          navigate('/');
        } else {
          toast.error(result.message || 'Login failed');
        }
      } else {
        // Register
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match');
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
          toast.error(result.message || 'Registration failed');
        }
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: ''
    });
  };

  return (
    <div className="login">
      <form onSubmit={onSubmit}>
        <h1>{isLoginMode ? 'Login' : 'Register'}</h1>

        {!isLoginMode && (
          <label>
            Name:
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </label>
        )}

        <label>
          Email:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </label>

        <label>
          Password:
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </label>

        {!isLoginMode && (
          <>
            <label>
              Confirm Password:
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </label>
            <label>
              Phone:
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="10-digit phone number"
                pattern="[0-9]{10}"
              />
            </label>
          </>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Please wait...' : (isLoginMode ? 'Login' : 'Register')}
        </button>

        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          {isLoginMode ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={toggleMode}
            style={{
              background: 'none',
              border: 'none',
              color: '#007bff',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isLoginMode ? 'Register here' : 'Login here'}
          </button>
        </p>
      </form>
    </div>
  );
}

export default Login;
