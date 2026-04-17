import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, FileText, Video, Upload, Edit3, Brain, ClipboardList, Search, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:8000';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_URL}/history`);
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(item => 
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.action_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIcon = (type) => {
    switch (type) {
      case 'pdf': return <FileText className="text-blue-400" />;
      case 'video': return <Video className="text-red-400" />;
      case 'image': return <Upload className="text-emerald-400" />;
      case 'text': return <Edit3 className="text-yellow-400" />;
      case 'quiz': return <Brain className="text-purple-400" />;
      case 'notes': return <ClipboardList className="text-indigo-400" />;
      default: return <FileText />;
    }
  };

  return (
    <div className="min-h-screen p-6 lg:p-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-display font-bold">Your History</h1>
        </div>

        <div className="relative max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
          <input 
            type="text" 
            placeholder="Search your sessions..."
            className="input-glass w-full py-3 pl-12 pr-4 bg-white/5 border-white/10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className="max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          {loading ? (
             <motion.div 
               key="loading"
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="py-20 text-center"
             >
                <div className="loading-spinner mx-auto mb-4"></div>
                <p className="text-white/40">Loading history...</p>
             </motion.div>
          ) : filteredHistory.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="glass-panel p-12 text-center"
            >
              <div className="text-6xl mb-6 opacity-30">📚</div>
              <h3 className="text-xl font-medium mb-2">No history found</h3>
              <p className="text-white/40 mb-8 font-light">Start uploading materials to see them here.</p>
              <button 
                onClick={() => navigate('/dashboard')}
                className="btn-primary px-8 py-3"
              >
                Go to Dashboard
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              className="grid gap-4"
            >
              {filteredHistory.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedItem(item)}
                  className="glass-panel p-5 flex items-center justify-between hover:border-white/20 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                      {getIcon(item.action_type)}
                    </div>
                    <div>
                      <h4 className="font-medium text-lg mb-0.5">{item.title || 'Untitled Session'}</h4>
                      <div className="flex items-center gap-3 text-sm text-white/40">
                        <span className="capitalize">{item.action_type}</span>
                        <span>•</span>
                        <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-white/20 group-hover:text-white/60 transition-colors" />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Item Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-dark/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="glass-panel w-full max-w-3xl max-h-[80vh] overflow-y-auto p-8"
              onClick={e => e.stopPropagation()}
            >
               <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
                      {getIcon(selectedItem.action_type)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-display font-bold">{selectedItem.title}</h2>
                      <p className="text-white/40 text-sm">Processed on {new Date(selectedItem.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedItem(null)}
                    className="p-2 hover:bg-white/10 rounded-full"
                  >
                    ×
                  </button>
               </div>

               <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                  <h5 className="text-xs uppercase tracking-widest text-white/30 font-bold mb-4">Content Preview</h5>
                  <div className="text-white/80 leading-relaxed font-light whitespace-pre-wrap">
                    {selectedItem.content}
                  </div>
               </div>

               <div className="mt-8 flex justify-end">
                  <button 
                    onClick={() => setSelectedItem(null)}
                    className="btn-primary px-8 py-3"
                  >
                    Close
                  </button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
