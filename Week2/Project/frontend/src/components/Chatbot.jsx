import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { API_BASE_URL } from '../services/api';

const Chatbot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!input.trim() || isStreaming) return;

        const userMessage = { role: "user", content: input };
        const newMessages = [...messages, userMessage];
        
        setMessages(newMessages);
        setInput("");
        setIsStreaming(true);

        try {
            const response = await fetch(`${API_BASE_URL}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: newMessages })
            });

            if (!response.ok) throw new Error("Network response was not ok");

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            
            setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunkText = decoder.decode(value, { stream: true });
                
                setMessages((prev) => {
                    const updatedMessages = [...prev];
                    const lastIndex = updatedMessages.length - 1;
                    const updatedLastMessage = { ...updatedMessages[lastIndex] };
                    updatedLastMessage.content += chunkText;
                    updatedMessages[lastIndex] = updatedLastMessage;
                    return updatedMessages;
                });
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I encountered an error." }]);
        } finally {
            setIsStreaming(false);
        }
    };

    return (
        <div className="card chat-container">
            <div className="card-header">
                <h2>Streaming AI Chat</h2>
            </div>
            
            <div className="chat-box">
                {messages.length === 0 && <p className="placeholder-text">Type a message to begin the conversation.</p>}
                
                {messages.map((msg, index) => (
                    <div key={index} className={`message-row ${msg.role === 'user' ? 'user-row' : 'bot-row'}`}>
                        <div className={`message-bubble ${msg.role}`}>
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="input-row">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message..."
                    className="input-box"
                    disabled={isStreaming}
                />
                <button onClick={handleSendMessage} disabled={isStreaming} className="btn send-btn">
                    Send
                </button>
            </div>
        </div>
    );
};

export default Chatbot;
