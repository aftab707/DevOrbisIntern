import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { API_BASE_URL } from '../services/api';

const QUICK_PROMPTS = [
  "✨ Summarize key skills for a Senior Full Stack Engineer",
  "💼 Write a personalized cold reachout message for LinkedIn",
  "⚡ How to optimize React re-renders in large applications?",
  "🎯 Give me 5 tough interview questions for a Python Backend Dev"
];

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const handleSendMessage = async (customPrompt) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isStreaming) return;

    const userMessage = { role: "user", content: textToSend.trim() };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    if (!customPrompt) setInput("");
    setIsStreaming(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages })
      });

      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      // Add placeholder for streaming assistant response
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkText = decoder.decode(value, { stream: true });

        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          const lastMsg = { ...updated[lastIdx] };
          lastMsg.content += chunkText;
          updated[lastIdx] = lastMsg;
          return updated;
        });
      }
    } catch (error) {
      console.error("Chat streaming error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Sorry, I encountered an error communicating with Groq API. Please check backend connection." }
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopy = (content, index) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClearChat = () => {
    if (messages.length === 0) return;
    if (window.confirm("Clear current conversation history?")) {
      setMessages([]);
    }
  };

  return (
    <div className="chat-page">
      {/* Messages Feed */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-welcome">
            <div className="welcome-bot-avatar">🤖</div>
            <h2 className="welcome-title">ChatBot Assistant</h2>
            <p className="welcome-sub">
              Your smart copilot powered by Groq LLaMA 3. Ask me technical questions, draft messages, or brainstorm ideas.
            </p>

            <div className="welcome-suggestions">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  className="suggestion-chip"
                  onClick={() => handleSendMessage(prompt.replace(/^[^\s]+\s/, ''))}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Action bar for chat controls */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: '4px' }}>
              <button
                onClick={handleClearChat}
                className="reset-btn"
                style={{ padding: '4px 10px', fontSize: '11.5px', borderRadius: '6px' }}
                title="Reset conversation"
              >
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear History
              </button>
            </div>

            {messages.map((msg, index) => (
              <div key={index} className={`msg-row ${msg.role === 'user' ? 'user' : 'bot'}`}>
                <div className={`msg-avatar ${msg.role === 'user' ? 'user' : 'bot'}`}>
                  {msg.role === 'user' ? '👤' : '🤖'}
                </div>

                <div className="msg-bubble-wrap">
                  <span className="msg-name">{msg.role === 'user' ? 'You' : 'BeeBot'}</span>
                  <div className={`msg-bubble ${msg.role === 'user' ? 'user' : 'bot'}`}>
                    {msg.role === 'assistant' ? (
                      <>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content || (isStreaming && index === messages.length - 1 ? "Thinking..." : "")}
                        </ReactMarkdown>
                        {isStreaming && index === messages.length - 1 && msg.content && (
                          <span className="streaming-cursor" title="Streaming..." />
                        )}
                      </>
                    ) : (
                      <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
                    )}
                  </div>

                  {msg.role === 'assistant' && msg.content && (
                    <button
                      onClick={() => handleCopy(msg.content, index)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        fontSize: '11px',
                        cursor: 'pointer',
                        padding: '2px 4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginTop: '2px',
                        alignSelf: 'flex-start'
                      }}
                      title="Copy response"
                    >
                      {copiedIndex === index ? (
                        <>✓ Copied</>
                      ) : (
                        <>
                          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator while waiting for stream start */}
            {isStreaming && messages[messages.length - 1]?.content === "" && (
              <div className="msg-row bot">
                <div className="msg-avatar bot">🤖</div>
                <div className="typing-bubble">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="chat-input-bar">
        <div className="chat-input-inner">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your prompt here... (Press Enter to send, Shift+Enter for newline)"
            className="chat-input-field"
            disabled={isStreaming}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isStreaming || !input.trim()}
            className="chat-send-btn"
            title="Send message"
          >
            {isStreaming ? (
              <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />
            ) : (
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
        <p className="chat-hint">ChatBot uses Groq ultra-fast inference with real-time token streaming.</p>
      </div>
    </div>
  );
};

export default Chatbot;
