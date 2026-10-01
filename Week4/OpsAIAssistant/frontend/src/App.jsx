import { useCallback, useEffect, useState } from 'react';
import AdminSidebar from './components/AdminSidebar';
import ChatInterface from './components/ChatInterface';
import ApprovalModal from './components/ApprovalModal';
import { getKnowledgeBaseStatus, startNewConversation } from './services/api';
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

  const handleKnowledgeBaseCleared = () => {
    startNewConversation();
    setConversationKey((current) => current + 1);
  };

  return (
    <div className="app-container">
      <AdminSidebar
        knowledgeBase={knowledgeBase}
        onKnowledgeBaseChange={refreshKnowledgeBase}
        onKnowledgeBaseCleared={handleKnowledgeBaseCleared}
      />
      <main className="main-content">
        <header className="app-header">
          <div>
            <p className="eyebrow">Operations workspace</p>
            <h2>Good to have you here.</h2>
          </div>
          <div className="header-status">
            <span className="status-dot ready" />
            Agent online
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
