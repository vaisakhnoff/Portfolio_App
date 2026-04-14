/**
 * Shared mutable scroll store.
 *
 * GSAP ScrollTrigger (in Hero.tsx) writes to `progress`.
 * R3F CameraRig (in Scene.tsx) reads it every frame via useFrame.
 *
 * This avoids React state entirely — no re-renders, no context,
 * no prop drilling through the next/dynamic boundary.
 */
export const scrollStore = { progress: 0 };
