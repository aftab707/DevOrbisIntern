import React from 'react';

const Sidebar = ({ activeView, setActiveView }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>DocuChat</h2>
        <span className="badge">Enterprise</span>
      </div>
      
      <div className="nav-items">
        <button 
          className={`nav-btn ${activeView === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveView('chat')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          Chat Interface
        </button>
        
        <button 
          className={`nav-btn ${activeView === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveView('upload')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          Knowledge Base
        </button>
      </div>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="avatar">A</div>
          <span>Admin User</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
