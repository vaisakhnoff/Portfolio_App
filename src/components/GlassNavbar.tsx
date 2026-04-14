import React from "react";

export default function GlassNavbar() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 glass border-b border-white/5 shadow-2xl shadow-black/20 transition-all duration-300">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        <a href="#" className="font-bold text-2xl tracking-tighter text-foreground hover:text-accent-gold transition-colors duration-300">
          Portfolio<span className="text-accent-gold">.</span>
        </a>

        {/* Desktop Links */}
        <nav className="hidden sm:flex items-center gap-8 text-sm font-medium text-text-muted">
          <a href="#about" className="hover:text-foreground transition-colors duration-300">About</a>
          <a href="#projects" className="hover:text-foreground transition-colors duration-300">Projects</a>
          <a href="#contact" className="hover:text-foreground transition-colors duration-300">Contact</a>
        </nav>

        {/* Mobile menu button */}
        <button
          className="sm:hidden text-foreground p-2 -mr-2 focus:outline-none hover:text-accent-gold transition-colors duration-300"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
}
