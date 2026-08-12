import React, { useState, useEffect } from 'react';
import RetroWindow from './components/RetroWindow';
import Login from './components/Login';
import ForcePasswordChange from './components/ForcePasswordChange';
import MessageCenterInbox from './components/MessageCenterInbox';
import ChannelChatMessenger from './components/ChannelChatMessenger';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [userRole, setUserRole] = useState('MEMBER');
  const [currentViewMode, setCurrentViewMode] = useState('inbox'); // 'inbox', 'chat', or 'roster'

// Helper to decode user role from JWT token
const getUserRoleFromToken = (token) => {
  if (!token) return 'MEMBER';
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('0' + ('' + c).charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const claims = JSON.parse(jsonPayload);
    
    const resolvedRole = claims.role || claims.roles || claims.authority || claims.authorities;
    if (Array.isArray(resolvedRole)) {
      return resolvedRole[0] || 'MEMBER';
    }
    return resolvedRole || 'MEMBER';
  } catch (e) {
    return 'MEMBER';
  }
};

// Helper to decode username/name from JWT token
const getUserNameFromToken = (token) => {
  if (!token) return 'Guest';
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('0' + ('' + c).charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const claims = JSON.parse(jsonPayload);
    
    return claims.username || claims.name || claims.sub || 'User';
  } catch (e) {
    return 'User';
  }
};

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      setIsAuthenticated(true);
      setUserRole(getUserRoleFromToken(token));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    setIsAuthenticated(false);
    setMustChangePassword(false);
    setUserRole('MEMBER');
  };

  const handleLoginSuccess = (requiresChange) => {
    const token = localStorage.getItem('jwt_token');
    setIsAuthenticated(true);
    setMustChangePassword(requiresChange);
    setUserRole(getUserRoleFromToken(token));
  };

  let currentView;

  if (!isAuthenticated) {
    currentView = (
      <RetroWindow title="System Administration Login" width="320px">
        <Login onLoginSuccess={handleLoginSuccess} />
      </RetroWindow>
    );
  } else if (mustChangePassword) {
    currentView = (
      <RetroWindow title="Security Update Required" width="340px">
        <ForcePasswordChange onPasswordChanged={() => setMustChangePassword(false)} />
      </RetroWindow>
    );
  } else {
    currentView = (
      <RetroWindow title="Netscape - [ iOS Club Manager 4.0 ]" width="950px">
        <div style={{ height: '640px', display: 'flex', flexDirection: 'column', background: '#dfdfdf' }}>
          
          {/* --- GLOBAL PERSISTENT HEADER (Sanjay & Logout always visible) --- */}
          <div style={{ background: '#c0c0c0', padding: '6px 12px', borderBottom: '2px groove #dfdfdf', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontFamily: 'MS Sans Serif, sans-serif' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button 
                className="retro-button" 
                style={{ fontWeight: currentViewMode === 'inbox' ? 'bold' : 'normal', background: currentViewMode === 'inbox' ? '#e0e0e0' : '#dfdfdf' }}
                onClick={() => setCurrentViewMode('inbox')}
              >
                📨 Message Center & Events
              </button>
              <button 
                className="retro-button" 
                style={{ fontWeight: currentViewMode === 'chat' ? 'bold' : 'normal', background: currentViewMode === 'chat' ? '#e0e0e0' : '#dfdfdf' }}
                onClick={() => setCurrentViewMode('chat')}
              >
                💬 Channels & Lounge
              </button>
              <button 
                className="retro-button" 
                style={{ fontWeight: currentViewMode === 'roster' ? 'bold' : 'normal', background: currentViewMode === 'roster' ? '#e0e0e0' : '#dfdfdf' }}
                onClick={() => setCurrentViewMode('roster')}
              >
                📁 Team Hierarchy
              </button>
            </div>
            <div style={{ fontWeight: 'bold' }}>
             <span>👤 {getUserNameFromToken(localStorage.getItem('jwt_token'))}</span> <span style={{ color: '#000080' }}>({userRole})</span> | <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} style={{ color: 'blue' }}>[logout]</a>
            </div>
          </div>

          {/* Single Clean Browser Toolbar & Location Bar */}
          <div className="browser-toolbar" style={{ padding: '4px', background: '#d4d0c8', display: 'flex', gap: '4px', borderBottom: '1px solid #808080' }}>
            <button className="retro-button">Back</button>
            <button className="retro-button">Forward</button>
            <button className="retro-button">Reload</button>
            <button className="retro-button">Home</button>
          </div>
          <div className="url-bar-container" style={{ padding: '4px 8px', background: '#d4d0c8', display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '2px groove #dfdfdf' }}>
            <span className="url-bar-label" style={{ fontSize: '11px' }}>Location:</span>
            <input 
              type="text" 
              className="url-input" 
              value={
                currentViewMode === 'inbox' 
                  ? "http://localhost:8080/admin/message-center" 
                  : currentViewMode === 'chat' 
                  ? "http://localhost:8080/admin/channels" 
                  : "http://localhost:8080/admin/hierarchy-explorer"
              } 
              readOnly 
              style={{ flex: 1, fontSize: '11px' }} 
            />
          </div>

          {/* Single Clean View Switcher */}
          <div style={{ flex: 1, overflow: 'hidden', padding: '4px' }}>
            {currentViewMode === 'inbox' ? (
              <MessageCenterInbox userRole={userRole} />
            ) : currentViewMode === 'chat' ? (
              <ChannelChatMessenger userRole={userRole} />
            ) : (
              <AdminDashboard userRole={userRole} />
            )}
          </div>

        </div>
      </RetroWindow>
    );
  }

  return <>{currentView}</>;
}

export default App;