import { useCallback, useEffect, useState } from 'react';
import AdminSidebar from './components/AdminSidebar';
import ChatInterface from './components/ChatInterface';
import ApprovalModal from './components/ApprovalModal';
import { getKnowledgeBaseStatus, startNewConversation } from './services/api';
import { SparklesIcon, RefreshCwIcon } from './components/Icons';
import './App.css';

function App() {
  const [approvalData, setApprovalData] = useState(null);
  const [approvalCallback, setApprovalCallback] = useState(null);
  const [knowledgeBase, setKnowledgeBase] = useState({ chunks: 0, sources: [] });
  const [conversationKey, setConversationKey] = useState(0);

  const refreshKnowledgeBase = useCallback(async () => {
    try {
      const result = await getKnowledgeBaseStatus();
      setKnowledgeBase({ chunks: result.chunks || 0, sources: result.sources || [] });
    } catch {
      setKnowledgeBase({ chunks: 0, sources: [] });
    }
  }, []);

  useEffect(() => {
    let active = true;
    getKnowledgeBaseStatus()
      .then((result) => {
        if (active) setKnowledgeBase({ chunks: result.chunks || 0, sources: result.sources || [] });
      })
      .catch(() => {
        if (active) setKnowledgeBase({ chunks: 0, sources: [] });
      });
    return () => {
      active = false;
    };
  }, []);

  const handleRequireApproval = (toolCall, callback) => {
    setApprovalData(toolCall);
    setApprovalCallback(() => callback);
  };

  const handleNewSession = () => {
    startNewConversation();
    setConversationKey((current) => current + 1);
  };

  return (
    <div className="app-container">
      <AdminSidebar
        knowledgeBase={knowledgeBase}
        onKnowledgeBaseChange={refreshKnowledgeBase}
        onKnowledgeBaseCleared={handleNewSession}
      />
      <main className="main-content">
        <header className="app-header">
          <div className="header-left">
            <div className="header-breadcrumb">
              <span>Operations Workspace</span>
              <span>/</span>
              <span>Autonomous Copilot</span>
            </div>
            <h2 className="header-title">
              OpsAI Control Center
            </h2>
          </div>
          <div className="header-right">
            <div className="header-status-pill">
              <span className="status-dot-pulse" />
              <span>LangGraph Active</span>
            </div>
            <button
              className="new-session-btn"
              onClick={handleNewSession}
              title="Start a fresh conversation session"
            >
              <RefreshCwIcon size={14} />
              <span>New Session</span>
            </button>
          </div>
        </header>
        <ChatInterface key={conversationKey} onRequireApproval={handleRequireApproval} />
      </main>
      {approvalData && (
        <ApprovalModal
          toolCall={approvalData}
          onResolve={(result) => {
            if (approvalCallback) approvalCallback(result);
            setApprovalData(null);
          }}
        />
      )}
    </div>
  );
}

export default App;
