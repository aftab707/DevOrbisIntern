import React from 'react';

const Sidebar = ({ activeView, setActiveView, onNewChat }) => {
  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand-wrapper">
          <div className="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <div>
            <div className="brand-title">DocuChat</div>
            <div className="brand-subtitle">AI RAG Engine</div>
          </div>
        </div>
        <span className="brand-badge">v2.5</span>
      </div>

      {/* New Conversation Button */}
      <button 
        className="new-chat-btn"
        onClick={() => {
          setActiveView('chat');
          if (onNewChat) onNewChat();
        }}
        title="Start a fresh chat session"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        <span>New Conversation</span>
      </button>

      {/* Navigation */}
      <div className="nav-section-title">Workspaces</div>
      <div className="nav-items">
        <button 
          className={`nav-btn ${activeView === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveView('chat')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
          <span>Chat Interface</span>
          <span className="nav-badge">Live</span>
        </button>
        
        <button 
          className={`nav-btn ${activeView === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveView('upload')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
          </svg>
          <span>Knowledge Base</span>
          <span className="nav-badge">PDF</span>
        </button>
      </div>

      {/* RAG Engine Status Widget */}
      <div className="sidebar-widget">
        <div className="widget-header">
          <span className="widget-label">
            <span className="live-indicator"></span>
            RAG Engine Status
          </span>
          <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: '700' }}>ONLINE</span>
        </div>
        <div className="widget-spec">
          <div className="spec-row">
            <span>Vector Store</span>
            <span>FAISS Local</span>
          </div>
          <div className="spec-row">
            <span>Embeddings</span>
            <span>BGE-Small (384d)</span>
          </div>
          <div className="spec-row">
            <span>Inference</span>
            <span>Groq LLaMA</span>
          </div>
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="avatar">AD</div>
          <div className="user-info">
            <span className="user-name">Admin User</span>
            <span className="user-status">Connected to Index</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
