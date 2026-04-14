import Hero from "@/sections/Hero";
import About from "@/sections/About";
import Skills from "@/sections/Skills";
import Projects from "@/sections/Projects";
import Contact from "@/sections/Contact";
import CinematicSection from "@/components/CinematicSection";
import SectionDivider from "@/components/SectionDivider";

export default function Home() {
  return (
    <div className="bg-background flex flex-col items-center justify-center w-full">
      {/* Hero handles its own strict layout via GSAP pin */}
      <Hero />

      {/* Divider between Hero and regular content flow */}
      <SectionDivider label="Discover" />

      {/* Each major block is strictly 100vh via the CinematicSection and fades perfectly */}
      <CinematicSection id="about">
        <About />
      </CinematicSection>

      <SectionDivider label="Capabilities" />

      <CinematicSection id="skills">
        <Skills />
      </CinematicSection>

      <SectionDivider label="Works" />

      <CinematicSection id="projects">
        <Projects />
      </CinematicSection>

      <SectionDivider label="Connect" />

      <Contact />
    </div>
  );
}
