"use client";

import dynamic from "next/dynamic";

/**
 * Dynamically loads the R3F Scene with SSR disabled.
 * Three.js and React Three Fiber depend on browser-only APIs (WebGL, window,
 * canvas) and cannot be server-rendered.
 *
 * Usage:
 *   import SceneCanvas from "@/components/three/SceneCanvas";
 *   <SceneCanvas />
 */
const SceneCanvas = dynamic(() => import("@/components/three/Scene"), {
  ssr: false,
  loading: () => null, // invisible while loading — avoids layout shift
});

export default SceneCanvas;
