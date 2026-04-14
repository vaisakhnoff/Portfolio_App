"use client";

import { useRef, useEffect, useState } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SceneCanvas from "@/components/three/SceneCanvas";
import { scrollStore } from "@/lib/scrollStore";
import MagneticButton from "@/components/MagneticButton";

gsap.registerPlugin(ScrollTrigger);

/* ── Entrance animation variants (fire on mount, not scroll) ───────── */

const textContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.3,
    },
  },
};

const textItemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 20 },
  },
};

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

/* ═══════════════════════════════════════════════════════════════════════════
 * Hero Section — layered structure
 *
 * Layer 0: Background gold radial glow (atmospheric)
 * Layer 1: 3D Canvas (torus + particles + glass panels)
 * Layer 2: Cinematic darken overlay (fades in at scroll end)
 * Layer 3: Foreground text + CTAs (fades out on scroll start)
 *
 * The section is pinned by GSAP for 600vh. Scroll progress drives
 * both the 3D camera journey and the DOM layer animations.
 * ═══════════════════════════════════════════════════════════════════════ */

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const bgGlowRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const [titleIndex, setTitleIndex] = useState(0);
  const TITLES = ["MERN Stack Developer", "Web Developer"];

  useEffect(() => {
    const interval = setInterval(() => {
      setTitleIndex((prev) => (prev + 1) % TITLES.length);
    }, 3200); // 2s hold + 0.6s enter + 0.6s exit

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollStore.progress = 0;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=600%",
          scrub: 1.5,
          pin: true,
          anticipatePin: 1,
        },
      });

      // ① Drive 3D camera progress
      tl.to(scrollStore, {
        progress: 1,
        ease: "none",
        duration: 1,
      }, 0);

      // ② Fade out hero text (first ~12% of scroll)
      tl.to(contentRef.current, {
        opacity: 0,
        y: -60,
        scale: 0.92,
        duration: 0.12,
        ease: "power2.in",
      }, 0.02);

      // ③ Fade out background glow
      tl.to(bgGlowRef.current, {
        opacity: 0,
        duration: 0.10,
      }, 0.03);

      // ④ Cinematic ending — darken scene
      tl.to(overlayRef.current, {
        opacity: 1,
        ease: "power2.inOut",
        duration: 0.20,
      }, 0.80);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const titleChars = "Vaisakh N".split("");

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative h-screen w-full overflow-hidden"
    >
      {/* ── Layer 0: Atmospheric gold glow ─────────────────────────── */}
      <div
        ref={bgGlowRef}
        className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center"
      >
        <div className="w-[80vw] h-[80vw] sm:w-[40vw] sm:h-[40vw] bg-[radial-gradient(ellipse_at_center,var(--accent-gold)_0%,transparent_60%)] blur-[100px] opacity-10 -translate-y-[10%] rounded-full" />
      </div>

      {/* ── Layer 1: 3D Scene ─────────────────────────────────────── */}
      <div className="absolute inset-0 z-[1]">
        <SceneCanvas />
      </div>

      {/* ── Layer 2: Cinematic darken overlay ─────────────────────── */}
      <div
        ref={overlayRef}
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{ opacity: 0, backgroundColor: "var(--background)" }}
      />

      {/* ── Layer 3: Foreground content ───────────────────────────── */}
      <div
        ref={contentRef}
        className="absolute inset-0 z-[3] flex items-center justify-center pointer-events-none"
      >
        <div className="text-center max-w-4xl px-6 space-y-6 sm:space-y-8 pointer-events-auto">
          <motion.h1
            variants={textContainerVariants}
            initial="hidden"
            animate="show"
            className="text-hero drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]"
          >
            <div className="block mb-2">
              {titleChars.map((char, index) => (
                <motion.span
                  key={index}
                  variants={textItemVariants}
                  className="inline-block"
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </div>
          </motion.h1>

          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            animate="show"
            className="block text-3xl sm:text-4xl md:text-5xl font-bold text-white selection:bg-accent-gold/20 leading-tight h-[1.5em] relative w-full mt-4"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={titleIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="absolute inset-0 flex items-start justify-center"
              >
                {TITLES[titleIndex]}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <motion.p
            variants={fadeUpVariants}
            initial="hidden"
            animate="show"
            className="text-body max-w-xl mx-auto text-sm sm:text-base drop-shadow-[0_0_20px_rgba(0,0,0,0.6)]"
          >
            Building responsive, performant, and user-friendly web applications
            with a strong focus on clean development and practical problem-solving.
          </motion.p>

          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            animate="show"
            className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
          >
            <MagneticButton
              href="#projects"
              className="bg-foreground text-background px-8 py-3 rounded-md font-medium hover:bg-accent-gold hover:text-background transition-colors duration-300 text-sm sm:text-base"
            >
              View Projects
            </MagneticButton>
            <MagneticButton
              href="#contact"
              className="px-8 py-3 rounded-md font-medium text-text-muted hover:text-foreground transition-colors duration-300 text-sm sm:text-base"
            >
              Contact Me
            </MagneticButton>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
