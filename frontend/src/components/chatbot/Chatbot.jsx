import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Bot } from 'lucide-react';
import api from '../../utils/api';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! I'm your LearnKro AI assistant. How can I help you today?", user: false }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { text: input.trim(), user: true };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.post('/chatbot', {
        messages: newMessages
      });

      if (response.data.success) {
        setMessages(prev => [...prev, { text: response.data.response, user: false }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting right now. Please try again later.", user: false, isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-primary-500/30 hover:scale-105 transition-transform"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}
      
      {isOpen && (
        <div className="bg-dark-900 border border-dark-800 rounded-2xl shadow-2xl w-80 sm:w-96 h-[500px] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">LearnKro Assistant</h3>
                <p className="text-xs text-primary-200">Powered by Groq AI</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-dark-950 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.user ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl p-3 text-sm leading-relaxed ${
                  msg.user 
                    ? 'bg-primary-600 text-white rounded-tr-sm' 
                    : msg.isError 
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30 rounded-tl-sm'
                      : 'bg-dark-800 text-gray-200 border border-dark-700 rounded-tl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-dark-800 text-gray-400 border border-dark-700 rounded-2xl rounded-tl-sm p-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-dark-900 border-t border-dark-800">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={isLoading}
                className="w-full bg-dark-950 border border-dark-800 text-white text-sm rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:border-primary-500 disabled:opacity-50"
                placeholder="Ask me anything..."
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-primary-400 hover:text-primary-300 disabled:text-gray-600 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;