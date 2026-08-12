import React, { useState, useEffect } from 'react';
import RetroWindow from './RetroWindow';
import './Dashboard.css';
import './Login.css';

const ChannelChatMessenger = ({ userRole }) => {
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');

  const getUserDataFromToken = () => {
    const token = localStorage.getItem('jwt_token');
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
  const userTeamId = userData.teamId; // Dynamically pulled from backend JWT token
  const isAdmin = (userRole || '').toUpperCase().includes('ADMIN');
  const isLeadOrCo = (userRole || '').toUpperCase().includes('LEAD') || (userRole || '').toUpperCase().includes('CO');

  useEffect(() => {
    loadChatRooms();
  }, []);

  useEffect(() => {
    if (!selectedChannel) return;
    const channelId = selectedChannel.channelId || selectedChannel.id;
    fetchMessages(channelId);

    const interval = setInterval(() => {
      fetchMessages(channelId);
    }, 4000);

    return () => clearInterval(interval);
  }, [selectedChannel]);

  const getAuthHeader = () => {
    const token = localStorage.getItem('jwt_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const loadChatRooms = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/channels', {
        method: 'GET',
        headers: getAuthHeader()
      });

      if (response.ok) {
        const data = await response.json();
        
        // Keep all channels and let canAccessChannel handle permissions
        setChannels(data);
        
        const allowedChannels = data.filter(ch => canAccessChannel(ch));
        if (allowedChannels.length > 0) {
          setSelectedChannel(allowedChannels[0]);
        }
      } else {
        console.error("Channel fetch rejected with status:", response.status);
      }
    } catch (error) {
      console.error("Failed to load chat rooms", error);
    }
  };

  const fetchMessages = async (channelId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/channels/${channelId}/messages`, {
        method: 'GET',
        headers: getAuthHeader()
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        setMessages([
          { messageId: 1, senderName: 'System', content: 'Secure channel initialized.', sentAt: new Date().toISOString() }
        ]);
      }
    } catch (error) {
      console.error("Error fetching messages", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim() || !selectedChannel) return;

    const channelId = selectedChannel.channelId || selectedChannel.id;
    try {
      const response = await fetch(`http://localhost:8080/api/channels/${channelId}/messages`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ content: newMessageText })
      });

      if (response.ok) {
        setNewMessageText('');
        fetchMessages(channelId);
      } else {
        const errText = await response.text();
        alert("Action Blocked: " + (errText || "Permission denied for this room."));
      }
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

const canAccessChannel = (ch) => {
    if (isAdmin) return true;

    const type = (ch.channelType || ch.type || '').toLowerCase();
    const chName = (ch.channelName || ch.name || '').toLowerCase();

    // 1. Block global channels completely for non-admins
    if (type === 'global' || chName.includes('global') || chName.includes('announcement')) {
      return false; 
    }

    // 2. Restrict leadership channels strictly to leads or co-leads
    if (type.includes('leadership') || chName.includes('leadership')) {
      return isLeadOrCo;
    }

    // 3. Match channel team association dynamically via teamId
    const chTeamId = ch.teamId || (ch.team ? (ch.team.teamId || ch.team.id) : null);
    if (userTeamId && chTeamId) {
      return chTeamId === userTeamId;
    }

    return false;
  };

  const canPostInCurrentChannel = () => {
    if (isAdmin) return true;
    if (!selectedChannel) return false;

    const type = (selectedChannel.channelType || selectedChannel.type || '').toLowerCase();
    const chName = (selectedChannel.channelName || selectedChannel.name || '').toLowerCase();

    if (type.includes('leadership') || chName.includes('leadership')) {
      return isLeadOrCo;
    }

    return canAccessChannel(selectedChannel);
  };

  return (
    <div className="dashboard-content" style={{ display: 'flex', gap: '8px', padding: '10px', height: '100%', overflow: 'hidden', boxSizing: 'border-box' }}>
      
      {/* LEFT PANE: Active Rooms */}
      <div style={{ width: '220px', background: 'white', border: '2px inset #dfdfdf', padding: '8px', fontSize: '12px', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
        <div style={{ fontWeight: 'bold', borderBottom: '1px solid gray', paddingBottom: '4px', marginBottom: '8px', color: '#000080', flexShrink: 0 }}>
          💬 Active Rooms & Teams
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', flex: 1 }}>
          {channels.map(ch => {
            const chId = ch.channelId || ch.id;
            const chName = ch.channelName || ch.name || 'Unnamed Channel';
            const isSelected = (selectedChannel?.channelId === chId || selectedChannel?.id === chId);
            const isLeadership = (ch.channelType || ch.type || '').toLowerCase().includes('leadership') || chName.toLowerCase().includes('leadership');
            const hasAccess = canAccessChannel(ch);

            if (!hasAccess && !isAdmin) {
              return null;
            }

            return (
              <li 
                key={chId} 
                onClick={() => {
                  if (hasAccess) setSelectedChannel(ch);
                }}
                style={{
                  padding: '6px',
                  cursor: hasAccess ? 'pointer' : 'not-allowed',
                  background: isSelected ? '#000080' : 'transparent',
                  color: isSelected ? 'white' : 'black',
                  fontWeight: isSelected ? 'bold' : 'normal',
                  fontSize: '11px',
                  border: isSelected ? '1px solid navy' : '1px solid transparent'
                }}
              >
                {isLeadership ? '⭐ ' : '📁 '} {chName}
              </li>
            );
          })}
        </ul>
      </div>

      {/* RIGHT PANE: Chat Stream */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white', border: '2px inset #dfdfdf', padding: '8px', height: '100%', overflow: 'hidden', boxSizing: 'border-box' }}>
        
        <div style={{ borderBottom: '2px groove #dfdfdf', paddingBottom: '6px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#000080' }}>
              Room: #{selectedChannel ? (selectedChannel.channelName || selectedChannel.name) : 'Select a room'}
            </span>
            <div style={{ fontSize: '10px', color: '#666' }}>
              {canPostInCurrentChannel() ? '📂 Active Chat Session' : '🔒 Restricted: Read-Only Channel'}
            </div>
          </div>
          <span style={{ fontSize: '11px', color: 'gray' }}>Role: {userRole}</span>
        </div>

        <div style={{ flex: 1, minHeight: 0, background: '#f9f9f9', border: '1px solid #7f7f7f', padding: '10px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px', boxSizing: 'border-box' }}>
          {messages.length > 0 ? (
            messages.map((msg, idx) => (
              <div key={msg.messageId || msg.id || idx} style={{ borderBottom: '1px dotted #e0e0e0', paddingBottom: '4px' }}>
                <span style={{ fontWeight: 'bold', color: '#000080' }}>[{msg.senderName || msg.email || 'User'}]</span>: {' '}
                <span style={{ wordBreak: 'break-word' }}>{msg.content || msg.body}</span>
                <span style={{ float: 'right', fontSize: '10px', color: '#888' }}>
                  {msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString() : (msg.timestamp || 'Just now')}
                </span>
              </div>
            ))
          ) : (
            <div style={{ color: '#888', fontStyle: 'italic', textAlign: 'center', marginTop: '50px' }}>
              No transmission logs found for this room. Send a message to initialize.
            </div>
          )}
        </div>

        {canPostInCurrentChannel() ? (
          <form onSubmit={handleSendMessage} style={{ marginTop: '8px', display: 'flex', gap: '6px', flexShrink: 0 }}>
            <input 
              type="text" 
              className="retro-input" 
              placeholder="Type a message..." 
              value={newMessageText} 
              onChange={(e) => setNewMessageText(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="retro-button">Send ↵</button>
          </form>
        ) : (
          <div style={{ marginTop: '8px', padding: '6px', background: '#eee', textAlign: 'center', fontSize: '11px', color: '#666', border: '1px inset #ccc', flexShrink: 0 }}>
            🔒 You do not have posting privileges for this channel tier.
          </div>
        )}

      </div>

    </div>
  );
};

export default ChannelChatMessenger;