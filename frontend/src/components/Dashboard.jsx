import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FileText, Video, Upload, Edit3, History, LogOut, Cpu, Zap, Activity } from 'lucide-react';
import NeuralBackground from './NeuralBackground';

const ACTIONS = [
  {
    title: 'Upload PDF',
    icon: FileText,
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.25)',
    glow: 'rgba(59,130,246,0.3)',
    path: '/upload/pdf',
    desc: 'Extract knowledge from PDF documents.',
    badge: 'PDF',
  },
  {
    title: 'YouTube Video',
    icon: Video,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.25)',
    glow: 'rgba(239,68,68,0.3)',
    path: '/upload/video',
    desc: 'Transform video lectures into study notes.',
    badge: 'VIDEO',
  },
  {
    title: 'Handwritten Notes',
    icon: Upload,
    color: '#10b981',
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.25)',
    glow: 'rgba(16,185,129,0.3)',
    path: '/upload/image',
    desc: 'OCR scan handwritten notes intelligently.',
    badge: 'OCR',
  },
  {
    title: 'Type Notes',
    icon: Edit3,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.25)',
    glow: 'rgba(245,158,11,0.3)',
    path: '/upload/text',
    desc: 'Generate AI study material from typed text.',
    badge: 'TEXT',
  },
  {
    title: 'View History',
    icon: History,
    color: '#7B61FF',
    bg: 'rgba(123,97,255,0.08)',
    border: 'rgba(123,97,255,0.25)',
    glow: 'rgba(123,97,255,0.3)',
    path: '/history',
    desc: 'Review your previous study sessions.',
    badge: 'HISTORY',
  },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#0A0A0A' }}>

      {/* Neural network background */}
      <div className="absolute inset-0">
        <NeuralBackground opacity={0.4} nodeCount={50} />
      </div>

      {/* Gradient blobs */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(123,97,255,0.08) 0%, transparent 70%)' }} />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.07) 0%, transparent 70%)' }} />

      <div className="relative z-10 p-6 lg:p-12 min-h-screen">

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-14"
        >
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                   style={{
                     background: 'rgba(0,229,255,0.08)',
                     border: '1px solid rgba(0,229,255,0.3)',
                     boxShadow: '0 0 20px rgba(0,229,255,0.12)',
                   }}>
                🧙‍♂️
              </div>
              <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-neon"
                    style={{ boxShadow: '0 0 6px rgba(0,229,255,0.8)' }} />
            </div>
            <div>
              <h1 className="text-2xl font-display font-black"
                  style={{
                    background: 'linear-gradient(135deg, #fff 0%, #00E5FF 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>
                EDITH Dashboard
              </h1>
              <p className="text-white/35 text-sm font-light mt-0.5">
                Welcome back,{' '}
                <span style={{ color: '#00E5FF' }}>{user?.email?.split('@')[0] || 'Scholar'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
                 style={{ background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', color: '#00E5FF' }}>
              <Cpu size={12} />
              <span className="font-mono">AI ACTIVE</span>
            </div>
            <button
              id="logout-btn"
              onClick={logout}
              className="flex items-center gap-2 text-white/35 hover:text-red-400 transition-colors text-sm font-medium"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </motion.header>

        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 flex items-center gap-3"
        >
          <Zap size={18} style={{ color: '#00E5FF' }} />
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/40">
            Learning Modules
          </h2>
          <div className="flex-1 h-px" style={{ background: 'rgba(0,229,255,0.1)' }} />
        </motion.div>

        {/* Action cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {ACTIONS.map((action, i) => (
            <motion.button
              key={action.title}
              id={`dashboard-card-${action.badge.toLowerCase()}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(action.path)}
              className="glass-panel text-left p-7 flex flex-col group relative overflow-hidden tilt-card"
              style={{
                borderColor: action.border,
                transition: 'border-color 0.3s, box-shadow 0.3s, transform 0.3s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = `0 0 30px ${action.glow}, 0 20px 60px rgba(0,0,0,0.5)`;
                e.currentTarget.style.borderColor = action.color.replace(')', ', 0.5)').replace('rgb', 'rgba');
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = '';
                e.currentTarget.style.borderColor = action.border;
              }}
            >
              {/* Background fill glow on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl"
                   style={{ background: `radial-gradient(circle at 30% 30%, ${action.bg} 0%, transparent 70%)` }} />

              {/* Badge */}
              <div className="flex items-center justify-between mb-5 relative z-10">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                     style={{ background: action.bg, border: `1px solid ${action.border}` }}>
                  <action.icon size={22} style={{ color: action.color }} />
                </div>
                <span className="text-[10px] font-bold font-mono px-2.5 py-1 rounded-full"
                      style={{ color: action.color, background: `${action.color}15`, border: `1px solid ${action.border}` }}>
                  {action.badge}
                </span>
              </div>

              <h3 className="text-lg font-display font-bold mb-2 relative z-10 group-hover:text-white transition-colors">
                {action.title}
              </h3>
              <p className="text-white/35 text-sm font-light relative z-10 leading-relaxed">
                {action.desc}
              </p>

              {/* Arrow indicator */}
              <div className="mt-5 flex items-center gap-1 text-xs font-semibold relative z-10 opacity-0 group-hover:opacity-100 transition-all duration-300"
                   style={{ color: action.color }}>
                <span>Open Module</span>
                <span className="text-base">→</span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Bottom system status bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-14 flex items-center justify-center gap-6 text-xs font-mono text-white/20"
        >
          <div className="flex items-center gap-2">
            <Activity size={12} style={{ color: '#00E5FF' }} />
            <span>EDITH AI Online</span>
          </div>
          <span>•</span>
          <span>Powered by Gemini</span>
          <span>•</span>
          <span>Adaptive Learning Active</span>
        </motion.div>
      </div>
    </div>
  );
}
