"use client";

import { AnimatePresence, motion, Variants } from "framer-motion";
import { startTransition, useState } from "react";

type ProjectItem = {
  id: number;
  title: string;
  category: string;
  description: string;
  impact: string;
  stack: string[];
  accent: string;
};

const projects: ProjectItem[] = [
  {
    id: 1,
    title: "TimeVault",
    category: "Web Application",
    description:
      "A productivity-focused web application designed to manage and track time efficiently with a clean UI and optimized performance.",
    impact: "Built to support focused daily planning with a lightweight experience, clear task visibility, and performance-conscious interactions.",
    stack: ["React.js", "Node.js", "Express.js", "MongoDB"],
    accent: "from-[#f5e6c8]/20 via-[#d4af37]/10 to-transparent",
  },
  {
    id: 2,
    title: "Flower Shop Website",
    category: "Business Website",
    description:
      "A business-oriented website for showcasing products with category filtering and WhatsApp-based inquiry system.",
    impact: "Created a cleaner customer journey for product discovery while keeping inquiries fast and accessible for business use.",
    stack: ["Next.js", "Tailwind CSS", "Category Filtering", "WhatsApp Integration"],
    accent: "from-[#d4af37]/18 via-[#ffffff]/8 to-transparent",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const cardVariants: Variants = {
  enter: { opacity: 0, x: 32, scale: 0.985 },
  center: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.65, ease: [0.23, 1, 0.32, 1] } },
  exit: { opacity: 0, x: -32, scale: 0.985, transition: { duration: 0.45, ease: [0.4, 0, 1, 1] } },
};

export default function Projects() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeProject = projects[activeIndex];

  const goTo = (index: number) => {
    startTransition(() => {
      setActiveIndex(index);
    });
  };

  const goNext = () => {
    startTransition(() => {
      setActiveIndex((current) => (current + 1) % projects.length);
    });
  };

  const goPrev = () => {
    startTransition(() => {
      setActiveIndex((current) => (current - 1 + projects.length) % projects.length);
    });
  };

  return (
    <div className="w-full relative">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-10 sm:space-y-12"
        >
          <motion.div variants={itemVariants} className="text-center space-y-4">
            <h2 className="text-heading">
              Selected <span className="text-accent-gold">Works</span>
            </h2>
            <p className="text-body max-w-2xl mx-auto">
              A clean project carousel that keeps the cinematic layout readable
              while making it easy to add and present more work over time.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="text-xs uppercase tracking-[0.28em] text-text-muted">
                {String(activeIndex + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={goPrev}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-foreground/80 transition-all duration-300 hover:border-accent-gold/40 hover:text-accent-gold"
                  aria-label="Previous project"
                >
                  <span aria-hidden="true">←</span>
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-foreground/80 transition-all duration-300 hover:border-accent-gold/40 hover:text-accent-gold"
                  aria-label="Next project"
                >
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>

            <div className="relative min-h-[560px] overflow-hidden rounded-[2rem] border border-white/8 bg-white/[0.02] shadow-[0_30px_100px_rgba(0,0,0,0.45)]">
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.01)_100%)]" />

              <AnimatePresence mode="wait">
                <motion.article
                  key={activeProject.id}
                  variants={cardVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  whileHover={{ scale: 1.01 }}
                  className="relative grid min-h-[560px] grid-cols-1 lg:grid-cols-[1.15fr_0.85fr]"
                >
                  <div className="relative min-h-[280px] overflow-hidden border-b border-white/8 lg:min-h-full lg:border-b-0 lg:border-r">
                    <div className={`absolute inset-0 bg-gradient-to-br ${activeProject.accent}`} />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_28%,rgba(255,255,255,0.16)_0%,transparent_28%)]" />
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.03)_0%,transparent_45%,rgba(212,175,55,0.06)_100%)]" />

                    <div className="relative flex h-full flex-col justify-between p-7 sm:p-10">
                      <div className="flex items-start justify-between gap-4">
                        <span className="rounded-full border border-white/12 bg-black/15 px-4 py-2 text-[0.68rem] uppercase tracking-[0.28em] text-white/70">
                          {activeProject.category}
                        </span>
                        <span className="text-[0.7rem] uppercase tracking-[0.3em] text-white/40">
                          Case Study
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 sm:max-w-md">
                        {activeProject.stack.map((item) => (
                          <div
                            key={item}
                            className="rounded-2xl border border-white/8 bg-black/18 px-4 py-4 text-sm text-white/72 backdrop-blur-sm"
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="relative flex flex-col justify-between p-7 sm:p-10 lg:p-12">
                    <div className="space-y-6">
                      <div className="text-xs uppercase tracking-[0.28em] text-accent-gold">
                        Project Overview
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">
                          {activeProject.title}
                        </h3>
                        <p className="text-body max-w-xl text-base sm:text-lg">
                          {activeProject.description}
                        </p>
                      </div>

                      <div className="rounded-3xl border border-white/8 bg-black/16 p-5 sm:p-6">
                        <div className="text-[0.68rem] uppercase tracking-[0.28em] text-white/40">
                          Outcome
                        </div>
                        <p className="mt-3 text-sm leading-7 text-white/72 sm:text-base">
                          {activeProject.impact}
                        </p>
                      </div>
                    </div>

                    <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        {projects.map((project, index) => (
                          <button
                            key={project.id}
                            type="button"
                            onClick={() => goTo(index)}
                            className={`h-2.5 rounded-full transition-all duration-300 ${
                              index === activeIndex
                                ? "w-10 bg-accent-gold"
                                : "w-2.5 bg-white/18 hover:bg-white/32"
                            }`}
                            aria-label={`Show ${project.title}`}
                            aria-pressed={index === activeIndex}
                          />
                        ))}
                      </div>

                      <div className="text-sm uppercase tracking-[0.22em] text-white/56">
                        Scroll-friendly Carousel
                      </div>
                    </div>
                  </div>
                </motion.article>
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
