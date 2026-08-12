import React, { useState } from 'react';
import RetroWindow from './RetroWindow'; // 1. We must import the window component!
import './Login.css'; 

const ForcePasswordChange = ({ onPasswordChanged }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Custom validation
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match, user!');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('jwt_token');
      
      const response = await fetch('http://localhost:8080/api/users/change-password', {
        method: 'PUT', // Updated method
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ newPassword: newPassword }), // Matches your API DTO
      });

      if (response.ok) {
        onPasswordChanged(); 
      } else {
        setError('System Error: Could not update password.');
      }
    } catch (err) {
      setError('Network Error: Cannot reach server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="login-form">
        <div style={{ marginBottom: '10px', fontSize: '13px' }}>
          <strong>SECURITY ALERT:</strong> Your account requires a password change before proceeding to the desktop.
        </div>

        <div className="form-group">
          <label htmlFor="newPassword">New Password:</label>
          <input 
            type="password" 
            id="newPassword"
            className="retro-input" 
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input 
            type="password" 
            id="confirmPassword"
            className="retro-input" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="retro-button" disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Apply'}
          </button>
        </div>
      </form>

      {/* 2. Here is the custom Retro Error Dialog Popup! */}
      {error && (
        <div className="error-overlay">
          <RetroWindow title="System Error" width="260px">
            <div className="error-dialog-content">
              <div className="error-icon">❌</div>
              <p>{error}</p>
            </div>
            <div className="form-actions" style={{ marginTop: '15px' }}>
              <button className="retro-button" onClick={() => setError('')}>OK</button>
            </div>
          </RetroWindow>
        </div>
      )}
    </>
  );
};

export default ForcePasswordChange;