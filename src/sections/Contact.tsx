"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import ContactConstellationCanvas from "@/components/three/ContactConstellationCanvas";

const CONTACT_EMAIL = "vaisakhnofficial@gmail.com";
const CONTACT_PHONE = "7356213104";

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    const check = () => {
      const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      setInteractive(window.innerWidth >= 768 && canHover);
    };

    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end end"],
  });

  const revealProgress = useSpring(useTransform(scrollYProgress, [0, 0.22], [0.2, 1]), {
    stiffness: 90,
    damping: 24,
    mass: 0.9,
  });

  const exitProgress = useSpring(useTransform(scrollYProgress, [0.72, 1], [0, 1]), {
    stiffness: 80,
    damping: 22,
    mass: 0.95,
  });

  const contentOpacity = useSpring(
    useTransform(scrollYProgress, [0, 0.16, 0.84, 1], [0.68, 1, 1, 0.18]),
    { stiffness: 90, damping: 24, mass: 0.85 }
  );

  const contentY = useSpring(
    useTransform(scrollYProgress, [0, 0.18, 1], [16, 0, -16]),
    { stiffness: 100, damping: 24, mass: 0.85 }
  );

  const leadOpacity = useSpring(
    useTransform(scrollYProgress, [0, 0.14, 0.78, 1], [0.4, 1, 1, 0.18]),
    { stiffness: 95, damping: 24, mass: 0.8 }
  );

  const exitDarken = useSpring(
    useTransform(scrollYProgress, [0.76, 1], [0, 1]),
    { stiffness: 70, damping: 22, mass: 0.95 }
  );

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (!interactive || !sectionRef.current) return;

    const rect = sectionRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = -(((event.clientY - rect.top) / rect.height) - 0.5) * 2;
    pointerRef.current = { x, y };
  };

  const handlePointerLeave = () => {
    pointerRef.current = { x: 0, y: 0 };
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative h-[180vh] w-full bg-[#0a0a0a]"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="sticky top-0 isolate h-screen overflow-hidden bg-[#0a0a0a]">
        <div className="absolute inset-0 z-0 bg-[#0a0a0a]" />

        <div className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.012)_0%,rgba(10,10,10,0)_34%,rgba(10,10,10,0.78)_100%)]" />
        <div className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(circle_at_50%_46%,rgba(212,175,55,0.035)_0%,rgba(10,10,10,0)_38%)]" />

        <motion.div
          className="absolute inset-0 z-[2] pointer-events-none bg-[radial-gradient(circle_at_center,rgba(10,10,10,0)_30%,rgba(10,10,10,0.18)_62%,rgba(0,0,0,0.68)_100%)]"
          style={{ opacity: 0.72 }}
        />

        <motion.div
          className="absolute inset-0 z-[2] pointer-events-none bg-[radial-gradient(circle_at_center,rgba(10,10,10,0)_18%,rgba(0,0,0,0.24)_58%,rgba(0,0,0,0.92)_100%)]"
          style={{ opacity: exitDarken }}
        />

        <div className="absolute inset-0 z-0">
          <ContactConstellationCanvas
            revealProgress={revealProgress}
            exitProgress={exitProgress}
            interactive={interactive}
            pointerRef={pointerRef}
          />
        </div>

        <div className="relative z-10 flex h-full items-center justify-center px-6">
          <motion.div
            className="max-w-3xl text-center"
            style={{ opacity: contentOpacity, y: contentY }}
          >
            <motion.p
              className="mb-5 text-[0.72rem] uppercase tracking-[0.38em] text-white/45"
              style={{ opacity: leadOpacity }}
            >
              Contact
            </motion.p>

            <h2 className="text-[clamp(2.6rem,7vw,5.4rem)] font-semibold tracking-[-0.05em] text-white">
              Let&apos;s build something meaningful.
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/58 sm:text-lg sm:leading-8">
              Open to web development opportunities, freelance collaborations,
              and building responsive, user-friendly applications with a strong
              focus on performance and clarity.
            </p>

            <div className="mt-10 flex flex-col items-center gap-5">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="pointer-events-auto text-sm tracking-[0.26em] text-white/78 transition-colors duration-300 hover:text-accent-gold sm:text-base"
              >
                {CONTACT_EMAIL}
              </a>

              <a
                href={`tel:${CONTACT_PHONE}`}
                className="pointer-events-auto text-sm tracking-[0.26em] text-white/62 transition-colors duration-300 hover:text-accent-gold sm:text-base"
              >
                {CONTACT_PHONE}
              </a>

              <a
                href={`mailto:${CONTACT_EMAIL}?subject=Portfolio%20Inquiry`}
                className="group pointer-events-auto inline-flex items-center gap-3 text-sm uppercase tracking-[0.28em] text-white/88 transition-all duration-500 hover:text-accent-gold"
              >
                <span className="h-px w-12 bg-white/24 transition-colors duration-500 group-hover:bg-accent-gold" />
                Send An Email
                <span className="text-base leading-none transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  ↗
                </span>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
