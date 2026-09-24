import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatPage from './pages/ChatPage';
import UploadPage from './pages/UploadPage';
import './App.css';

function App() {
  const [activeView, setActiveView] = useState('chat');

  return (
    <div className="app-shell">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="main-content">
        {activeView === 'chat' ? <ChatPage /> : <UploadPage />}
      </main>
    </div>
  );
}

export default App;
