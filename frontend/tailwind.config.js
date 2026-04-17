/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary:   "#8b5cf6",   // Vibrant purple
        secondary: "#3b82f6",   // Vibrant blue
        neon:      "#00E5FF",   // Neon cyan
        glow:      "#7B61FF",   // Purple glow
        dark:      "#0A0A0A",   // Deep black
        darkbg:    "#0a0a0f",
        card:      "#13131f",
        glass:     "rgba(255, 255, 255, 0.05)",
        glassborder:"rgba(255, 255, 255, 0.10)",
      },
      fontFamily: {
        sans:    ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'blob':         'blob 7s infinite',
        'fade-in':      'fadeIn 0.5s ease-out',
        'pulse-slow':   'pulse 3s infinite',
        'float':        'float 6s ease-in-out infinite',
        'scan':         'scan 3s linear infinite',
        'neon-pulse':   'neonPulse 2s ease-in-out infinite',
        'spin-slow':    'spin 8s linear infinite',
        'data-flow':    'dataFlow 4s linear infinite',
        'shimmer':      'shimmer 2s linear infinite',
      },
      keyframes: {
        blob: {
          '0%':   { transform: 'translate(0px, 0px) scale(1)' },
          '33%':  { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%':  { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        scan: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        neonPulse: {
          '0%, 100%': { boxShadow: '0 0 5px #00E5FF, 0 0 10px #00E5FF, 0 0 20px #00E5FF' },
          '50%':      { boxShadow: '0 0 10px #00E5FF, 0 0 25px #00E5FF, 0 0 50px #00E5FF' },
        },
        dataFlow: {
          '0%':   { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'neon':        '0 0 10px rgba(0, 229, 255, 0.5), 0 0 30px rgba(0, 229, 255, 0.2)',
        'neon-strong': '0 0 20px rgba(0, 229, 255, 0.8), 0 0 60px rgba(0, 229, 255, 0.4)',
        'glow':        '0 0 15px rgba(123, 97, 255, 0.5), 0 0 40px rgba(123, 97, 255, 0.2)',
        'glow-strong': '0 0 30px rgba(123, 97, 255, 0.8)',
        'card':        '0 8px 32px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
}
