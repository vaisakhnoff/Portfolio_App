"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { scrollStore } from "@/lib/scrollStore";

/* ── Constants ─────────────────────────────────────────────────────────── */

const GOLD = "#d4af37";
const GOLD_BORDER_REST = "rgba(212, 175, 55, 0.15)";
const GOLD_BORDER_HOVER = "rgba(212, 175, 55, 0.5)";
const GOLD_SHADOW_REST =
  "0 0 15px rgba(212,175,55,0.04)";
const GOLD_SHADOW_HOVER =
  "0 0 20px rgba(212,175,55,0.15), 0 0 50px rgba(212,175,55,0.06), inset 0 0 20px rgba(212,175,55,0.04)";

// Module-level — safe because this file only loads on the client (ssr:false chain)
const IS_DESKTOP = typeof window !== "undefined" && window.innerWidth >= 768;

/* ── Types ─────────────────────────────────────────────────────────────── */

interface GlassPanelProps {
  position: [number, number, number];
  rotation: [number, number, number];
  width: number;
  height: number;
  /** Scroll progress range [fadeIn, fadeOut] within 0–1 */
  visibleRange: [number, number];
  title: string;
  subtitle?: string;
  body?: string;
  items?: string[];
}

/* ── Component ─────────────────────────────────────────────────────────── */

export default function GlassPanel({
  position,
  rotation,
  width,
  height,
  visibleRange,
  title,
  subtitle,
  body,
  items,
}: GlassPanelProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const glassMatRef = useRef<THREE.MeshPhysicalMaterial>(null!);
  const edgeMatRef = useRef<THREE.LineBasicMaterial>(null!);
  const glowLightRef = useRef<THREE.PointLight>(null!);
  const htmlRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const hovered = useRef(false);
  const opacity = useRef(0);

  // Magnetic hover state — target and smoothed current
  const magnetTarget = useRef({ x: 0, y: 0 });
  const magnetCurrent = useRef({ x: 0, y: 0 });

  /* ── Edge geometry (gold rectangle border) ───────────────────────── */
  const edgeGeo = useMemo(
    () => new THREE.EdgesGeometry(new THREE.PlaneGeometry(width, height)),
    [width, height]
  );

  useEffect(() => {
    const g = edgeGeo;
    return () => g.dispose();
  }, [edgeGeo]);

  /* ── Hover + magnetic handlers (DOM events, no React re-render) ──── */
  const handleEnter = () => {
    if (!IS_DESKTOP) return;
    hovered.current = true;
    if (panelRef.current) {
      panelRef.current.style.borderColor = GOLD_BORDER_HOVER;
      panelRef.current.style.boxShadow = GOLD_SHADOW_HOVER;
    }
  };

  const handleLeave = () => {
    hovered.current = false;
    magnetTarget.current.x = 0;
    magnetTarget.current.y = 0;
    if (panelRef.current) {
      panelRef.current.style.borderColor = GOLD_BORDER_REST;
      panelRef.current.style.boxShadow = GOLD_SHADOW_REST;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!IS_DESKTOP) return;
    const rect = e.currentTarget.getBoundingClientRect();
    // Normalize cursor offset from center to [-0.5, 0.5]
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    // Scale to subtle 3D-space offsets
    magnetTarget.current.x = nx * 0.15;
    magnetTarget.current.y = -ny * 0.1; // invert Y for 3D
  };

  /* ── Per-frame update: visibility, slide-in, float, magnetic, scale ── */
  useFrame(({ clock }) => {
    const progress = scrollStore.progress;
    const [start, end] = visibleRange;
    const t = clock.getElapsedTime();

    // Smooth fade in/out based on scroll progress
    const fadeIn = THREE.MathUtils.smoothstep(progress, start, start + 0.05);
    const fadeOut = 1 - THREE.MathUtils.smoothstep(progress, end - 0.05, end);
    const target = fadeIn * fadeOut;
    opacity.current += (target - opacity.current) * 0.06;
    const op = opacity.current;

    groupRef.current.visible = op > 0.005;
    if (!groupRef.current.visible) return;

    // 3D material opacities — edge glow intensifies on hover
    glassMatRef.current.opacity = op * (hovered.current ? 0.22 : 0.12);
    edgeMatRef.current.opacity = op * (hovered.current ? 0.7 : 0.25);

    // Soft gold point light — fades in on hover for ambient light spread
    const lightTarget = hovered.current ? 0.6 : 0;
    const lightCur = glowLightRef.current.intensity;
    glowLightRef.current.intensity += (lightTarget - lightCur) * 0.06;

    // HTML wrapper opacity
    if (htmlRef.current) {
      htmlRef.current.style.opacity = String(op);
    }

    // Slide-in from below (first 6% after panel appears)
    const slide = THREE.MathUtils.smoothstep(progress, start, start + 0.06);
    const slideY = (1 - slide) * 0.5;

    // Subtle perpetual float
    const floatY = Math.sin(t * 0.4 + position[2] * 0.5) * 0.04;

    // Magnetic pull — spring-like lerp toward cursor offset
    magnetCurrent.current.x += (magnetTarget.current.x - magnetCurrent.current.x) * 0.07;
    magnetCurrent.current.y += (magnetTarget.current.y - magnetCurrent.current.y) * 0.07;

    groupRef.current.position.set(
      position[0] + magnetCurrent.current.x,
      position[1] - slideY + floatY + magnetCurrent.current.y,
      position[2]
    );

    // Hover scale (lerp for smooth transition)
    const ts = hovered.current ? 1.04 : 1;
    const s = groupRef.current.scale.x;
    groupRef.current.scale.setScalar(s + (ts - s) * 0.08);
  });

  /* ── Render ──────────────────────────────────────────────────────── */
  return (
    <group ref={groupRef} rotation={rotation} visible={false}>
      {/* Soft gold point light — hover glow spread */}
      <pointLight
        ref={glowLightRef}
        color="#d4af37"
        intensity={0}
        distance={3}
        decay={2}
        position={[0, 0, 0.3]}
      />

      {/* Frosted glass plane */}
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshPhysicalMaterial
          ref={glassMatRef}
          color="#1a1a1a"
          metalness={0.15}
          roughness={0.1}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Gold border (EdgesGeometry = clean rectangle, no diagonal) */}
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial
          ref={edgeMatRef}
          color={GOLD}
          transparent
          opacity={0}
        />
      </lineSegments>

      {/* HTML content overlay */}
      <Html
        transform
        distanceFactor={3}
        position={[0, 0, 0.02]}
        style={{ pointerEvents: IS_DESKTOP ? "auto" : "none" }}
      >
        <div ref={htmlRef} style={{ opacity: 0 }}>
          <div
            ref={panelRef}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
            onMouseMove={handleMouseMove}
            style={{
              width: 260,
              padding: "28px 32px",
              borderRadius: 10,
              border: `1px solid ${GOLD_BORDER_REST}`,
              background: "rgba(15, 15, 15, 0.55)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              boxShadow: GOLD_SHADOW_REST,
              color: "#fff",
              fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
              userSelect: "none",
              transition:
                "border-color 0.4s ease, box-shadow 0.4s ease",
              cursor: "default",
            }}
          >
            {/* Decorative gold accent line */}
            <div
              style={{
                width: 32,
                height: 1,
                background: GOLD,
                marginBottom: 16,
                opacity: 0.6,
              }}
            />

            {/* Title */}
            <h3
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: GOLD,
                margin: "0 0 12px",
              }}
            >
              {title}
            </h3>

            {/* Subtitle */}
            {subtitle && (
              <p
                style={{
                  fontSize: 16,
                  fontWeight: 500,
                  color: "#fff",
                  margin: "0 0 10px",
                  lineHeight: 1.4,
                }}
              >
                {subtitle}
              </p>
            )}

            {/* Body text */}
            {body && (
              <p
                style={{
                  fontSize: 13,
                  color: "#a1a1aa",
                  margin: 0,
                  lineHeight: 1.65,
                }}
              >
                {body}
              </p>
            )}

            {/* Item list */}
            {items && items.length > 0 && (
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "8px 0 0",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {items.map((item, i) => (
                  <li
                    key={i}
                    style={{
                      fontSize: 13,
                      color: "#a1a1aa",
                      lineHeight: 1.5,
                      paddingLeft: 14,
                      position: "relative",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        left: 0,
                        color: GOLD,
                        opacity: 0.5,
                      }}
                    >
                      ›
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Html>
    </group>
  );
}
