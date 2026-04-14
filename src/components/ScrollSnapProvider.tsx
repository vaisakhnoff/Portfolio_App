"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function ScrollSnapProvider() {
  useEffect(() => {
    // Core GSAP Plugin Registration
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    // Give the DOM a moment to fully lay out before mapping snap zones
    const timer = setTimeout(() => {
      const snapTargets = document.querySelectorAll("[data-snap='true']");
      if (!snapTargets.length) return;

      const isMobile = window.innerWidth < 768;

      let scrollTimeout: NodeJS.Timeout;
      
      const handleScrollEnd = () => {
        // Calculate the center of the viewport
        const viewportCenter = window.scrollY + window.innerHeight / 2;
        let closestTarget: Element | null = null;
        let minDistance = Infinity;

        // Iterate through all snap-enabled sections
        snapTargets.forEach((target) => {
          const rect = target.getBoundingClientRect();
          const targetCenter = window.scrollY + rect.top + rect.height / 2;
          
          // Absolute distance between viewport center and target center
          const distance = Math.abs(viewportCenter - targetCenter);

          if (distance < minDistance) {
            minDistance = distance;
            closestTarget = target;
          }
        });

        // Auto Scroll to the closest section start if it is close enough 
        // avoiding jarring jumps if they are midway scanning long sections.
        if (closestTarget) {
            const targetElement = closestTarget as HTMLElement;
            const elementTop = targetElement.getBoundingClientRect().top + window.scrollY;
            
            // Distance check to only snap if we are "near" the edge to avoid fighting the user
            if (minDistance < window.innerHeight * 0.45) {
                gsap.to(window, {
                  scrollTo: { y: elementTop, autoKill: true },
                  duration: isMobile ? 0.6 : 0.85,
                  ease: "power2.out",
                });
            }
        }
      };

      const scrollListener = () => {
        clearTimeout(scrollTimeout);
        // Fires only when the user STOPS scrolling for 150ms
        scrollTimeout = setTimeout(handleScrollEnd, isMobile ? 120 : 180);
      };

      window.addEventListener("scroll", scrollListener, { passive: true });

      return () => {
        clearTimeout(scrollTimeout);
        window.removeEventListener("scroll", scrollListener);
      };
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
