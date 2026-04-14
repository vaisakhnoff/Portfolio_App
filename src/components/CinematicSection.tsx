"use client";

import { ReactNode } from "react";
import { motion, Variants } from "framer-motion";

/**
 * CinematicSection wrapper enforces a 100vh layout for its children
 * and applies a smooth entrance/exit fade based on scroll position.
 * This ensures no overlapping and a "one scene at a time" buttery feel.
 */
export default function CinematicSection({ children, id }: { children: ReactNode, id?: string }) {
  // Use a premium ease matching GSAP's power2.out, properly types for stability
  const transition = { duration: 0.9, ease: [0.25, 0.8, 0.25, 1] as const };

  // Entrance variants: fade in, slide up carefully smoothly
  const variants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition },
    // On exit, fade out and slide up exactly to -30
    exit: { opacity: 0, y: -30, transition }
  };

  return (
    <div id={id} data-snap="true" className="relative min-h-screen flex items-center justify-center w-full">
      <motion.div
        variants={variants}
        initial="hidden"
        whileInView="visible"
        exit="exit"
        // Ensure section is firmly in view before animating to prevent overlapped triggers
        viewport={{ amount: 0.35, once: false }}
        className="w-full max-w-7xl px-4 sm:px-6 py-12 sm:py-14 flex flex-col items-center justify-center"
      >
        {children}
      </motion.div>
    </div>
  );
}
