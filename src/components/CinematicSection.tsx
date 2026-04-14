"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

/**
 * CinematicSection wrapper enforces a 100vh layout for its children
 * and applies a smooth entrance/exit fade based on scroll position.
 * This ensures no overlapping and a "one scene at a time" buttery feel.
 */
export default function CinematicSection({ children, id }: { children: ReactNode, id?: string }) {
  // Use a premium ease matching GSAP's power2.out
  const transition = { duration: 1.0, ease: [0.25, 1, 0.5, 1] };

  // Entrance variants: fade in, slide up
  const variants = {
    hidden: { opacity: 0, y: 50, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition },
    // On exit, fade out and slide up further
    exit: { opacity: 0, y: -50, scale: 0.98, transition }
  };

  return (
    <div id={id} className="relative min-h-screen flex items-center justify-center w-full">
      <motion.div
        variants={variants}
        initial="hidden"
        whileInView="visible"
        exit="exit"
        // Ensure section is 40% in view before animating to prevent overlapped triggers
        viewport={{ amount: 0.4, once: false }}
        className="w-full max-w-7xl px-4 sm:px-6 py-12 sm:py-14 flex flex-col items-center justify-center"
      >
        {children}
      </motion.div>
    </div>
  );
}
