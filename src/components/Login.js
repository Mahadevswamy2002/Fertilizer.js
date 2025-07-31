import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./LoginCss.css"

function Login({ handleLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const onSubmit = (e) => {
    e.preventDefault();
    const userData = { name, email, password };
    handleLogin(userData);
    navigate('/');
  };

  return (
    <div className="login">
      
      <form onSubmit={onSubmit}>
      <h1>Login</h1>
        <label>
          Name:
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Email:
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password:
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
