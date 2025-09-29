import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import { ArrowLeft, Send, Bot, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Chat.css';

const Chat: React.FC = () => {
  const { messages, sendMessage, isLoading } = useChat();
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const message = inputMessage.trim();
    setInputMessage('');
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <Link to="/" className="back-btn">
          <ArrowLeft size={20} />
        </Link>
        <div className="chat-title">
          <Bot size={24} />
          <span>AI Companion</span>
        </div>
        <div className="chat-status">
          {isLoading ? 'Typing...' : 'Online'}
        </div>
      </header>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <Bot size={48} className="welcome-icon" />
            <h3>Hello! I'm your AI mental wellness companion</h3>
            <p>I'm here to listen, support, and help you through your day. How are you feeling today?</p>
            <div className="quick-responses">
              <button 
                onClick={() => sendMessage("I'm feeling anxious")}
                className="quick-response-btn"
              >
                I'm feeling anxious
              </button>
              <button 
                onClick={() => sendMessage("I need someone to talk to")}
                className="quick-response-btn"
              >
                I need someone to talk to
              </button>
              <button 
                onClick={() => sendMessage("I'm having a good day")}
                className="quick-response-btn"
              >
                I'm having a good day
              </button>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.type === 'user' ? 'user-message' : 'ai-message'}`}
            >
              <div className="message-avatar">
                {message.type === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className="message-content">
                <div className="message-text">{message.content}</div>
                <div className="message-time">
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="message ai-message">
            <div className="message-avatar">
              <Bot size={16} />
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-input">
        <div className="input-container">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            rows={1}
            disabled={isLoading}
            className="message-input"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="send-btn"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;














