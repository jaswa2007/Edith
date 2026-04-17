import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Info, Cpu, ChevronDown, ChevronUp, Video, Loader2, Zap } from 'lucide-react';
import VideoPlayer from './VideoPlayer';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const LEVEL_CONFIG = {
  'Slow Learner': {
    emoji: '🌱',
    color: '#ff6b6b',
    bg: 'rgba(255,107,107,0.08)',
    border: 'rgba(255,107,107,0.25)',
    desc: 'Simplified explanations, key exam points, and essential definitions tailored for you.',
  },
  'Average Student': {
    emoji: '📚',
    color: '#ffd93d',
    bg: 'rgba(255,217,61,0.08)',
    border: 'rgba(255,217,61,0.25)',
    desc: 'Structured notes with concepts, examples, and organized learning pathways.',
  },
  'Topper': {
    emoji: '🏆',
    color: '#00E5FF',
    bg: 'rgba(0,229,255,0.08)',
    border: 'rgba(0,229,255,0.25)',
    desc: 'Deep concept explanations, advanced topics, and possible exam questions.',
  },
};

/**
 * AdaptiveNotes — displays AI-generated adaptive notes for the learner's level,
 * plus a "Generate Video Lecture" button that triggers the AI video pipeline.
 */
export default function AdaptiveNotes({ score, extractedText }) {
  const [notes,         setNotes]         = useState('');
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [collapsed,     setCollapsed]     = useState(false);
  const [videoUrl,      setVideoUrl]      = useState('');
  const [videoLoading,  setVideoLoading]  = useState(false);
  const [videoError,    setVideoError]    = useState('');

  // Determine level
  let level = 'Slow Learner';
  if (score >= 3 && score <= 4) level = 'Average Student';
  else if (score === 5)         level = 'Topper';

  const lc = LEVEL_CONFIG[level];

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/generate-notes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            text: extractedText,
            level: level,
          })
        });

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error("API Limit Reached (429). Please wait a few seconds or use a unique API Key in .env.");
          }
          throw new Error('Failed to generate adaptive notes. Please try again.');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        setLoading(false); // Stop block loader

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          setNotes((prev) => prev + chunk);
        }
      } catch (err) {
        console.error(err);
        let msg = err.message || 'Failed to generate adaptive notes. Please try again.';
        setError(msg);
        setLoading(false);
      }
    };
    fetchNotes();
  }, [extractedText, level]);

  const handleGenerateVideo = async () => {
    setVideoError('');
    setVideoLoading(true);
    try {
      const res = await axios.post(`${API_URL}/generate-video`, {
        text:  extractedText,
        level: level,
      });
      setVideoUrl(res.data.video_url);
    } catch (err) {
      console.error(err);
      let errMsg = err.response?.data?.detail || err.message;
      if (err.response?.status === 429) {
        errMsg = "AI Quota Exceeded (429). Please retry in a few moments or update your API Key.";
      }
      setVideoError(errMsg);
    } finally {
      setVideoLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Level badge header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5"
        style={{ borderColor: lc.border, background: lc.bg }}
      >
        <div className="text-5xl filter drop-shadow-lg">{lc.emoji}</div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h3
              className="font-display font-bold text-xl"
              style={{ color: lc.color, textShadow: `0 0 10px ${lc.color}80` }}
            >
              {level}
            </h3>
            <span className="text-xs font-mono text-white/40 px-2 py-0.5 rounded bg-white/5">
              {score}/5 correct
            </span>
          </div>
          <p className="text-white/50 text-sm font-light">{lc.desc}</p>
        </div>
        <div className="flex flex-col items-end gap-2 text-xs text-white/30 font-mono">
          <div className="flex items-center gap-2 text-xs text-white/30 font-mono">
            <Cpu size={14} className="text-neon" />
            AI Personalized
          </div>
          <div className="flex items-center gap-2 px-2 py-1 rounded bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30">
            🧠 SMART RAG ACTIVE
          </div>
        </div>
      </motion.div>

      {/* Notes panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-panel overflow-hidden"
      >
        {/* Panel header */}
        <div
          className="flex items-center justify-between p-6 pb-0 cursor-pointer select-none"
          onClick={() => setCollapsed(c => !c)}
        >
          <h3 className="flex items-center gap-3 text-xl font-display font-bold">
            <span
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              style={{ background: lc.bg, border: `1px solid ${lc.border}` }}
            >
              ✨
            </span>
            Adaptive Study Notes
          </h3>
          <button className="text-white/40 hover:text-white transition-colors">
            {collapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </button>
        </div>

        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="overflow-hidden"
            >
              <div className="p-6 pt-6 relative group/notes">
                {/* Floating Action Toolbar */}
                {!loading && !error && (
                  <div className="absolute top-4 right-6 flex gap-2 opacity-0 group-hover/notes:opacity-100 transition-opacity z-20">
                    <button className="px-3 py-1 rounded-full bg-neon/10 border border-neon/30 text-[10px] font-bold text-neon hover:bg-neon/20 transition-all flex items-center gap-1">
                      <Zap size={10} /> SIMPLIFY
                    </button>
                    <button className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-[10px] font-bold text-purple-400 hover:bg-purple-500/20 transition-all flex items-center gap-1">
                      <Cpu size={10} /> DEEP DIVE
                    </button>
                  </div>
                )}

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="loading-spinner mb-6" />
                    <p className="text-white/50 animate-pulse font-light italic">
                      EDITH is tailoring your insights…
                    </p>
                  </div>
                ) : error ? (
                  <div className="flex items-center gap-4 text-red-400 p-5 bg-red-400/10 rounded-2xl border border-red-400/20">
                    <Info size={20} />
                    <p>{error}</p>
                  </div>
                ) : (
                  <div className={`prose prose-invert prose-lg max-w-none
                    prose-headings:font-display prose-headings:text-[#00E5FF]
                    prose-p:text-white/80 prose-p:leading-relaxed
                    prose-strong:text-[#7B61FF]
                    prose-code:text-[#00E5FF] prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                    prose-li:text-white/75
                    prose-a:text-[#00E5FF]
                    prose-hr:border-white/10
                    ${!loading ? 'glow-stream' : ''}`}>
                    <ReactMarkdown>{notes}</ReactMarkdown>
                    {/* Visual cursor for streaming */}
                    {notes && <motion.span 
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className="inline-block w-2 h-5 bg-neon ml-1 align-middle"
                    />}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Video Lecture Section */}
      {!loading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-neon p-6"
        >
          {!videoUrl ? (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Video size={20} className="text-neon" />
                <h4 className="font-display font-bold text-lg gradient-heading">
                  AI Video Lecture
                </h4>
              </div>
              <p className="text-white/45 text-sm mb-6 font-light">
                Generate a personalized video lecture with slides and narration — powered by EDITH AI.
              </p>

              {videoError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-xl text-sm mb-4 flex items-center gap-2">
                  <Info size={16} />
                  {videoError}
                </div>
              )}

              <button
                onClick={handleGenerateVideo}
                disabled={videoLoading}
                className="btn-neon px-8 py-3 flex items-center gap-3 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {videoLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Generating Video… (30–60s)
                  </>
                ) : (
                  <>
                    <Zap size={18} />
                    🎬 Generate Video Lecture
                  </>
                )}
              </button>

              {videoLoading && (
                <p className="text-white/30 text-xs mt-4 font-mono animate-pulse">
                  Rendering slides • Generating narration • Encoding video…
                </p>
              )}
            </div>
          ) : (
            <VideoPlayer videoUrl={videoUrl} level={level} />
          )}
        </motion.div>
      )}
    </div>
  );
}
