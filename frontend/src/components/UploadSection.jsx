import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, FileText, Video, Edit3, Loader2, ArrowLeft, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuizSection } from './QuizSection';
import { ResultsSection } from './ResultsSection';
import NeuralBackground from './NeuralBackground';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const TABS = [
  { id: 'pdf',   icon: FileText, label: 'PDF',    color: '#3b82f6', badge: 'PDF' },
  { id: 'image', icon: Upload,   label: 'Image',  color: '#10b981', badge: 'OCR' },
  { id: 'video', icon: Video,    label: 'Video',  color: '#ef4444', badge: 'YT' },
  { id: 'text',  icon: Edit3,    label: 'Notes',  color: '#f59e0b', badge: 'TEXT' },
];

export function UploadSection() {
  const { type }  = useParams();
  const navigate  = useNavigate();

  const [activeTab,     setActiveTab]     = useState(type || 'pdf');
  const [file,          setFile]          = useState(null);
  const [url,           setUrl]           = useState('');
  const [text,          setText]          = useState('');
  const [error,         setError]         = useState('');
  const [stage,         setStage]         = useState('upload'); // 'upload' | 'processing' | 'quiz' | 'notes'
  const [extractedText, setExtractedText] = useState('');
  const [quizData,      setQuizData]      = useState([]);
  const [score,         setScore]         = useState(0);

  useEffect(() => { if (type) setActiveTab(type); }, [type]);

  const handleProcess = async () => {
    setError('');
    setStage('processing');
    try {
      let extracted = '';

      if (activeTab === 'pdf') {
        if (!file) throw new Error('Please select a PDF file');
        const fd = new FormData(); fd.append('file', file);
        const res = await axios.post(`${API_URL}/extract-pdf`, fd);
        extracted = res.data.text;
      } else if (activeTab === 'image') {
        if (!file) throw new Error('Please select an image file');
        const fd = new FormData(); fd.append('file', file);
        const res = await axios.post(`${API_URL}/extract-image`, fd);
        extracted = res.data.text;
      } else if (activeTab === 'video') {
        if (!url) throw new Error('Please enter a YouTube URL');
        const res = await axios.post(`${API_URL}/extract-video`, { url });
        extracted = res.data.text;
      } else if (activeTab === 'text') {
        if (!text) throw new Error('Please enter some notes');
        extracted = text;
      }

      if (!extracted || !extracted.trim()) {
        throw new Error('No text could be extracted. Please try different material.');
      }
      setExtractedText(extracted);

      const quizRes = await axios.post(`${API_URL}/generate-quiz`, { text: extracted });
      if (!quizRes.data?.quiz?.length) throw new Error('Could not generate quiz from this material.');
      setQuizData(quizRes.data.quiz);
      setStage('quiz');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || 'An error occurred connecting to the backend.');
      setStage('upload');
    }
  };

  const activeTabConfig = TABS.find(t => t.id === activeTab);

  // ── Processing screen ────────────────────────────────────────────────────
  if (stage === 'processing') {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center py-24 relative">
        <div className="absolute inset-0 opacity-50">
          <NeuralBackground opacity={0.4} nodeCount={40} />
        </div>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 flex flex-col items-center"
        >
          {/* Spinning rings */}
          <div className="relative w-28 h-28 mb-10">
            <div className="absolute inset-0 rounded-full border-2 border-neon/20 animate-spin"
                 style={{ animationDuration: '3s' }} />
            <div className="absolute inset-2 rounded-full border border-glow/30 animate-spin"
                 style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Cpu size={32} style={{ color: '#00E5FF', filter: 'drop-shadow(0 0 8px rgba(0,229,255,0.8))' }}
                   className="animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-display font-bold mb-3 gradient-heading">Analyzing Knowledge</h2>
          <p className="text-white/50 text-center font-light max-w-sm">
            EDITH is processing your material and generating a personalized quiz…
          </p>
          <div className="flex gap-1 mt-8">
            {[0,1,2].map(i => (
              <motion.div key={i} animate={{ y: [0, -8, 0] }}
                transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-neon" />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  if (stage === 'quiz') {
    return <QuizSection quizData={quizData} setScore={setScore} setStage={setStage} />;
  }

  if (stage === 'notes') {
    return (
      <ResultsSection score={score} extractedText={extractedText}
        onRestart={() => { setStage('upload'); setExtractedText(''); setQuizData([]); setScore(0); }}
      />
    );
  }

  // ── Upload screen ────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-neon p-8 w-full max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono mb-4"
             style={{ background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', color: '#00E5FF' }}>
          <Cpu size={12} /> EDITH AI Processing
        </div>
        <h2 className="text-3xl font-display font-bold mb-2 gradient-heading">Decode Material</h2>
        <p className="text-white/45 font-light text-sm">
          Upload your study material — EDITH creates a personalized learning path.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-white/[0.03] rounded-2xl p-1.5 mb-8"
           style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setFile(null); setError(''); }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-2 rounded-xl text-xs font-bold transition-all duration-300"
              style={isActive ? {
                background: `${tab.color}18`,
                border: `1px solid ${tab.color}35`,
                color: tab.color,
                boxShadow: `0 0 12px ${tab.color}20`,
              } : {
                color: 'rgba(255,255,255,0.35)',
                border: '1px solid transparent',
              }}
            >
              <tab.icon size={15} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="hidden sm:inline text-[9px] opacity-60 font-mono">{tab.badge}</span>
            </button>
          );
        })}
      </div>

      {/* Input area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="min-h-[200px] flex flex-col items-center justify-center rounded-2xl p-8 mb-6"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: `2px dashed ${activeTabConfig?.color}30` ,
          }}
        >
          {activeTab === 'pdf' && (
            <div className="w-full flex flex-col items-center gap-4">
              <FileText size={44} style={{ color: '#3b82f6', filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.4))' }} />
              <p className="text-white/40 text-sm">Select a PDF document to extract knowledge</p>
              <input
                type="file" accept=".pdf"
                onChange={e => setFile(e.target.files[0])}
                className="text-sm text-white/60 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
                           file:text-xs file:font-bold file:bg-blue-500/20 file:text-blue-400
                           hover:file:bg-blue-500/30 cursor-pointer file:transition-colors"
              />
              {file && <p className="text-xs text-white/40 font-mono mt-1">Selected: {file.name}</p>}
            </div>
          )}

          {activeTab === 'image' && (
            <div className="w-full flex flex-col items-center gap-4">
              <Upload size={44} style={{ color: '#10b981', filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.4))' }} />
              <p className="text-white/40 text-sm">Upload handwritten notes image for OCR</p>
              <input
                type="file" accept="image/*"
                onChange={e => setFile(e.target.files[0])}
                className="text-sm text-white/60 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
                           file:text-xs file:font-bold file:bg-emerald-500/20 file:text-emerald-400
                           hover:file:bg-emerald-500/30 cursor-pointer file:transition-colors"
              />
              {file && <p className="text-xs text-white/40 font-mono mt-1">Selected: {file.name}</p>}
            </div>
          )}

          {activeTab === 'video' && (
            <div className="w-full flex flex-col items-center gap-5">
              <Video size={44} style={{ color: '#ef4444', filter: 'drop-shadow(0 0 8px rgba(239,68,68,0.4))' }} />
              <p className="text-white/40 text-sm">Paste a YouTube video URL to extract transcript</p>
              <input
                type="text"
                placeholder="https://www.youtube.com/watch?v=..."
                className="input-glass w-full py-3 px-4 text-sm"
                value={url} onChange={e => setUrl(e.target.value)}
              />
            </div>
          )}

          {activeTab === 'text' && (
            <div className="w-full flex flex-col gap-3">
              <Edit3 size={30} style={{ color: '#f59e0b', filter: 'drop-shadow(0 0 6px rgba(245,158,11,0.4))' }}
                     className="self-center" />
              <textarea
                rows={6}
                placeholder="Paste or type your study notes here…"
                className="input-glass w-full py-3 px-4 text-sm resize-none"
                value={text} onChange={e => setText(e.target.value)}
              />
              <p className="text-xs text-white/25 font-mono self-end">{text.length} chars</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {error && (
        <motion.div
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl mb-5 text-sm flex items-start gap-3"
        >
          <span>⚠️</span>
          <p>{error}</p>
        </motion.div>
      )}

      <button
        onClick={handleProcess}
        className="btn-primary w-full py-4 text-sm font-bold tracking-wide flex items-center justify-center gap-2"
      >
        <Cpu size={16} />
        Analyze & Generate Quiz
        <span>→</span>
      </button>
    </motion.div>
  );
}
