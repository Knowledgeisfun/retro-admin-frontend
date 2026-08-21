import React, { useState } from 'react';
import RetroWindow from '../../components/RetroUI/RetroWindow';
import { API_BASE_URL } from '../../config/api'; 
import './Auth.css';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      setError('All fields are required, user!');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'bypass-tunnel-reminder': 'true'
        },
        body: JSON.stringify({ email: email, password: password }), 
      });

      if (response.ok) {
        const data = await response.json();
        
        // STANDARD KEY: Save under 'token' to align with all other components
        localStorage.setItem('token', data.token); 
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
            type="email" 
            id="email"
            className="retro-input" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
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