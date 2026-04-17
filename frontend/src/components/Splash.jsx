import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Splash() {
  const navigate   = useNavigate();
  const canvasRef  = useRef(null);

  // Auto-navigate to login after 4.5 s
  useEffect(() => {
    const timer = setTimeout(() => navigate('/login'), 4500);
    return () => clearTimeout(timer);
  }, [navigate]);

  // Neural network canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const nodeCount = 80;
    const nodes = Array.from({ length: nodeCount }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r:  Math.random() * 2.5 + 1,
      pulse: Math.random() * Math.PI * 2,
    }));

    let animId;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Grid
      ctx.strokeStyle = 'rgba(0,229,255,0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 60) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 60) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy; n.pulse += 0.025;
        if (n.x < 0 || n.x > canvas.width)  n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });

      // Edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const d  = Math.hypot(dx, dy);
          if (d < 180) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(0,229,255,${(1 - d / 180) * 0.25})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      // Nodes
      nodes.forEach(n => {
        const g = Math.sin(n.pulse) * 0.5 + 0.5;
        const r = n.r + g * 1.5;
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 5);
        grad.addColorStop(0, 'rgba(0,229,255,0.5)');
        grad.addColorStop(1, 'rgba(0,229,255,0)');
        ctx.beginPath();
        ctx.arc(n.x, n.y, r * 5, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = g > 0.6 ? 'rgba(0,229,255,0.9)' : 'rgba(123,97,255,0.8)';
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    }
    draw();

    const onResize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', onResize); };
  }, []);

  // Floating particles
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x:  `${Math.random() * 100}%`,
    y:  `${Math.random() * 100}%`,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 3,
    duration: 3 + Math.random() * 4,
  }));

  return (
    <div className="fixed inset-0 overflow-hidden flex flex-col items-center justify-center z-50"
         style={{ background: '#0A0A0A' }}>

      {/* Neural canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Radial glow blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[700px] h-[700px] rounded-full opacity-20"
             style={{ background: 'radial-gradient(circle, rgba(123,97,255,0.4) 0%, transparent 70%)' }} />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-10"
             style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.5) 0%, transparent 70%)' }} />
      </div>

      {/* Floating star particles */}
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{ width: p.size, height: p.size, left: p.x, top: p.y,
                   background: Math.random() > 0.5 ? '#00E5FF' : '#7B61FF' }}
          animate={{ y: [0, -80, 0], opacity: [0, 0.7, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity }}
        />
      ))}

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">

        {/* Glowing logo ring */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'backOut' }}
          className="relative mb-10"
        >
          {/* Outer ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border border-dashed"
            style={{ borderColor: 'rgba(0,229,255,0.3)', width: 160, height: 160, margin: '-20px' }}
          />
          {/* Inner glow */}
          <div className="relative w-28 h-28 rounded-full flex items-center justify-center"
               style={{
                 background: 'radial-gradient(circle, rgba(123,97,255,0.3) 0%, rgba(0,229,255,0.1) 60%, transparent 100%)',
                 boxShadow: '0 0 40px rgba(0,229,255,0.4), 0 0 80px rgba(123,97,255,0.2)',
                 border: '2px solid rgba(0,229,255,0.4)',
               }}>
            <span className="text-5xl" style={{ filter: 'drop-shadow(0 0 12px rgba(0,229,255,0.8))' }}>
              🧙‍♂️
            </span>
          </div>
          {/* Corner data nodes */}
          {[0, 90, 180, 270].map(deg => (
            <motion.div
              key={deg}
              className="data-node absolute"
              style={{
                top:  '50%', left: '50%',
                transform: `rotate(${deg}deg) translateX(80px) rotate(-${deg}deg) translate(-50%,-50%)`,
              }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, delay: deg / 360 * 2, repeat: Infinity }}
            />
          ))}
        </motion.div>

        {/* EDITH title — typing reveal */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.4 }}
          className="overflow-hidden mb-3"
        >
          <motion.h1
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ delay: 1, duration: 0.6, ease: 'circOut' }}
            className="text-7xl md:text-8xl font-display font-black tracking-[0.25em]"
            style={{
              background: 'linear-gradient(135deg, #00E5FF 0%, #7B61FF 60%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 20px rgba(0,229,255,0.4))',
            }}
          >
            EDITH
          </motion.h1>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          className="text-white/60 text-base md:text-lg font-light tracking-widest uppercase mb-2"
        >
          Adaptive AI Learning System
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 0.8 }}
          className="font-display font-semibold tracking-wide text-lg md:text-xl mb-10"
          style={{ color: '#00E5FF', textShadow: '0 0 15px rgba(0,229,255,0.6)' }}
        >
          Learn Smarter with AI
        </motion.p>

        {/* Loading bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.8 }}
          className="w-64 h-0.5 bg-white/10 rounded-full overflow-hidden"
        >
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ delay: 2.8, duration: 1.6, ease: 'easeInOut' }}
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #7B61FF, #00E5FF)', boxShadow: '0 0 8px rgba(0,229,255,0.6)' }}
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.2 }}
          className="text-white/25 text-xs font-mono mt-4 tracking-widest"
        >
          INITIALIZING SYSTEM…
        </motion.p>
      </div>
    </div>
  );
}
