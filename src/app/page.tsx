import Hero from "@/sections/Hero";
import About from "@/sections/About";
import Skills from "@/sections/Skills";
import Projects from "@/sections/Projects";
import Contact from "@/sections/Contact";
import CinematicSection from "@/components/CinematicSection";

export default function Home() {
  return (
    <div className="bg-background flex flex-col items-center justify-center w-full">
      {/* Hero handles its own strict layout via GSAP pin */}
      <Hero />

      {/* Spacer between Hero and regular content flow */}
      <div className="h-[20vh] w-full" aria-hidden="true" />

      {/* Each major block is strictly 100vh via the CinematicSection and fades perfectly */}
      <CinematicSection id="about">
        <About />
      </CinematicSection>

      <div className="h-[15vh] w-full" aria-hidden="true" />

      <CinematicSection id="skills">
        <Skills />
      </CinematicSection>

      <div className="h-[15vh] w-full" aria-hidden="true" />

      <CinematicSection id="projects">
        <Projects />
      </CinematicSection>

      <div className="h-[15vh] w-full" aria-hidden="true" />

      <Contact />
    </div>
  );
}

