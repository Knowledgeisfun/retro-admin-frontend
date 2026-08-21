import React, { useState, useEffect } from 'react';
import RetroWindow from './components/RetroUI/RetroWindow';
import RetroNavbar from './components/RetroUI/RetroNavbar'; // IMPORT THE NEW COMPONENT
import Login from './pages/Auth/Login';
import ForcePasswordChange from './pages/Auth/ForcePasswordChange';
import MessageCenterInbox from './pages/Inbox/MessageCenterInbox.jsx';
import ChannelChatMessenger from './pages/Chat/ChannelChatMessenger.jsx';
import AdminDashboard from './pages/Hierarchy/TeamHierarchy.jsx';

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
    // FIX: Look for 'token' first!
    const token = localStorage.getItem('token') || localStorage.getItem('jwt_token');
    if (token) {
      setIsAuthenticated(true);
      const rawRole = getUserRoleFromToken(token);
      setUserRole(rawRole.replace('ROLE_', '')); 
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    setIsAuthenticated(false);
    setMustChangePassword(false);
    setUserRole('MEMBER');
  };

  const handleLoginSuccess = (requiresChange) => {
    // FIX: Look for 'token' first!
    const token = localStorage.getItem('token') || localStorage.getItem('jwt_token');
    setIsAuthenticated(true);
    setMustChangePassword(requiresChange);
    
    const rawRole = getUserRoleFromToken(token);
    setUserRole(rawRole.replace('ROLE_', ''));
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
    // Get the username once to pass to the Navbar
    const userName = getUserNameFromToken(localStorage.getItem('jwt_token'));

    currentView = (
      <RetroWindow title="Netscape - [ iOS Club Manager 4.0 ]" width="950px">
        <div style={{ height: '640px', display: 'flex', flexDirection: 'column', background: '#dfdfdf' }}>
          
          {/* THE CLEANED UP NAVBAR COMPONENT */}
          <RetroNavbar 
            currentViewMode={currentViewMode}
            setCurrentViewMode={setCurrentViewMode}
            userName={userName}
            userRole={userRole}
            onLogout={handleLogout}
          />

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