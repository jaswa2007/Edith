import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import NeuralBackground from './NeuralBackground';

export default function Signup() {
  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [password,setPassword]= useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const { signup } = useAuth();
  const navigate   = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
         style={{ background: '#0A0A0A' }}>

      <div className="absolute inset-0">
        <NeuralBackground opacity={0.45} nodeCount={50} />
      </div>

      {/* Glow blobs */}
      <div className="absolute top-1/3 -right-40 w-96 h-96 rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(123,97,255,0.12) 0%, transparent 70%)' }} />
      <div className="absolute bottom-1/3 -left-40 w-96 h-96 rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.08) 0%, transparent 70%)' }} />

      {/* Scan line */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: ['0vh', '100vh'] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear', delay: 1 }}
          className="absolute left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(123,97,255,0.4), transparent)' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-neon p-8 rounded-3xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5 text-4xl"
                 style={{
                   background: 'rgba(123,97,255,0.08)',
                   border: '1px solid rgba(123,97,255,0.3)',
                   boxShadow: '0 0 30px rgba(123,97,255,0.15)',
                   filter: 'drop-shadow(0 0 8px rgba(123,97,255,0.4))',
                 }}>
              🧙‍♂️
            </div>
            <h2 className="text-3xl font-display font-black"
                style={{ background: 'linear-gradient(135deg, #fff 0%, #7B61FF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Join EDITH
            </h2>
            <p className="text-white/35 text-sm mt-2 font-light">Start your AI-powered learning journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { label: 'Full Name',      type: 'text',     val: name,     set: setName,     ph: 'John Doe',           id: 'signup-name' },
              { label: 'Email Address',  type: 'email',    val: email,    set: setEmail,    ph: 'name@example.com',   id: 'signup-email' },
            ].map(f => (
              <div key={f.id} className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">{f.label}</label>
                <input
                  id={f.id} type={f.type} required
                  className="input-glass w-full py-3.5 px-4 text-sm"
                  placeholder={f.ph} value={f.val} onChange={e => f.set(e.target.value)}
                />
              </div>
            ))}

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Password</label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPwd ? 'text' : 'password'} required
                  className="input-glass w-full py-3.5 px-4 pr-12 text-sm"
                  placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <span>⚠️</span> {error}
              </motion.div>
            )}

            <button id="signup-submit" type="submit" disabled={loading}
              className="btn-primary w-full py-3.5 text-sm font-bold tracking-wide flex items-center justify-center gap-2 disabled:opacity-50 mt-2">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating Account…</>
              ) : (
                <><UserPlus size={16} />Create Account</>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5" /></div>
            <div className="relative flex justify-center"><span className="bg-card px-4 text-xs text-white/20 font-mono">OR</span></div>
          </div>

          <p className="text-center text-sm text-white/35">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold transition-colors" style={{ color: '#7B61FF' }}>Sign In</Link>
          </p>
        </div>
        <p className="text-center text-xs text-white/15 mt-6 font-mono">EDITH • Adaptive AI Learning System</p>
      </motion.div>
    </div>
  );
}
