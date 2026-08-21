import React from 'react';

const RetroNavbar = ({ 
  currentViewMode, 
  setCurrentViewMode, 
  userName, 
  userRole, 
  onLogout 
}) => {

  // Determine the fake URL based on the current view
  const currentUrl = currentViewMode === 'inbox' 
    ? "http://localhost:8080/admin/message-center" 
    : currentViewMode === 'chat' 
    ? "http://localhost:8080/admin/channels" 
    : "http://localhost:8080/admin/hierarchy-explorer";

  return (
    <>
      {/* --- GLOBAL PERSISTENT HEADER --- */}
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
        
        {/* User Identity & Logout */}
        <div style={{ fontWeight: 'bold' }}>
          <span>👤 {userName}</span> <span style={{ color: '#000080' }}>({userRole})</span> |{' '}
          <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); }} style={{ color: 'blue' }}>[logout]</a>
        </div>
      </div>

      {/* --- BROWSER TOOLBAR --- */}
      <div className="browser-toolbar" style={{ padding: '4px', background: '#d4d0c8', display: 'flex', gap: '4px', borderBottom: '1px solid #808080' }}>
        <button className="retro-button">Back</button>
        <button className="retro-button">Forward</button>
        <button className="retro-button">Reload</button>
        <button className="retro-button">Home</button>
      </div>

      {/* --- LOCATION BAR --- */}
      <div className="url-bar-container" style={{ padding: '4px 8px', background: '#d4d0c8', display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '2px groove #dfdfdf' }}>
        <span className="url-bar-label" style={{ fontSize: '11px' }}>Location:</span>
        <input 
          type="text" 
          className="url-input" 
          value={currentUrl} 
          readOnly 
          style={{ flex: 1, fontSize: '11px' }} 
        />
      </div>
    </>
  );
};

export default RetroNavbar;