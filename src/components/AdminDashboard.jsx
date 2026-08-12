import React, { useState, useEffect } from 'react';
import RetroWindow from './RetroWindow';
import './Dashboard.css';
import './Login.css';

const AdminDashboard = ({ userRole }) => {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(null);

  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddTeam, setShowAddTeam] = useState(false);

  const [newUsername, setNewUsername] = useState('');
  const [newRegNumber, setNewRegNumber] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newTeamName, setNewTeamName] = useState('');

  // Extract user info from token to check team assignment
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
  const currentUserName = userData.username || userData.name || userData.sub || 'User';
  const userTeamId = userData.teamId; // Dynamically pulled from your backend JWT!
  const isAdmin = (userRole || '').toUpperCase().includes('ADMIN');

  useEffect(() => {
    fetchUsers();
    fetchTeams();
  }, []);

useEffect(() => {
    if (teams.length > 0 && selectedTeamId === null) {
      if (!isAdmin && userTeamId) {
        setSelectedTeamId(userTeamId);
        return;
      }
      const firstId = teams[0].id || teams[0].teamId;
      setSelectedTeamId(firstId);
    }
  }, [teams, userTeamId]);

  const getAuthHeader = () => {
    const token = localStorage.getItem('jwt_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/users', {
        method: 'GET',
        headers: getAuthHeader()
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch roster", error);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/teams', {
        method: 'GET',
        headers: getAuthHeader()
      });
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      }
    } catch (error) {
      console.error("Failed to fetch teams", error);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/users/register', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({
          username: newUsername,
          email: newEmail,
          registrationNumber: newRegNumber,
          password: 'admin123'
        })
      });

      if (response.ok) {
        setShowAddMember(false);
        setNewUsername(''); setNewEmail(''); setNewRegNumber('');
        fetchUsers();
      } else {
        const errorText = await response.text();
        alert(`Failed to provision member: ${errorText || 'Check admin privileges.'}`);
      }
    } catch (error) {
      console.error("Failed to provision member", error);
    }
  };

  const handleAddTeam = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/teams', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ teamName: newTeamName })
      });

      if (response.ok) {
        setShowAddTeam(false);
        setNewTeamName('');
        fetchTeams();
      }
    } catch (error) {
      console.error("Failed to create team", error);
    }
  };

  // Filter teams visible in the sidebar tree
// Filter teams visible in the sidebar tree dynamically
  const filteredTeams = Array.isArray(teams) ? teams.filter(t => {
    if (isAdmin) return true;
    const tId = t.id || t.teamId;
    return tId === userTeamId; // Automatically matches their assigned team ID!
  }) : [];

  // Declare selectedTeamObj BEFORE filteredUsers so it's initialized in scope
  const selectedTeamObj = teams.find(t => (t.id || t.teamId) === selectedTeamId);

  // Robust filtering for users matching the selected team folder
  const filteredUsers = Array.isArray(users) 
    ? users.filter(u => {
        const uTeamId = u.teamId;
        const nestedTeamId = u.team ? (u.team.teamId || u.team.id) : null;
        const teamObjName = u.team ? (u.team.teamName || u.team.name) : null;
        const directTeamName = u.teamName;
        
        const selectedName = selectedTeamObj ? (selectedTeamObj.teamName || selectedTeamObj.name || '').toLowerCase() : '';

        return uTeamId === selectedTeamId || 
               nestedTeamId === selectedTeamId || 
               (directTeamName && directTeamName.toLowerCase() === selectedName) ||
               (teamObjName && teamObjName.toLowerCase() === selectedName);
      })
    : [];

  const sortedLeads = filteredUsers.filter(u => (u.role || '').toUpperCase().includes('LEAD') && !(u.role || '').toUpperCase().includes('CO'));
  const sortedCoLeads = filteredUsers.filter(u => (u.role || '').toUpperCase().includes('CO'));
  const sortedMembers = filteredUsers.filter(u => !(u.role || '').toUpperCase().includes('LEAD')).sort((a, b) => 
    (a.username || a.name || '').localeCompare(b.username || b.name || '')
  );

  return (
    <div className="dashboard-content" style={{ display: 'flex', gap: '10px', padding: '10px', height: '100%', overflow: 'hidden' }}>
      
      {/* LEFT PANE: Scoped Team Directories */}
      <div className="explorer-tree" style={{ width: '220px', background: 'white', border: '2px inset #dfdfdf', padding: '8px', overflowY: 'auto' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid gray', paddingBottom: '4px', fontSize: '12px' }}>
          📁 Club Directories
        </div>
        <ul style={{ listStyle: 'none', paddingLeft: '0', margin: 0, fontSize: '12px' }}>
          {filteredTeams.map(t => {
            const tId = t.id || t.teamId;
            const tName = t.teamName || t.name;
            const isSelected = tId === selectedTeamId;
            return (
              <li 
                key={tId} 
                onClick={() => setSelectedTeamId(tId)}
                style={{
                  padding: '6px 8px',
                  cursor: 'pointer',
                  background: isSelected ? '#000080' : 'transparent',
                  color: isSelected ? 'white' : 'black',
                  fontWeight: isSelected ? 'bold' : 'normal',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '2px'
                }}
              >
                📁 {tName}
              </li>
            );
          })}
        </ul>
      </div>

      {/* RIGHT PANE: Team Roster View */}
      <div className="explorer-right-pane" style={{ flex: 1, background: '#f5f5f5', border: '2px inset #dfdfdf', padding: '10px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px groove #dfdfdf', paddingBottom: '8px', marginBottom: '10px' }}>
          <h2 style={{ margin: 0, fontSize: '16px', color: '#000080' }}>
            ▾ {selectedTeamObj ? (selectedTeamObj.teamName || selectedTeamObj.name) : 'Select a Team'}
          </h2>
          <div style={{ fontSize: '11px', color: '#666' }}>
            Logged in as: <strong>{currentUserName}</strong> ({userRole})
          </div>
        </div>

        {isAdmin && (
          <div className="dashboard-actions" style={{ marginBottom: '10px', display: 'flex', gap: '6px' }}>
            <button className="retro-button" onClick={() => setShowAddMember(true)}>[+] Add New Member</button>
            <button className="retro-button" onClick={() => setShowAddTeam(true)}>[+] Create New Team</button>
          </div>
        )}

        <div className="buddy-list-container" style={{ flex: 1, background: 'white', border: '1px solid #7f7f7f', padding: '15px', overflowY: 'auto', fontFamily: 'MS Sans Serif, Arial, sans-serif' }}>
          
          {/* LEADS GROUP */}
          {sortedLeads.length > 0 && (
            <div className="buddy-group" style={{ marginBottom: '18px' }}>
              <div style={{ fontWeight: 'bold', color: '#000080', fontSize: '13px', marginBottom: '8px', borderBottom: '1px solid #000080', paddingBottom: '3px' }}>
                ★ TEAM LEAD
              </div>
              {sortedLeads.map(user => {
                const uId = user.userId || user.id;
                const uName = user.userName || user.username || user.name;
                return (
                  <div key={uId} style={{ padding: '6px 8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', background: '#eef2f7', marginBottom: '4px', border: '1px solid #d0d0d0' }}>
                    <span style={{ fontSize: '16px' }}>⭐</span>
                    <span style={{ fontWeight: 'bold', color: '#000' }}>{uName}</span>
                    <span style={{ color: '#444', fontSize: '12px' }}>({user.registrationNumber})</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* CO-LEADS GROUP */}
          {sortedCoLeads.length > 0 && (
            <div className="buddy-group" style={{ marginBottom: '18px' }}>
              <div style={{ fontWeight: 'bold', color: '#000080', fontSize: '13px', marginBottom: '8px', borderBottom: '1px solid #000080', paddingBottom: '3px' }}>
                ⭐ CO-LEAD
              </div>
              {sortedCoLeads.map(user => {
                const uId = user.userId || user.id;
                const uName = user.userName || user.username || user.name;
                return (
                  <div key={uId} style={{ padding: '6px 8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', background: '#f4f6f9', marginBottom: '4px', border: '1px solid #d0d0d0' }}>
                    <span style={{ fontSize: '16px' }}>⭐</span>
                    <span style={{ fontWeight: 'bold', color: '#000' }}>{uName}</span>
                    <span style={{ color: '#444', fontSize: '12px' }}>({user.registrationNumber})</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* MEMBERS GROUP */}
          <div className="buddy-group">
            <div style={{ fontWeight: 'bold', color: '#333', fontSize: '13px', marginBottom: '8px', borderBottom: '1px solid #aaa', paddingBottom: '3px' }}>
              📂 MEMBERS ({sortedMembers.length})
            </div>
            {sortedMembers.length > 0 ? (
              sortedMembers.map(user => {
                const uId = user.userId || user.id;
                const uName = user.userName || user.username || user.name;
                return (
                  <div key={uId} style={{ padding: '6px 8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', borderBottom: '1px dotted #e0e0e0', marginBottom: '2px' }}>
                    <span style={{ fontSize: '14px' }}>👤</span>
                    <span style={{ color: '#111', fontWeight: '500' }}>{uName}</span>
                    <span style={{ color: '#666', fontSize: '12px' }}>({user.registrationNumber})</span>
                  </div>
                );
              })
            ) : (
              <div style={{ color: '#888', fontStyle: 'italic', fontSize: '12px', padding: '5px' }}>No general members in this unit.</div>
            )}
          </div>

        </div>
      </div>

      {/* MODAL: Provision New Member */}
      {showAddMember && (
        <div className="error-overlay">
          <RetroWindow title="Provision New Member" width="350px">
            <form className="login-form" onSubmit={handleAddMember}>
              <div className="form-group">
                <label>Full Name:</label>
                <input type="text" className="retro-input" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Registration Number:</label>
                <input type="text" className="retro-input" value={newRegNumber} onChange={(e) => setNewRegNumber(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input type="email" className="retro-input" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
              </div>
              <div style={{ fontSize: '11px', marginTop: '5px' }}>* Default password will be 'admin123'</div>
              <div className="form-actions" style={{ marginTop: '15px' }}>
                <button type="submit" className="retro-button">Submit</button>
                <button type="button" className="retro-button" onClick={() => setShowAddMember(false)}>Cancel</button>
              </div>
            </form>
          </RetroWindow>
        </div>
      )}

      {/* MODAL: Create New Team */}
      {showAddTeam && (
        <div className="error-overlay">
          <RetroWindow title="Initialize New Team" width="300px">
            <form className="login-form" onSubmit={handleAddTeam}>
              <div className="form-group">
                <label>Team Name:</label>
                <input type="text" className="retro-input" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} required />
              </div>
              <div className="form-actions" style={{ marginTop: '15px' }}>
                <button type="submit" className="retro-button">Initialize</button>
                <button type="button" className="retro-button" onClick={() => setShowAddTeam(false)}>Cancel</button>
              </div>
            </form>
          </RetroWindow>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;