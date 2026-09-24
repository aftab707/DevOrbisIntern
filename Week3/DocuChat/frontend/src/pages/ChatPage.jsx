import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { sendChatMessage } from '../api/client';

const ChatPage = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg = { role: 'user', content: query };
    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setIsTyping(true);

    try {
      const response = await sendChatMessage(userMsg.content);
      setMessages((prev) => [...prev, { 
        role: 'ai', 
        content: response.answer, 
        citations: response.citations 
      }]);
    } catch (error) {
      setMessages((prev) => [...prev, { 
        role: 'ai', 
        content: `Error: Could not connect to the knowledge base. (${error.message})` 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chat-layout">
      <div className="chat-header-aik">
        DocuChat Knowledge Assistant
      </div>
      <div className="chat-history">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 16v-4"></path>
              <path d="M12 8h.01"></path>
            </svg>
            <h2>How can I help you today?</h2>
            <p>Ask a question based on your uploaded company documents.</p>
          </div>
        ) : (
          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message-row ${msg.role}`}>
                <div className="message-content">
                  <div className="text markdown-body">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="citations-chip">
                      <strong>Sources:</strong> {msg.citations.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="message-row ai">
                <div className="message-content">
                  <div className="text typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      <div className="chat-input-area">
        <form onSubmit={handleSubmit} className="input-box">
          <input
            type="text"
            placeholder="Message DocuChat..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isTyping}
          />
          <button type="submit" disabled={isTyping || !query.trim()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
        <div className="disclaimer">DocuChat can make mistakes. Verify important information.</div>
      </div>
    </div>
  );
};

export default ChatPage;
