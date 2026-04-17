import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Brain, Send, Loader2 } from 'lucide-react';

export function QuizSection({ quizData, setScore, setStage }) {
  const [answers,   setAnswers]   = useState({});
  const [submitted, setSubmitted] = useState(false);

  if (!quizData || quizData.length === 0) {
    return (
      <div className="glass-neon p-8 text-center max-w-xl mx-auto">
        <p className="text-red-400 mb-4">No questions could be generated. Please try again with different material.</p>
        <button onClick={() => setStage('upload')} className="btn-primary px-6 py-2">Go Back</button>
      </div>
    );
  }

  const handleSelect = (qIndex, option) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qIndex]: option }));
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < quizData.length) {
      alert('Please answer all questions first!');
      return;
    }
    let sc = 0;
    quizData.forEach((q, i) => { if (answers[i] === q.answer) sc++; });
    setScore(sc);
    setSubmitted(true);
    setTimeout(() => setStage('notes'), 2200);
  };

  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / quizData.length) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono mb-4 mr-2"
             style={{ background: 'rgba(123,97,255,0.1)', border: '1px solid rgba(123,97,255,0.3)', color: '#7B61FF' }}>
          <Brain size={12} />
          CONCEPT CHECK
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono mb-4"
             style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>
          🧠 SMART RAG RETRIEVAL ACTIVE
        </div>
        <h2 className="text-4xl font-display font-black gradient-heading mb-3">Knowledge Test</h2>
        <p className="text-white/45 font-light">Answer all {quizData.length} questions to unlock your adaptive notes.</p>
      </motion.div>

      {/* Progress bar */}
      <div className="progress-neon mb-8">
        <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
      </div>

      {/* Questions */}
      <div className="space-y-5 mb-8">
        {quizData.map((q, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-panel p-6"
            style={submitted ? {} : { borderColor: answers[i] ? 'rgba(123,97,255,0.3)' : 'rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-start gap-3 mb-5">
              <span className="flex-shrink-0 w-7 h-7 rounded-lg text-xs font-bold font-mono flex items-center justify-center"
                    style={{ background: 'rgba(123,97,255,0.15)', color: '#7B61FF', border: '1px solid rgba(123,97,255,0.3)' }}>
                {i + 1}
              </span>
              <h3 className="text-base font-medium text-white/90 leading-relaxed">{q.question}</h3>
            </div>

            <div className="space-y-2">
              {q.options.map((opt, j) => {
                const isSelected  = answers[i] === opt;
                const isCorrect   = q.answer === opt;
                const isWrong     = submitted && isSelected && !isCorrect;
                const isRight     = submitted && isCorrect;

                let style = {};
                let icon  = null;
                if (submitted) {
                  if (isRight)  { style = { border: '1px solid rgba(16,185,129,0.6)', background: 'rgba(16,185,129,0.12)', color: '#10b981' }; icon = <CheckCircle size={16} />; }
                  else if (isWrong) { style = { border: '1px solid rgba(239,68,68,0.5)', background: 'rgba(239,68,68,0.1)', color: '#ef4444' }; icon = <XCircle size={16} />; }
                  else          { style = { border: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.02)', color: 'rgba(255,255,255,0.35)' }; }
                } else {
                  if (isSelected) { style = { border: '1px solid rgba(123,97,255,0.6)', background: 'rgba(123,97,255,0.15)', color: 'white', boxShadow: '0 0 15px rgba(123,97,255,0.2)' }; }
                  else            { style = { border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.75)' }; }
                }

                return (
                  <button
                    key={j}
                    onClick={() => handleSelect(i, opt)}
                    disabled={submitted}
                    className="w-full text-left p-4 rounded-xl transition-all duration-200 flex items-center justify-between font-medium text-sm"
                    style={style}
                  >
                    <span>{opt}</span>
                    {icon && <span className="flex-shrink-0">{icon}</span>}
                  </button>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Submit or loading */}
      <AnimatePresence>
        {!submitted ? (
          <motion.button
            key="submit"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            onClick={handleSubmit}
            className="btn-primary w-full py-4 text-base font-bold tracking-wide flex items-center justify-center gap-2"
          >
            <Send size={18} />
            Submit Answers ({answeredCount}/{quizData.length})
          </motion.button>
        ) : (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="glass-neon p-6 text-center"
          >
            <Loader2 size={28} className="animate-spin mx-auto mb-3" style={{ color: '#00E5FF' }} />
            <p className="font-display font-bold text-lg gradient-heading">Generating Adaptive Notes…</p>
            <p className="text-white/35 text-sm mt-1 font-light">Personalizing content for your level</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
