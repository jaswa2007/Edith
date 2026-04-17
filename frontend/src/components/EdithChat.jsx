import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Bot, User, Sparkles, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

export default function EdithChat({ documentText, level }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([
    { role: 'assistant', content: "Hello! I'm EDITH. Ask me anything about your study material." }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatLog]);

  const handleSend = async () => {
    if (!message.trim() || loading) return;

    const userMessage = { role: 'user', content: message };
    setChatLog(prev => [...prev, userMessage]);
    setMessage('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/chat`, {
        query: message,
        text: documentText || "No context provided",
        level: level || "Average Student"
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setChatLog(prev => [...prev, { role: 'assistant', content: response.data.answer }]);
    } catch (err) {
      console.error(err);
      setChatLog(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error connecting to my neural network." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              height: isMinimized ? '60px' : '500px'
            }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-80 sm:w-96 glass-neon mb-4 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-neon/10 border border-neon/30 flex items-center justify-center">
                  <Bot size={18} className="text-neon" />
                </div>
                <div>
                  <h3 className="text-sm font-display font-bold tracking-tight">EDITH ASSISTANT</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-white/30 uppercase">Neural Link Active</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 text-white/40 hover:text-white transition-colors"
                >
                  {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-white/40 hover:text-red-400 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Chat Content */}
            {!isMinimized && (
              <>
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 cyber-grid"
                >
                  {chatLog.map((chat, i) => (
                    <motion.div
                      initial={{ opacity: 0, x: chat.role === 'user' ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={i}
                      className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                        chat.role === 'user' 
                          ? 'bg-neon/10 border border-neon/20 text-white rounded-tr-none' 
                          : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-none'
                      }`}>
                        {chat.content}
                      </div>
                    </motion.div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin text-neon" />
                        <span className="text-xs text-white/40 font-mono tracking-widest">THINKING...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="p-4 bg-white/[0.02] border-t border-white/10">
                  <div className="relative">
                    <input 
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Ask a question..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-4 pr-12 text-sm focus:outline-none focus:border-neon/50 transition-all font-light"
                    />
                    <button 
                      onClick={handleSend}
                      disabled={loading || !message.trim()}
                      className="absolute right-1.5 top-1.5 w-8 h-8 rounded-lg bg-neon flex items-center justify-center text-dark hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                  <p className="text-[9px] text-center text-white/20 mt-2 font-mono uppercase tracking-tighter">
                    Personalized AI Tutor Mode Enabled
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 ${
          isOpen ? 'bg-white/5 border border-white/10 text-white/40 rotate-90' : 'bg-neon text-dark border-none'
        }`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-white/50 border border-white/20 flex items-center justify-center">
              <Sparkles size={10} className="text-dark" />
            </span>
          </span>
        )}
      </motion.button>
    </div>
  );
}
