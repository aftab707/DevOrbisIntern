import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatPage from './pages/ChatPage';
import UploadPage from './pages/UploadPage';
import './index.css';
import './App.css';

function App() {
  const [activeView, setActiveView] = useState('chat');
  const [chatKey, setChatKey] = useState(0);

  const handleNewChat = () => {
    setActiveView('chat');
    setChatKey((prev) => prev + 1); // Triggers clean re-render of ChatPage
  };

  return (
    <div className="app-shell">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        onNewChat={handleNewChat}
      />
      <main className="main-content">
        {activeView === 'chat' ? (
          <ChatPage 
            key={chatKey} 
            onNavigateUpload={() => setActiveView('upload')} 
          />
        ) : (
          <UploadPage 
            onNavigateChat={() => setActiveView('chat')} 
          />
        )}
      </main>
    </div>
  );
}

export default App;
