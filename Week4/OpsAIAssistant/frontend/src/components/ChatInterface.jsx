import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { chatWithAgent } from '../services/api';

const suggestedPrompts = [
  'Who is Aftab?',
  'Find Acme Corp status and balance.',
  'Calculate 18% of 2450.',
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
        { sender: 'error', text: error.response?.data?.detail || 'Could not reach the agent API.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(input);
  };

  return (
    <section className="chat-interface" aria-label="Assistant conversation">
      <div className="conversation" aria-live="polite">
        {messages.length === 0 ? (
          <div className="welcome-state">
            <div className="welcome-mark" aria-hidden="true">OA</div>
            <p className="eyebrow">Your operations copilot</p>
            <h3>What can I help you move forward today?</h3>
            <p>Search your uploaded knowledge base, check client records, calculate figures, or prepare an email for approval.</p>
            <div className="prompt-grid">
              {suggestedPrompts.map((prompt) => (
                <button key={prompt} className="prompt-card" onClick={() => sendMessage(prompt)} disabled={loading}>
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="message-stack">
            {messages.map((message, index) => (
              <article key={`${message.sender}-${index}`} className={`message-row ${message.sender}`}>
                <div className="message-avatar" aria-hidden="true">{message.sender === 'user' ? 'You' : 'OA'}</div>
                <div className="message-content markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
                </div>
              </article>
            ))}
            {loading && (
              <article className="message-row agent">
                <div className="message-avatar" aria-hidden="true">OA</div>
                <div className="message-content typing-indicator"><span /><span /><span /></div>
              </article>
            )}
          </div>
        )}
        <div ref={messageEndRef} />
      </div>

      <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <form onSubmit={handleSubmit} className="composer" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8f9fa', padding: '10px', borderRadius: '12px', border: '1px solid #e9ecef', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <select 
            value={selectedTool}
            onChange={(e) => setSelectedTool(e.target.value)}
            disabled={loading}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ced4da', background: '#fff', fontSize: '14px', cursor: 'pointer', outline: 'none', minWidth: '160px' }}
            aria-label="Select Tool"
          >
            <option value="auto">✨ Auto-Select Tool</option>
            <option value="calculator">🧮 Calculator</option>
            <option value="search_knowledge_base">📚 Knowledge Base</option>
            <option value="lookup_client">🔍 Client Lookup</option>
            <option value="email">✉️ Email Operations</option>
          </select>
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Message Ops Assistant..."
            aria-label="Message the Ops Assistant"
            disabled={loading}
            style={{ flex: 1, padding: '10px 15px', borderRadius: '8px', border: '1px solid #ced4da', fontSize: '15px', outline: 'none' }}
          />
          <button 
            type="submit" 
            disabled={loading || !input.trim()} 
            aria-label="Send message"
            style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: (loading || !input.trim()) ? '#a5d8ff' : '#228be6', color: '#fff', fontSize: '15px', fontWeight: '600', cursor: (loading || !input.trim()) ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
          >
            Send
          </button>
        </form>
        <p className="composer-note" style={{ textAlign: 'center', fontSize: '12px', color: '#868e96', margin: 0 }}>
          Responses from the knowledge base include sources when available. Forcing a tool skips AI routing and reduces latency.
        </p>
      </div>
    </section>
  );
};

export default ChatInterface;
