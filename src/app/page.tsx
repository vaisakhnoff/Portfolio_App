import Hero from "@/sections/Hero";
import About from "@/sections/About";
import Skills from "@/sections/Skills";
import Projects from "@/sections/Projects";
import Contact from "@/sections/Contact";
import CinematicSection from "@/components/CinematicSection";
import ScrollSnapProvider from "@/components/ScrollSnapProvider";

export default function Home() {
  return (
    <div className="bg-background flex flex-col items-center justify-center w-full min-h-screen">
      <ScrollSnapProvider />
      
      {/* Hero handles its own strict layout via GSAP pin */}
      <div data-snap="true" className="w-full relative">
        <Hero />
      </div>

      {/* Each major block is strictly 100vh via the CinematicSection and fades perfectly */}
      <CinematicSection id="about">
        <About />
      </CinematicSection>

      <CinematicSection id="skills">
        <Skills />
      </CinematicSection>

      <CinematicSection id="projects">
        <Projects />
      </CinematicSection>

      {/* Contact uses its own 180vh sticky pin wrapper */}
      <div data-snap="true" className="w-full">
        <Contact />
      </div>
    </div>
  );
}
