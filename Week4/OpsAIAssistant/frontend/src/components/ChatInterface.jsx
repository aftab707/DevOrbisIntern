import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { chatWithAgent } from '../services/api';

const suggestedPrompts = [
  'Who is Aftab?',
  'Find Acme Corp status and balance.',
  'Calculate 18% of 2450.',
];

const ChatInterface = ({ onRequireApproval }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
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
      const result = await chatWithAgent(userMessage.text);
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
                  <ReactMarkdown>{message.text}</ReactMarkdown>
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

      <form onSubmit={handleSubmit} className="composer">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Message Ops Assistant..."
          aria-label="Message the Ops Assistant"
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()} aria-label="Send message">
          Send
        </button>
      </form>
      <p className="composer-note">Responses from the knowledge base include sources when available.</p>
    </section>
  );
};

export default ChatInterface;
