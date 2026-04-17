import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, Download } from 'lucide-react';

/**
 * VideoPlayer — futuristic AI video player component.
 * Displays the generated lecture video with custom cyber-styled controls.
 */
export default function VideoPlayer({ videoUrl, level }) {
  const videoRef  = useRef(null);
  const [playing,  setPlaying]  = useState(false);
  const [muted,    setMuted]    = useState(false);
  const [progress, setProgress] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const API_BASE = 'http://localhost:8000';
  const src = videoUrl.startsWith('http') ? videoUrl : `${API_BASE}${videoUrl}`;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) { videoRef.current.pause(); setPlaying(false); }
    else         { videoRef.current.play();  setPlaying(true);  }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const pct = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(isNaN(pct) ? 0 : pct);
  };

  const handleSeek = (e) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pct * videoRef.current.duration;
  };

  const handleEnded = () => setPlaying(false);

  const toggleFullscreen = () => {
    const el = videoRef.current;
    if (!el) return;
    if (!document.fullscreenElement) { el.requestFullscreen(); setFullscreen(true); }
    else { document.exitFullscreen(); setFullscreen(false); }
  };

  const levelColors = {
    'Slow Learner':    { text: '#ff6b6b', bg: 'rgba(255,107,107,0.1)',  border: 'rgba(255,107,107,0.3)' },
    'Average Student': { text: '#ffd93d', bg: 'rgba(255,217,61,0.1)',   border: 'rgba(255,217,61,0.3)' },
    'Topper':          { text: '#00E5FF', bg: 'rgba(0,229,255,0.1)',    border: 'rgba(0,229,255,0.3)' },
  };
  const lc = levelColors[level] || levelColors['Topper'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-neon animate-neon-pulse" />
          <h3 className="font-display font-bold text-lg text-white">AI Video Lecture</h3>
        </div>
        <div
          className="text-xs font-bold px-3 py-1 rounded-full"
          style={{ color: lc.text, background: lc.bg, border: `1px solid ${lc.border}` }}
        >
          {level}
        </div>
      </div>

      {/* Player container */}
      <div className="video-container group">
        <video
          ref={videoRef}
          src={src}
          className="w-full rounded-2xl block bg-black"
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onClick={togglePlay}
          style={{ maxHeight: '450px', objectFit: 'contain' }}
        />

        {/* Overlay controls (appear on hover) */}
        <div className="absolute inset-0 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl bg-gradient-to-t from-black/80 via-transparent to-transparent">

          {/* Progress bar */}
          <div
            className="mx-4 mb-3 h-1.5 bg-white/20 rounded-full cursor-pointer relative"
            onClick={handleSeek}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #7B61FF, #00E5FF)',
                boxShadow: '0 0 8px rgba(0,229,255,0.6)',
              }}
            />
            {/* Thumb dot */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-neon shadow-neon transition-all"
              style={{ left: `calc(${progress}% - 6px)`, boxShadow: '0 0 8px rgba(0,229,255,0.8)' }}
            />
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between px-4 pb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                style={{ background: 'rgba(0,229,255,0.2)', border: '1px solid rgba(0,229,255,0.4)' }}
              >
                {playing
                  ? <Pause  size={18} className="text-neon" />
                  : <Play   size={18} className="text-neon ml-0.5" />
                }
              </button>
              <button onClick={toggleMute} className="text-white/60 hover:text-white transition-colors">
                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={src}
                download
                className="text-white/60 hover:text-neon transition-colors"
                title="Download video"
              >
                <Download size={18} />
              </a>
              <button
                onClick={toggleFullscreen}
                className="text-white/60 hover:text-white transition-colors"
              >
                {fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Big play button when paused */}
        {!playing && (
          <div
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            onClick={togglePlay}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center transition-transform hover:scale-110"
              style={{
                background: 'rgba(0,229,255,0.15)',
                border: '2px solid rgba(0,229,255,0.5)',
                boxShadow: '0 0 30px rgba(0,229,255,0.3)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Play size={32} className="text-neon ml-1" />
            </div>
          </div>
        )}

        {/* Scan line decoration */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-neon to-transparent opacity-60" />
      </div>

      {/* Info footer */}
      <div className="mt-4 flex items-center justify-between text-xs text-white/30">
        <span>Generated by EDITH AI • Personalized for your level</span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />
          AI Generated
        </span>
      </div>
    </motion.div>
  );
}
