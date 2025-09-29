import React, { createContext, useContext, useState, ReactNode } from 'react';
import { chatAPI } from '../services/api';

interface Message {
  id: string;
  content: string;
  type: 'user' | 'ai' | 'system';
  timestamp: string;
  sessionId: string;
}

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  lastMessage?: string;
  messageCount: number;
}

interface ChatContextType {
  messages: Message[];
  currentSessionId: string | null;
  sessions: ChatSession[];
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  startNewSession: () => void;
  loadSession: (sessionId: string) => Promise<void>;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      type: 'user',
      timestamp: new Date().toISOString(),
      sessionId: currentSessionId || 'default',
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await chatAPI.sendMessage(content, currentSessionId || undefined);
      const { message, session_id } = response.data.data;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: message,
        type: 'ai',
        timestamp: new Date().toISOString(),
        sessionId: session_id,
      };

      setMessages(prev => [...prev, aiMessage]);
      
      if (!currentSessionId) {
        setCurrentSessionId(session_id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        type: 'system',
        timestamp: new Date().toISOString(),
        sessionId: currentSessionId || 'default',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewSession = () => {
    setCurrentSessionId(null);
    setMessages([]);
  };

  const loadSession = async (sessionId: string) => {
    setIsLoading(true);
    try {
      const response = await chatAPI.getHistory(sessionId);
      setMessages(response.data.data || []);
      setCurrentSessionId(sessionId);
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const value: ChatContextType = {
    messages,
    currentSessionId,
    sessions,
    isLoading,
    sendMessage,
    startNewSession,
    loadSession,
    clearMessages,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};














