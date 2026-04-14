"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useVelocity, useSpring } from "framer-motion";

export default function SectionDivider({ label }: { label?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  // Measure both local progress (for fading) and global scroll (for velocity/parallax)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400
  });

  // Stretch elements slightly when scrolling fast
  const skewVelocity = useTransform(smoothVelocity, [-1000, 1000], [2, -2]);
  
  // Center structural animations
  const lineWidth = useTransform(scrollYProgress, [0.2, 0.5, 0.8], ["0%", "100%", "0%"]);
  const lineOpacity = useTransform(scrollYProgress, [0.1, 0.4, 0.6, 0.9], [0, 1, 1, 0]);

  // Generate particle depths (parallax layers)
  const layers = [
    useTransform(scrollYProgress, [0, 1], ["60px", "-60px"]),   // Foreground (Fast)
    useTransform(scrollYProgress, [0, 1], ["30px", "-30px"]),   // Midground (Normal)
    useTransform(scrollYProgress, [0, 1], ["10px", "-10px"]),   // Background (Slow)
    useTransform(scrollYProgress, [0, 1], ["-20px", "40px"]),   // Reverse motion
  ];

  // Abstract light streak that sweeps past
  const streakY = useTransform(scrollYProgress, [0, 1], ["-100%", "150%"]);
  const streakOpacity = useTransform(scrollYProgress, [0.2, 0.5, 0.8], [0, 0.4, 0]);

  return (
    <div
      ref={ref}
      className="relative h-[24vh] sm:h-[30vh] flex items-center justify-center overflow-hidden w-full"
      aria-hidden="true"
    >
      {/* ── 1. Cosmic Ambient Core (No blur overlay) ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[400px] h-[400px] bg-[radial-gradient(ellipse_at_center,var(--accent-gold)_0%,transparent_60%)] opacity-[0.03] rounded-full" />
      </div>

      {/* ── 2. The Light Streak (Space-travel feel) ── */}
      <motion.div
        style={{ y: streakY, opacity: streakOpacity, skewY: skewVelocity }}
        className="absolute left-1/2 -translate-x-1/2 w-[80vw] sm:w-[40vw] h-64 bg-gradient-to-b from-transparent via-accent-gold/5 to-transparent blur-xl pointer-events-none rounded-full transform -rotate-45"
      />

      {/* ── 3. Volumetric Floating Particles ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Layer 1 - Foreground Fast */}
        <motion.div style={{ y: layers[0], opacity: lineOpacity }} className="absolute inset-0">
          <div className="absolute top-[20%] left-[15%] w-1.5 h-1.5 rounded-full bg-accent-gold/40 shadow-[0_0_12px_rgba(212,175,55,0.6)]" />
          <div className="absolute top-[80%] left-[85%] w-2 h-2 rounded-full bg-foreground/20" />
        </motion.div>

        {/* Layer 2 - Midground */}
        <motion.div style={{ y: layers[1], opacity: lineOpacity }} className="absolute inset-0">
          <div className="absolute top-[40%] left-[80%] w-1 h-1 rounded-full bg-accent-gold/60 shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
          <div className="absolute top-[70%] left-[25%] w-1 h-1 rounded-full bg-accent-gold/30" />
        </motion.div>

        {/* Layer 3 - Background Slow */}
        <motion.div style={{ y: layers[2], opacity: lineOpacity }} className="absolute inset-0">
          <div className="absolute top-[60%] left-[10%] w-0.5 h-0.5 rounded-full bg-foreground/40" />
          <div className="absolute top-[30%] left-[90%] w-0.5 h-0.5 rounded-full bg-accent-gold/50" />
        </motion.div>

        {/* Layer 4 - Reverse Draft */}
        <motion.div style={{ y: layers[3], opacity: lineOpacity }} className="absolute inset-0">
          <div className="absolute top-[85%] left-[45%] w-1 h-1 rounded-full bg-accent-gold/20" />
          <div className="absolute top-[15%] left-[65%] w-1.5 h-1.5 rounded-full bg-foreground/10" />
        </motion.div>
      </div>

      {/* ── 4. Central Anchoring Architecture ── */}
      <div className="relative flex flex-col items-center gap-4 w-full px-6 z-10">
        <motion.div
          style={{ width: lineWidth, opacity: lineOpacity }}
          className="h-px bg-gradient-to-r from-transparent via-accent-gold/40 to-transparent w-full max-w-sm sm:max-w-md"
        />

        {label && (
          <motion.span
            style={{ opacity: lineOpacity }}
            className="text-[10px] sm:text-[11px] uppercase tracking-[0.5em] text-accent-gold/40 font-medium drop-shadow-[0_0_8px_rgba(212,175,55,0.3)]"
          >
            {label}
          </motion.span>
        )}

        <motion.div
          style={{ opacity: lineOpacity }}
          className="w-1.5 h-1.5 rotate-45 border border-accent-gold/20 bg-accent-gold/5"
        />
      </div>
    </div>
  );
}
