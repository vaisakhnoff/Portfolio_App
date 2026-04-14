"use client";

import { motion, Variants } from "framer-motion";
import {
  SiHtml5, SiCss, SiTailwindcss, SiBootstrap, SiJavascript, SiTypescript, SiReact, SiNextdotjs,
  SiNodedotjs, SiExpress, SiMongodb, SiPostgresql, SiGit, SiGithub, SiPostman
} from "react-icons/si";
import { FaPalette, FaServer, FaPlug } from "react-icons/fa";

const skillsData = [
  {
    category: "Frontend",
    items: [
      { name: "HTML5", icon: SiHtml5, color: "#E34F26" },
      { name: "CSS3", icon: SiCss, color: "#1572B6" },
      { name: "JavaScript", icon: SiJavascript, color: "#F7DF1E" },
      { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },
      { name: "React.js", icon: SiReact, color: "#61DAFB" },
      { name: "Next.js", icon: SiNextdotjs, color: "#ffffff" },
      { name: "Tailwind CSS", icon: SiTailwindcss, color: "#06B6D4" },
      { name: "Bootstrap", icon: SiBootstrap, color: "#7952B3" },
      { name: "Component CSS", icon: FaPalette, color: "#FF69B4" },
    ],
  },
  {
    category: "Backend",
    items: [
      { name: "Node.js", icon: SiNodedotjs, color: "#339933" },
      { name: "Express.js", icon: SiExpress, color: "#ffffff" },
      { name: "REST APIs", icon: FaServer, color: "#A8B9CC" },
    ],
  },
  {
    category: "Databases",
    items: [
      { name: "MongoDB", icon: SiMongodb, color: "#47A248" },
      { name: "PostgreSQL", icon: SiPostgresql, color: "#4169E1" },
    ],
  },
  {
    category: "Tools",
    items: [
      { name: "Git", icon: SiGit, color: "#F05032" },
      { name: "GitHub", icon: SiGithub, color: "#ffffff" },
      { name: "Postman", icon: SiPostman, color: "#FF6C37" },
      { name: "API Integration", icon: FaPlug, color: "#A8B9CC" },
    ],
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const categoryVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function Skills() {
  return (
    <div className="w-full relative py-12 sm:py-20">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-16"
        >
          <div className="text-center space-y-4">
            <h2 className="text-heading">
              Technical <span className="text-accent-gold">Skills</span>
            </h2>
            <p className="text-body mx-auto max-w-2xl">
              A structured overview of the technologies and tools I use to build
              clean, scalable, and production-ready web applications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {skillsData.map((group) => (
              <motion.div
                key={group.category}
                variants={categoryVariants}
                className="flex flex-col"
              >
                <div className="mb-6 font-bold text-xl md:text-2xl text-foreground flex items-center border-b border-white/10 pb-3">
                  {group.category}
                </div>

                <motion.div
                  className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                >
                  {group.items.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <motion.div
                        key={item.name}
                        variants={itemVariants}
                        whileHover={{ y: -4, scale: 1.05 }}
                        className="group flex flex-col items-center justify-center p-5 rounded-2xl border border-white/10 bg-white/[0.02] shadow-sm transition-all duration-300 hover:border-accent-gold/40 hover:bg-white/[0.04] hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] cursor-pointer"
                      >
                        <IconComponent
                          className="text-4xl mb-3 opacity-90 transition-transform duration-300 group-hover:scale-110"
                          style={{ color: item.color }}
                        />
                        <span className="text-xs sm:text-sm font-medium text-foreground/80 group-hover:text-foreground text-center">
                          {item.name}
                        </span>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
