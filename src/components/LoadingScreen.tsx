"use client";

import { motion } from "framer-motion";

export default function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0a0a0a]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_0%,rgba(10,10,10,0)_34%,rgba(0,0,0,0.82)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,rgba(212,175,55,0.08)_0%,rgba(10,10,10,0)_36%)]" />

      <div className="relative z-10 flex flex-col items-center gap-5 px-6 text-center">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2.8, ease: "linear", repeat: Infinity }}
            className="absolute h-20 w-20 rounded-full border border-white/8 border-t-accent-gold/70"
          />
          <motion.div
            animate={{ scale: [0.92, 1.08, 0.92], opacity: [0.35, 0.8, 0.35] }}
            transition={{ duration: 2.2, ease: "easeInOut", repeat: Infinity }}
            className="h-2.5 w-2.5 rounded-full bg-accent-gold shadow-[0_0_24px_rgba(212,175,55,0.45)]"
          />
        </div>

        <div className="space-y-2">
          <p className="text-[0.68rem] uppercase tracking-[0.42em] text-accent-gold/70">
            Initializing Experience
          </p>
          <p className="text-sm text-white/48 sm:text-base">
            Preparing scenes, motion, and interface layers.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
