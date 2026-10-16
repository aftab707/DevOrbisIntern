import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { chatWithAgent } from '../services/api';
import {
  SparklesIcon,
  BotIcon,
  UserIcon,
  SendIcon,
  CalculatorIcon,
  BookOpenIcon,
  BuildingIcon,
  MailIcon,
  ShieldAlertIcon,
  ChevronRightIcon
} from './Icons';

const bentoCards = [
  {
    category: 'RAG Knowledge',
    title: 'Company Policy & Facts',
    prompt: 'Who is Aftab?',
    icon: <BookOpenIcon size={16} />
  },
  {
    category: 'CRM Database',
    title: 'Client Financials & Status',
    prompt: 'Find Acme Corp status and balance.',
    icon: <BuildingIcon size={16} />
  },
  {
    category: 'Operations Math',
    title: 'Financial Computations',
    prompt: 'Calculate 18% of 2450.',
    icon: <CalculatorIcon size={16} />
  },
  {
    category: 'Protected Dispatch',
    title: 'Client Communication (HITL)',
    prompt: 'Send email to john@acme.com with statement.',
    icon: <MailIcon size={16} />
  }
];

const ChatInterface = ({ onRequireApproval }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [selectedTool, setSelectedTool] = useState('auto');
  const [loading, setLoading] = useState(false);
  const messageEndRef = useRef(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading]);

  const sendMessage = async (messageText) => {
    if (!messageText.trim() || loading) return;
    const userMessage = { sender: 'user', text: messageText.trim() };
    setMessages((current) => [...current, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const result = await chatWithAgent(userMessage.text, selectedTool);
      if (result.needs_approval) {
        onRequireApproval(result.pending_tool_call, (finalResponse) => {
          setMessages((current) => [...current, { sender: 'agent', text: finalResponse.response }]);
          onRequireApproval(null, null);
        });
      } else {
        setMessages((current) => [...current, { sender: 'agent', text: result.response }]);
      }
    } catch (error) {
      setMessages((current) => [
        ...current,
        { sender: 'error', text: error.response?.data?.detail || 'Could not reach the OpsAI agent API. Please ensure the backend is running.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <section className="chat-interface" aria-label="Operations Assistant conversation">
      <div className="conversation" aria-live="polite">
        {messages.length === 0 ? (
          <div className="welcome-state">
            <div className="welcome-hero-badge" aria-hidden="true">
              <BotIcon size={28} />
            </div>
            <h2 className="welcome-title">How can I assist your operations?</h2>
            <p className="welcome-subtitle">
              Equipped with real-time LangGraph tools: query client CRM records, calculate taxes, 
              search indexed PDFs via pgvector RAG, and prepare authenticated communications.
            </p>

            <div className="bento-prompt-grid">
              {bentoCards.map((card) => (
                <button
                  key={card.prompt}
                  className="bento-card"
                  onClick={() => sendMessage(card.prompt)}
                  disabled={loading}
                >
                  <div className="bento-card-top">
                    <span className="bento-icon-pill">{card.icon}</span>
                    <span className="bento-category">{card.category}</span>
                  </div>
                  <span className="bento-card-title">{card.title}</span>
                  <span className="bento-card-prompt">"{card.prompt}"</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="message-stack">
            {messages.map((message, index) => (
              <article key={`${message.sender}-${index}`} className={`message-row ${message.sender}`}>
                <div className="message-avatar" aria-hidden="true">
                  {message.sender === 'user' ? <UserIcon size={18} /> : <BotIcon size={18} />}
                </div>
                <div className="message-body-wrap">
                  <span className="message-meta">
                    {message.sender === 'user' ? 'Operator' : 'Ops Assistant'}
                  </span>
                  <div className="message-content markdown-body">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
                  </div>
                </div>
              </article>
            ))}

            {loading && (
              <article className="message-row agent">
                <div className="message-avatar" aria-hidden="true">
                  <BotIcon size={18} />
                </div>
                <div className="message-body-wrap">
                  <span className="message-meta">Ops Assistant</span>
                  <div className="typing-container">
                    <div className="typing-pulse-dots">
                      <span />
                      <span />
                      <span />
                    </div>
                    <span className="typing-label">Executing LangGraph graph nodes...</span>
                  </div>
                </div>
              </article>
            )}
          </div>
        )}
        <div ref={messageEndRef} />
      </div>

      {/* Modern Floating Bottom Composer Bar */}
      <div className="composer-wrapper">
        <form onSubmit={handleSubmit} className="composer-card">
          <select
            value={selectedTool}
            onChange={(e) => setSelectedTool(e.target.value)}
            disabled={loading}
            className="tool-select-custom"
            aria-label="Force or Auto Select Agent Tool"
          >
            <option value="auto">✨ Auto-Route (Agent)</option>
            <option value="calculator">🧮 Calculator</option>
            <option value="search_knowledge_base">📚 Knowledge Base</option>
            <option value="lookup_client">🔍 Client CRM Lookup</option>
            <option value="email">✉️ Email Operations</option>
          </select>

          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Ops Assistant or command a tool action..."
            aria-label="Message Ops Assistant"
            disabled={loading}
            className="composer-input"
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send message"
            className="composer-send-btn"
          >
            <SendIcon size={18} />
          </button>
        </form>

        <div className="composer-disclaimer">
          <ShieldAlertIcon size={13} style={{ color: '#f59e0b' }} />
          <span>LangGraph Human-in-the-Loop Protocol Active • External side-effects require verification</span>
        </div>
      </div>
    </section>
  );
};

export default ChatInterface;
