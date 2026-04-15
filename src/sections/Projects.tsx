"use client";

import { AnimatePresence, motion, Variants } from "framer-motion";
import { startTransition, useState } from "react";
import Image from "next/image";

type ProjectItem = {
  id: number;
  title: string;
  category: string;
  description: string;
  impact: string;
  stack: string[];
  accent: string;
  image: string;
  link: string;
};

const projects: ProjectItem[] = [
  {
    id: 1,
    title: "TimeVault",
    category: "Web Application",
    description:
      "A productivity-focused web application designed to manage and track time efficiently with a clean UI and optimized performance.",
    impact: "Built to support focused daily planning with a lightweight experience, clear task visibility, and performance-conscious interactions.",
    stack: ["EJS", "Node.js", "Express", "MongoDB", "Razorpay", "Vercel"],
    accent: "from-[#f5e6c8]/20 via-[#d4af37]/10 to-transparent",
    image: "/timevault.png",
    link: "https://time-vault-ecommerce-web-app.onrender.com/",
  },
  {
    id: 2,
    title: "Flower Shop Website",
    category: "Business Website",
    description:
      "A business-oriented website for showcasing products with category filtering and WhatsApp-based inquiry system.",
    impact: "Created a cleaner customer journey for product discovery while keeping inquiries fast and accessible for business use.",
    stack: ["React", "Tailwind", "Vercel", "WhatsApp Integration", "Cloudinary"],
    accent: "from-[#d4af37]/18 via-[#ffffff]/8 to-transparent",
    image: "/flowershop.png",
    link: "https://anjaliflowers.vercel.app/",
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
                  <a 
                    href={activeProject.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block relative shadow-2xl min-h-[280px] overflow-hidden border-b border-white/8 lg:min-h-full lg:border-b-0 lg:border-r group/img cursor-pointer"
                  >
                    <div className="absolute inset-0 z-0 bg-black">
                      <Image
                        src={activeProject.image}
                        alt={activeProject.title}
                        fill
                        className="object-cover object-top transition-transform duration-700 group-hover/img:scale-[1.03] opacity-80"
                      />
                    </div>
                    <div className={`absolute inset-0 bg-gradient-to-br ${activeProject.accent} mix-blend-overlay z-10 opacity-70`} />
                    <div className="absolute inset-0 bg-black/60 z-10 hover:bg-black/40 transition-colors duration-500" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_28%,rgba(255,255,255,0.08)_0%,transparent_40%)] z-10" />
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,0,0,0.8)_0%,transparent_50%,rgba(0,0,0,0.6)_100%)] z-10" />

                    <div className="relative z-20 flex h-full flex-col justify-between p-7 sm:p-10 pointer-events-none">
                      <div className="flex items-start justify-between gap-4">
                        <span className="rounded-full border border-white/12 bg-black/40 px-4 py-2 text-[0.68rem] uppercase tracking-[0.28em] text-white/90 backdrop-blur-md">
                          {activeProject.category}
                        </span>
                        <div className="flex group-hover/img:text-accent-gold transition-colors duration-300">
                          <svg className="w-5 h-5 opacity-70 group-hover/img:opacity-100 group-hover/img:translate-x-1 group-hover/img:-translate-y-1 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2.5 sm:max-w-md mt-12">
                        {activeProject.stack.map((item) => (
                          <div
                            key={item}
                            className="rounded-xl border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white/80 backdrop-blur-md"
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </a>

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
