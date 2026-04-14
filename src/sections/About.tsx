"use client";

import { motion, Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.14,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: "easeOut" },
  },
};

const highlights = [
  "MERN Stack Development",
  "Responsive Web Applications",
  "Performance-Focused UI",
  "Real-World Project Building",
];

export default function About() {
  return (
    <div className="w-full relative">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-10 text-center"
        >
          <motion.div variants={itemVariants} className="space-y-4">
            <h2 className="text-heading">
              About <span className="text-accent-gold">Me</span>
            </h2>
            <p className="text-body mx-auto max-w-3xl text-base sm:text-lg leading-8 text-foreground/78">
              I am a passionate Full Stack Developer with a strong foundation in
              modern web technologies. I completed my Bachelor&apos;s degree in
              Chemistry from Calicut University and transitioned into tech driven
              by my interest in problem-solving and development.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mx-auto max-w-3xl rounded-[2rem] border border-white/8 bg-white/[0.02] px-6 py-7 sm:px-10 sm:py-9 shadow-[0_20px_80px_rgba(0,0,0,0.3)]"
          >
            <p className="text-body text-base sm:text-lg leading-8 text-foreground/78">
              I trained at Brototype, gaining hands-on experience in building
              real-world applications using the MERN stack. I focus on creating
              responsive, performant, and user-friendly web applications.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-4"
          >
            {highlights.map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 text-sm text-foreground/80 transition-all duration-300 hover:border-accent-gold/30 hover:text-accent-gold"
              >
                {item}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
