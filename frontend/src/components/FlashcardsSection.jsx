import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, Check, X, BrainCircuit, ChevronRight } from 'lucide-react';

export default function FlashcardsSection({ flashcards = [], onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [deck, setDeck] = useState(flashcards);
  
  if (!deck || deck.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white/5 rounded-2xl border border-white/10">
        <BrainCircuit size={48} className="text-neon mb-4 opacity-50" />
        <p className="text-white/50 text-sm">No flashcards available.</p>
      </div>
    );
  }

  const currentCard = deck[currentIndex];

  const handleNext = (difficulty) => {
    setFlipped(false);
    
    // Spaced repetition logic: if hard, add to the end of the deck
    if (difficulty === 'hard') {
      const cardToRepeat = { ...currentCard, difficulty: 'hard' };
      setDeck(prev => [...prev, cardToRepeat]);
    }
    
    if (currentIndex + 1 >= deck.length) {
      if (onComplete) onComplete();
    } else {
      setCurrentIndex(i => i + 1);
    }
  };

  return (
    <div className="w-full flex flex-col items-center max-w-lg mx-auto py-8">
      {/* Deck Header */}
      <div className="flex justify-between w-full mb-6 px-4 text-xs font-mono tracking-tighter">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-neon animate-pulse" />
          <span className="text-neon/80">ACTIVE MODULE</span>
        </div>
        <span className="text-white/40">CARD {currentIndex + 1} / {deck.length}</span>
      </div>

      <div className="relative w-full aspect-[4/3] perspective-1000">
        <AnimatePresence mode='wait'>
          {/* Back Card 2 (Deepest) */}
          {currentIndex + 2 < deck.length && (
            <div className="absolute inset-0 stack-card-2 glass-panel pointer-events-none" />
          )}

          {/* Back Card 1 (Directly behind) */}
          {currentIndex + 1 < deck.length && (
            <motion.div 
              key={`back-${currentIndex + 1}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.6, scale: 0.95, z: -30, y: -10 }}
              className="absolute inset-0 glass-panel pointer-events-none border-white/5"
            />
          )}

          {/* Main Active Card */}
          <motion.div
            key={currentIndex}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(e, { offset, velocity }) => {
              if (offset.x > 100) handleNext('easy');
              else if (offset.x < -100) handleNext('hard');
            }}
            initial={{ x: 300, opacity: 0, rotate: 10 }}
            animate={{ x: 0, opacity: 1, rotate: 0 }}
            exit={{ 
              x: flipped ? 0 : -300, 
              opacity: 0, 
              scale: 0.8,
              transition: { duration: 0.2 }
            }}
            className="w-full h-full preserve-3d relative cursor-grab active:cursor-grabbing"
            onClick={() => setFlipped(!flipped)}
          >
            <motion.div
              className="w-full h-full preserve-3d relative shadow-2xl"
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
            >
              {/* FRONT */}
              <div className="absolute w-full h-full backface-hidden glass-neon flex flex-col items-center justify-center p-10 text-center bg-white/[0.03]">
                <div className="absolute top-4 left-4 flex gap-1">
                   {[1,2,3].map(i => <div key={i} className="w-1 h-3 bg-neon/20 rounded-full" />)}
                </div>
                <h3 className="text-3xl font-display font-black text-white mb-4 leading-tight">
                  {currentCard.front}
                </h3>
                <div className="flex items-center gap-2 text-[10px] font-mono text-neon/40 absolute bottom-8 uppercase tracking-[0.2em]">
                  <span>Tap to reveal</span>
                  <ChevronRight size={12} />
                </div>
              </div>

              {/* BACK */}
              <div 
                className="absolute w-full h-full backface-hidden glass-glow flex flex-col items-center justify-center p-10 text-center bg-white/[0.03]"
                style={{ transform: 'rotateY(180deg)' }}
              >
                 <div className="absolute top-4 right-4 text-[10px] font-mono text-purple-400/50">
                   ENCRYPTED DATA
                 </div>
                <p className="text-xl text-white/90 leading-relaxed font-medium">
                  {currentCard.back}
                </p>
                <div className="mt-8 flex gap-2">
                   <div className="w-12 h-1 bg-purple-500/30 rounded-full" />
                   <div className="w-4 h-1 bg-neon/30 rounded-full" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Manual Controls for Accessibility */}
      <div className="flex gap-4 mt-12 w-full max-w-sm px-4">
        <button 
          onClick={() => handleNext('hard')}
          className="flex-1 flex flex-col items-center gap-1 group"
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center border border-red-500/30 bg-red-500/5 text-red-500 group-hover:bg-red-500/20 group-hover:scale-110 transition-all">
            <X size={20} />
          </div>
          <span className="text-[10px] font-bold text-white/30 group-hover:text-red-400">HARD</span>
        </button>

        <button 
          onClick={() => setFlipped(!flipped)}
          className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all"
        >
          <RefreshCcw size={18} className={flipped ? 'rotate-180 transition-transform' : ''} />
        </button>

        <button 
          onClick={() => handleNext('easy')}
          className="flex-1 flex flex-col items-center gap-1 group"
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center border border-neon/30 bg-neon/5 text-neon group-hover:bg-neon/20 group-hover:scale-110 transition-all">
            <Check size={20} />
          </div>
          <span className="text-[10px] font-bold text-white/30 group-hover:text-neon">EASY</span>
        </button>
      </div>
      
      <p className="mt-8 text-[10px] font-mono text-white/20 uppercase tracking-widest hidden sm:block">
        Swipe left for Hard • Swipe right for Easy
      </p>
    </div>
  );
}
