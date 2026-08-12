import React, { useState } from 'react';
import RetroWindow from './RetroWindow';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
  // 1. Change the state variable from username to email
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Update validation to check email
    if (!email.trim() || !password.trim()) {
      setError('All fields are required, user!');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // 2. THIS IS THE CRITICAL FIX: Send 'email' instead of 'username'
        body: JSON.stringify({ email: email, password: password }), 
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('jwt_token', data.token); 
        onLoginSuccess(data.requiresPasswordChange); 
      } else {
        setError('Access Denied: Invalid credentials.');
      }
    } catch (err) {
      setError('Network Error: Cannot reach server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleLogin} className="login-form">
        
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input 
            type="email" // You can also change this to type="email" for basic browser format validation
            id="email"
            className="retro-input" 
            value={email} // 3. Update the input value
            onChange={(e) => setEmail(e.target.value)} // 4. Update the onChange handler
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input 
            type="password" 
            id="password"
            className="retro-input" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="retro-button" disabled={isLoading}>
            {isLoading ? 'Wait...' : 'OK'}
          </button>
          <button type="button" className="retro-button" onClick={() => {setEmail(''); setPassword(''); setError('');}}>Cancel</button>
        </div>
      </form>

      {/* THE ACTUAL ERROR DIALOG CODE IS RESTORED HERE */}
      {error && (
        <div className="error-overlay">
          <RetroWindow title="System Error" width="260px">
            <div className="error-dialog-content">
              <div className="error-icon">❌</div>
              <p>{error}</p>
            </div>
            <div className="form-actions" style={{ marginTop: '15px' }}>
              <button type="button" className="retro-button" onClick={() => setError('')}>OK</button>
            </div>
          </RetroWindow>
        </div>
      )}
    </>
  );
};

export default Login;