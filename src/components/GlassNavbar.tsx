"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function GlassNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();

    if (isOpen) {
      // Close the menu first
      setIsOpen(false);
      // Wait for the exit animation to complete (300ms) before scrolling
      // to ensure the browser doesn't interrupt the smooth scroll.
      setTimeout(() => {
        scrollToSection(targetId);
      }, 320);
    } else {
      scrollToSection(targetId);
    }
  };

  const scrollToSection = (targetId: string) => {
    const elem = document.getElementById(targetId);
    if (elem) {
      // Calculate top position manually to account for the fixed header
      const topOffset = elem.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: topOffset, behavior: "smooth" });
    } else if (targetId === "hero") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 glass border-b border-white/5 shadow-2xl shadow-black/20 transition-all duration-300">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        <a href="#" onClick={(e) => handleScroll(e, "hero")} className="font-bold text-2xl tracking-tighter text-foreground hover:text-accent-gold transition-colors duration-300 z-50">
          Portfolio<span className="text-accent-gold">.</span>
        </a>

        {/* Desktop Links */}
        <nav className="hidden sm:flex items-center gap-8 text-sm font-medium text-text-muted z-50">
          <a href="#about" onClick={(e) => handleScroll(e, "about")} className="hover:text-foreground transition-colors duration-300">About</a>
          <a href="#skills" onClick={(e) => handleScroll(e, "skills")} className="hover:text-foreground transition-colors duration-300">Skills</a>
          <a href="#projects" onClick={(e) => handleScroll(e, "projects")} className="hover:text-foreground transition-colors duration-300">Projects</a>
          <a href="#contact" onClick={(e) => handleScroll(e, "contact")} className="hover:text-foreground transition-colors duration-300">Contact</a>
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="sm:hidden text-foreground p-2 -mr-2 focus:outline-none hover:text-accent-gold transition-colors duration-300 relative z-50 flex flex-col justify-center gap-[6px]"
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          <span className={`w-6 h-[2px] bg-current rounded-full transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-[8px]' : ''}`} />
          <span className={`w-6 h-[2px] bg-current rounded-full transition-all duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`} />
          <span className={`w-6 h-[2px] bg-current rounded-full transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-[8px]' : ''}`} />
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute top-full left-0 w-full glass border-b border-white/10 shadow-2xl overflow-hidden sm:hidden"
          >
            <nav className="flex flex-col items-center gap-6 py-8 text-lg font-medium">
              <a href="#about" onClick={(e) => handleScroll(e, "about")} className="text-text-muted hover:text-accent-gold transition-colors duration-300">About</a>
              <a href="#skills" onClick={(e) => handleScroll(e, "skills")} className="text-text-muted hover:text-accent-gold transition-colors duration-300">Skills</a>
              <a href="#projects" onClick={(e) => handleScroll(e, "projects")} className="text-text-muted hover:text-accent-gold transition-colors duration-300">Projects</a>
              <a href="#contact" onClick={(e) => handleScroll(e, "contact")} className="text-text-muted hover:text-accent-gold transition-colors duration-300">Contact</a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
