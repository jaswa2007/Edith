import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, RefreshCw, Trophy, Target } from 'lucide-react';
import AdaptiveNotes from './AdaptiveNotes';
import FlashcardsSection from './FlashcardsSection';
import EdithChat from './EdithChat';
import axios from 'axios';
const API_URL = 'http://localhost:8000';

/**
 * ResultsSection — shows quiz score summary and delegates to AdaptiveNotes
 * which handles note generation AND video lecture generation.
 */
export function ResultsSection({ score, extractedText, onRestart }) {
  const navigate = useNavigate();
  const [flashcards, setFlashcards] = React.useState(null);
  const [loadingFlashcards, setLoadingFlashcards] = React.useState(false);
  const [flashcardsError, setFlashcardsError] = React.useState('');

  // Determine level
  let level  = 'Slow Learner';
  let emoji  = '🌱';
  let pct    = (score / 5) * 100;
  if (score >= 3 && score <= 4) { level = 'Average Student'; emoji = '📚'; }
  if (score === 5)              { level = 'Topper';           emoji = '🏆'; }

  const arcColor = score <= 2 ? '#ff6b6b' : score <= 4 ? '#ffd93d' : '#00E5FF';

  const handleGenerateFlashcards = async () => {
    setLoadingFlashcards(true);
    setFlashcardsError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_URL}/generate-flashcards`,
        { text: extractedText, level: level },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFlashcards(res.data.flashcards);
    } catch (err) {
      console.error(err);
      let errMsg = err.response?.data?.detail || err.message;
      if (err.response?.status === 429) {
        errMsg = "AI Quota Exceeded (429). Please retry in a few moments.";
      }
      setFlashcardsError(errMsg);
    } finally {
      setLoadingFlashcards(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-4xl mx-auto space-y-8"
    >

      {/* Score Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 relative overflow-hidden"
        style={{
          borderColor: `${arcColor}30`,
          background: `radial-gradient(circle at 80% 50%, ${arcColor}08 0%, transparent 60%), rgba(255,255,255,0.02)`,
        }}
      >
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5"
             style={{ background: `linear-gradient(90deg, transparent, ${arcColor}, transparent)` }} />

        {/* Scan side decoration */}
        <div className="absolute right-8 top-8 opacity-10">
          <Trophy size={80} style={{ color: arcColor }} />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-10 relative z-10">

          {/* Score ring */}
          <div className="relative w-36 h-36 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
              <circle cx="50" cy="50" r="42" fill="none"
                style={{ stroke: arcColor, strokeWidth: 8,
                         strokeDasharray: `${2 * Math.PI * 42}`,
                         strokeDashoffset: `${2 * Math.PI * 42 * (1 - pct / 100)}`,
                         strokeLinecap: 'round',
                         filter: `drop-shadow(0 0 6px ${arcColor})`,
                         transition: 'stroke-dashoffset 1.2s ease' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-display font-black" style={{ color: arcColor }}>
                {score}
              </span>
              <span className="text-white/30 text-sm font-mono">/ 5</span>
            </div>
          </div>

          {/* Text info */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">{emoji}</span>
              <h2 className="text-3xl font-display font-black text-white">Topic Decoded</h2>
            </div>
            <p className="text-white/40 text-sm italic mb-4">
              "Insight attained. Knowledge categorized."
            </p>

            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                   style={{ background: `${arcColor}15`, border: `1px solid ${arcColor}35`, color: arcColor }}>
                <Target size={14} />
                Assessed: {level}
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-white/60">
                Score: {score}/5 ({pct}%)
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Adaptive Notes + Video Lecture (handled inside AdaptiveNotes) */}
      <AdaptiveNotes score={score} extractedText={extractedText} />

      {/* Flashcards Generation Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-neon p-6 flex flex-col items-center"
      >
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-xl font-display font-bold">Spaced Repetition Flashcards</h3>
        </div>
        
        {!flashcards ? (
          <button
            onClick={handleGenerateFlashcards}
            disabled={loadingFlashcards}
            className="btn-neutral py-3 px-6 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loadingFlashcards ? 'Generating...' : 'Generate Flashcards'}
          </button>
        ) : (
          <FlashcardsSection flashcards={flashcards} />
        )}
        
        {flashcardsError && <p className="text-red-400 mt-4 text-sm">{flashcardsError}</p>}
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <button
          onClick={onRestart}
          className="btn-ghost py-4 text-base font-bold flex items-center justify-center gap-3"
        >
          <RefreshCw size={18} />
          Retry Assessment
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-primary py-4 text-base font-bold flex items-center justify-center gap-3"
        >
          <Home size={18} />
          Return to Dashboard
        </button>
      </motion.div>

      {/* Floating Interactive Assistant */}
      <EdithChat documentText={extractedText} level={level} />

    </motion.div>
  );
}
