import React, { useState, useEffect } from 'react';
import RetroWindow from '../../components/RetroUI/RetroWindow';
import { API_BASE_URL } from '../../config/api'; 
import './Inbox.css';

const MessageCenterInbox = ({ userRole }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [selectedMail, setSelectedMail] = useState(null);
  const [showNewBulletin, setShowNewBulletin] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Streamlined to use the standardized 'token' key
  const getUserDataFromToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return {};
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('0' + ('' + c).charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return {};
    }
  };

  const userData = getUserDataFromToken();
  const effectiveRole = userRole || userData.role || '';
  const isAdmin = effectiveRole.toUpperCase().includes('ADMIN');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'bypass-tunnel-reminder': 'true' 
    };
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/announcements`, {
        method: 'GET',
        headers: getAuthHeader()
      });
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data);
        if (data.length > 0) setSelectedMail(data[0]);
      } else {
        loadMockAnnouncements();
      }
    } catch (error) {
      console.error("Failed to fetch announcements, loading mock data", error);
      loadMockAnnouncements();
    }
  };

  const loadMockAnnouncements = () => {
    const mockData = [
      { id: 1, title: '🚨 SYSTEM BULLETIN: Welcome to iOS Club 4.0', sender: 'Administrator', date: '2026-08-12', content: 'All members are required to check their assigned team directories and coordinate with their Leads.', pinned: true },
      { id: 2, title: '📅 Upcoming Event: Hackathon 2026 Briefing', sender: 'Event Team', date: '2026-08-14', content: 'The preliminary synchronization meeting will take place in LC 203.', pinned: false }
    ];
    setAnnouncements(mockData);
    setSelectedMail(mockData[0]);
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/announcements`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ title, content, pinned: true })
      });
      if (response.ok) {
        setShowNewBulletin(false);
        setTitle('');
        setContent('');
        fetchAnnouncements();
      } else {
        const errText = await response.text();
        alert(`Permission Denied or Server Error: ${errText}`);
      }
    } catch (err) {
      console.error("Error posting announcement", err);
      alert("Network Error: Could not broadcast bulletin.");
    }
  };

  return (
    <div style={{ display: 'flex', gap: '8px', padding: '10px', height: '100%', overflow: 'hidden' }}>
      
      {/* LEFT PANE: Folder List */}
      <div style={{ width: '180px', background: 'white', border: '2px inset #dfdfdf', padding: '6px', fontSize: '12px' }}>
        <div style={{ fontWeight: 'bold', borderBottom: '1px solid gray', paddingBottom: '4px', marginBottom: '6px' }}>
          📬 Outlook Express
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li style={{ padding: '4px', background: '#000080', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>📥 Inbox ({announcements.length})</li>
          <li style={{ padding: '4px', cursor: 'pointer' }}>📤 Sent Items</li>
          <li style={{ padding: '4px', cursor: 'pointer' }}>🗑️ Deleted Mail</li>
        </ul>
        
        {isAdmin && (
          <div style={{ marginTop: '20px' }}>
            <button className="retro-button" style={{ width: '100%', fontSize: '11px' }} onClick={() => setShowNewBulletin(true)}>
              [+] Post Bulletin
            </button>
          </div>
        )}
      </div>

      {/* RIGHT PANE: Inbox Message List & Preview Window */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ height: '140px', background: 'white', border: '2px inset #dfdfdf', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', fontFamily: 'MS Sans Serif, sans-serif' }}>
            <thead>
              <tr style={{ background: '#c0c0c0', borderBottom: '1px solid gray', textAlign: 'left' }}>
                <th style={{ padding: '4px' }}>📌</th>
                <th style={{ padding: '4px' }}>Subject</th>
                <th style={{ padding: '4px' }}>Author</th>
                <th style={{ padding: '4px' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map(item => (
                <tr 
                  key={item.id} 
                  onClick={() => setSelectedMail(item)}
                  style={{ 
                    cursor: 'pointer', 
                    background: (selectedMail?.id === item.id) ? '#000080' : 'transparent',
                    color: (selectedMail?.id === item.id) ? 'white' : 'black'
                  }}
                >
                  <td style={{ padding: '4px' }}>{item.pinned ? '⭐' : '✉️'}</td>
                  <td style={{ padding: '4px', fontWeight: item.pinned ? 'bold' : 'normal' }}>{item.title}</td>
                  <td style={{ padding: '4px' }}>{item.sender || 'Admin'}</td>
                  <td style={{ padding: '4px' }}>{item.date || 'Today'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ flex: 1, background: 'white', border: '2px inset #dfdfdf', padding: '12px', display: 'flex', flexDirection: 'column', fontFamily: 'monospace' }}>
          {selectedMail ? (
            <>
              <div style={{ borderBottom: '1px solid #ccc', paddingBottom: '6px', marginBottom: '8px' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000080' }}>{selectedMail.title}</div>
                <div style={{ fontSize: '11px', color: '#666' }}>From: {selectedMail.sender || 'Admin'} | Date: {selectedMail.date || 'Today'}</div>
              </div>
              <div style={{ flex: 1, fontSize: '13px', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
                {selectedMail.content}
              </div>
            </>
          ) : (
            <div style={{ color: '#888', fontStyle: 'italic', textAlign: 'center', marginTop: '40px' }}>
              Select an item from the inbox to read.
            </div>
          )}
        </div>
      </div>

      {showNewBulletin && (
        <div className="error-overlay">
          <RetroWindow title="Compose Global Announcement" width="350px">
            <form className="login-form" onSubmit={handlePostAnnouncement}>
              <div className="form-group">
                <label>Bulletin Title:</label>
                <input type="text" className="retro-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Message Content:</label>
                <textarea className="retro-input" rows="4" value={content} onChange={(e) => setContent(e.target.value)} required style={{ resize: 'none' }} />
              </div>
              <div className="form-actions" style={{ marginTop: '15px' }}>
                <button type="submit" className="retro-button">Broadcast</button>
                <button type="button" className="retro-button" onClick={() => setShowNewBulletin(false)}>Cancel</button>
              </div>
            </form>
          </RetroWindow>
        </div>
      )}
    </div>
  );
};

export default MessageCenterInbox;