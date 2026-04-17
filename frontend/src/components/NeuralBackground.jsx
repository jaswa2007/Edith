import React, { useRef, useEffect } from 'react';

/**
 * NeuralBackground — animated canvas of neural network nodes and edges.
 * Fully transparent, sits behind other content as a fixed/absolute bg layer.
 */
export default function NeuralBackground({ opacity = 0.6, nodeCount = 60 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width  = canvas.width  = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;
    let animId;

    // Node setup
    const nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 1,
      pulse: Math.random() * Math.PI * 2,
    }));

    const MAX_DIST = 160;

    function draw() {
      ctx.clearRect(0, 0, width, height);

      // Update
      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += 0.02;
        if (n.x < 0 || n.x > width)  n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      });

      // Draw edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.35 * opacity;
            // Neon cyan edge
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(0, 229, 255, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach(n => {
        const glow = Math.sin(n.pulse) * 0.5 + 0.5; // 0..1
        const r = n.r + glow * 1.5;

        // Outer glow
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 4);
        grad.addColorStop(0, `rgba(0, 229, 255, ${0.4 * opacity})`);
        grad.addColorStop(1, 'rgba(0, 229, 255, 0)');
        ctx.beginPath();
        ctx.arc(n.x, n.y, r * 4, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Core dot (alternates neon/purple)
        const isGlow = Math.sin(n.pulse * 0.5) > 0;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = isGlow
          ? `rgba(0, 229, 255, ${opacity})`
          : `rgba(123, 97, 255, ${opacity * 0.8})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    }

    draw();

    const handleResize = () => {
      width  = canvas.width  = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [opacity, nodeCount]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
