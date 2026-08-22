import React, { useState } from 'react';
import RetroWindow from '../../components/RetroUI/RetroWindow'; 
import { apiClient } from '../../config/client'; // <-- IMPORT THE CENTRAL CLIENT
import './Auth.css';

const ForcePasswordChange = ({ onPasswordChanged }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
      // API call simplified! Headers and token are automatically attached by apiClient
      const response = await apiClient('/auth/change-password', {
        method: 'PUT', 
        body: JSON.stringify({ newPassword: newPassword }) 
      });

      if (response.ok) {
        onPasswordChanged(); 
      } else {
        const errText = await response.text();
        setError(`System Error: Could not update password. (${errText})`);
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