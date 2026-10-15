import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sendChatMessage } from '../api/client';

const SUGGESTIONS = [
  {
    icon: '📋',
    tag: 'Executive Overview',
    title: 'Summarize Key Objectives',
    desc: 'Get a comprehensive high-level summary of the uploaded documents.',
    prompt: 'Please provide a clear and structured executive summary of the document, highlighting the main objectives.'
  },
  {
    icon: '⚡',
    tag: 'Technical Scope',
    title: 'Core Requirements & Tasks',
    desc: 'Extract main technical requirements, weekly goals, and deliverables.',
    prompt: 'What are the main technical requirements, key tasks, and deliverables detailed in the document?'
  },
  {
    icon: '📅',
    tag: 'Milestones',
    title: 'Deadlines & Schedule',
    desc: 'Extract all milestones, timeline expectations, and submission dates.',
    prompt: 'List all important dates, deadlines, schedules, or timelines mentioned in the document.'
  },
  {
    icon: '🎯',
    tag: 'Evaluation',
    title: 'Guidelines & Criteria',
    desc: 'Find guidelines, policies, and evaluation criteria outlined in the text.',
    prompt: 'What are the key rules, policies, and performance criteria described in the document?'
  }
];

const ChatPage = ({ onNavigateUpload }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [feedbackState, setFeedbackState] = useState({});
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (textToSend) => {
    const text = (textToSend || query).trim();
    if (!text || isTyping) return;

    const userMsg = { role: 'user', content: text, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setQuery('');
    setIsTyping(true);

    try {
      const response = await sendChatMessage(text);
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: response.answer,
          citations: response.citations || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: `⚠️ **Connection Error**: Could not retrieve answers from the RAG knowledge base (${error.message}). Please ensure the backend server is active and documents are indexed.`,
          citations: [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopy = (content, idx) => {
    navigator.clipboard.writeText(content);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleFeedback = (idx, type) => {
    setFeedbackState((prev) => ({ ...prev, [idx]: type }));
  };

  const handleClearChat = () => {
    if (messages.length === 0) return;
    if (window.confirm('Clear current chat conversation?')) {
      setMessages([]);
    }
  };

  return (
    <div className="chat-layout">
      {/* Top Header Bar */}
      <header className="chat-topbar">
        <div className="topbar-left">
          <div className="topbar-agent-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <div className="topbar-info">
            <h1>DocuChat AI Assistant</h1>
            <p>
              <span className="status-pulse-dot" />
              Connected to FAISS Vector Index · Grounded QA
            </p>
          </div>
        </div>

        <div className="topbar-actions">
          {onNavigateUpload && (
            <button className="topbar-btn" onClick={onNavigateUpload} title="Manage Knowledge Base Documents">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Upload PDF
            </button>
          )}

          {messages.length > 0 && (
            <button className="topbar-btn" onClick={handleClearChat} title="Clear conversation history">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              Clear
            </button>
          )}
        </div>
      </header>

      {/* Chat Messages Feed */}
      <div className="chat-history">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <div className="empty-hero-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h2>Enterprise Document Intelligence</h2>
            <p>
              Ask any question based on your uploaded company documents. DocuChat will retrieve relevant passages and provide grounded answers with citations.
            </p>

            {/* 4 Interactive Suggestions */}
            <div className="suggestions-grid">
              {SUGGESTIONS.map((item, idx) => (
                <div 
                  key={idx} 
                  className="suggestion-card"
                  onClick={() => handleSend(item.prompt)}
                >
                  <div className="suggestion-card-header">
                    <span>{item.icon}</span>
                    <span>{item.tag}</span>
                  </div>
                  <div className="suggestion-card-title">{item.title}</div>
                  <div className="suggestion-card-desc">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message-row ${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === 'user' ? (
                    '👤'
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                  )}
                </div>

                <div className="message-body-wrap">
                  <div className="message-sender">
                    {msg.role === 'user' ? 'You' : 'DocuChat AI'} · {msg.timestamp}
                  </div>

                  <div className="message-content">
                    <div className="markdown-body">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>

                    {/* Citations drawer */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="citations-box">
                        <div className="citations-header">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                          </svg>
                          Verified Source Passages ({msg.citations.length})
                        </div>
                        <div className="citations-list">
                          {msg.citations.map((cite, cIdx) => (
                            <span key={cIdx} className="citation-chip" title="Retrieved vector passage">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                              </svg>
                              {cite}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions for assistant message */}
                  {msg.role === 'ai' && (
                    <div className="bot-action-row">
                      <button 
                        className="action-icon-btn"
                        onClick={() => handleCopy(msg.content, idx)}
                        title="Copy answer"
                      >
                        {copiedIdx === idx ? (
                          <>
                            <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            <span style={{ color: '#10b981' }}>Copied</span>
                          </>
                        ) : (
                          <>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <button 
                        className="action-icon-btn"
                        onClick={() => handleFeedback(idx, 'up')}
                        style={{ color: feedbackState[idx] === 'up' ? '#0284c7' : 'inherit' }}
                        title="Helpful response"
                      >
                        <svg viewBox="0 0 24 24" fill={feedbackState[idx] === 'up' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.5a4.5 4.5 0 01-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.25" />
                        </svg>
                      </button>

                      <button 
                        className="action-icon-btn"
                        onClick={() => handleFeedback(idx, 'down')}
                        style={{ color: feedbackState[idx] === 'down' ? '#ef4444' : 'inherit' }}
                        title="Not helpful"
                      >
                        <svg viewBox="0 0 24 24" fill={feedbackState[idx] === 'down' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 15h2.25m8.024-9.75c.055.05.11.1.166.152m-13.69 0c.056-.052.11-.102.166-.152m13.358 0A11.95 11.95 0 0012 3a11.95 11.95 0 00-8.224 3.25m16.448 0c.388.482.68 1.042.848 1.637m-18.144 0a6.764 6.764 0 01.848-1.637" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* RAG Searching & Generating Indicator */}
            {isTyping && (
              <div className="message-row ai">
                <div className="message-avatar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
                <div className="thinking-box">
                  <div className="radar-spinner" />
                  <span className="thinking-text">Searching semantic vector index & synthesizing answer...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Modern Floating Input Capsule (ZAY-G Style) */}
      <div className="chat-input-area">
        <div className="input-container">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }} 
            className="input-capsule"
          >
            {onNavigateUpload && (
              <button
                type="button"
                className="input-icon-btn"
                onClick={onNavigateUpload}
                title="Upload or manage documents"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                </svg>
              </button>
            )}

            <input
              ref={inputRef}
              type="text"
              placeholder="Ask a question about your indexed documents... (Enter to send)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isTyping}
            />

            <button 
              type="submit" 
              className="send-action-btn"
              disabled={isTyping || !query.trim()}
              title="Send query"
            >
              {isTyping ? (
                <div className="radar-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', borderTopColor: '#fff' }} />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              )}
            </button>
          </form>

          <div className="disclaimer-row">
            <span>DocuChat answers are grounded in your company vector index.</span>
            <span>RAG Engine · BAAI/bge-small</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
