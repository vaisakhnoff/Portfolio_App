"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import type { MutableRefObject } from "react";
import * as THREE from "three";

type ContactConstellationSceneProps = {
  revealProgress: MotionValue<number>;
  exitProgress: MotionValue<number>;
  interactive: boolean;
  pointerRef: MutableRefObject<{ x: number; y: number }>;
};

type StarFieldProps = ContactConstellationSceneProps & {
  mobile: boolean;
};

type StarData = {
  geometry: THREE.BufferGeometry;
  basePositions: Float32Array;
  positions: Float32Array;
  baseSizes: Float32Array;
  baseAlphas: Float32Array;
  phases: Float32Array;
  revealOffsets: Float32Array;
  tintMix: Float32Array;
  hover: Float32Array;
  linger: Float32Array;
  drift: Float32Array;
  sway: Float32Array;
  count: number;
};

const DESKTOP_STAR_COUNT = 88;
const MOBILE_STAR_COUNT = 42;
const DESKTOP_MAX_CONNECTIONS = 160;
const MOBILE_MAX_CONNECTIONS = 60;
const WHITE = new THREE.Color("#f5f7ff");
const GOLD = new THREE.Color("#d8bf8a");
const _projected = new THREE.Vector3();
const _mixColor = new THREE.Color();

function createSeededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function buildStarData(count: number): StarData {
  const random = createSeededRandom(20260414 + count);
  const positions = new Float32Array(count * 3);
  const basePositions = new Float32Array(count * 3);
  const baseSizes = new Float32Array(count);
  const baseAlphas = new Float32Array(count);
  const phases = new Float32Array(count);
  const revealOffsets = new Float32Array(count);
  const tintMix = new Float32Array(count);
  const hover = new Float32Array(count);
  const linger = new Float32Array(count);
  const drift = new Float32Array(count * 3);
  const sway = new Float32Array(count * 2);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    let x = 0;
    let y = 0;
    let z = 0;

    for (let attempt = 0; attempt < 18; attempt++) {
      x = (random() - 0.5) * 16;
      y = (random() - 0.5) * 9;
      z = -1.8 - random() * 13.5;

      const centerMask = Math.abs(x) < 2.4 && Math.abs(y) < 1.8 && z > -9.5;
      if (!centerMask || random() > 0.82) break;
    }

    basePositions[i3] = x;
    basePositions[i3 + 1] = y;
    basePositions[i3 + 2] = z;
    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;

    baseSizes[i] = 1.6 + random() * 2.6;
    baseAlphas[i] = 0.38 + random() * 0.42;
    phases[i] = random() * Math.PI * 2;
    revealOffsets[i] = random();
    tintMix[i] = 0.12 + random() * 0.26;

    drift[i3] = (random() - 0.5) * 0.42;
    drift[i3 + 1] = (random() - 0.5) * 0.28;
    drift[i3 + 2] = (random() - 0.5) * 0.22;
    sway[i * 2] = 0.18 + random() * 0.24;
    sway[i * 2 + 1] = 0.16 + random() * 0.2;
  }

  const anchorIndices = [2, Math.max(3, count - 5)];
  for (const index of anchorIndices) {
    linger[index] = 1;
    baseAlphas[index] = 0.72;
    baseSizes[index] += 1;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(baseSizes, 1));
  geometry.setAttribute("aAlpha", new THREE.BufferAttribute(baseAlphas, 1));
  geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
  geometry.setAttribute("aRevealOffset", new THREE.BufferAttribute(revealOffsets, 1));
  geometry.setAttribute("aTintMix", new THREE.BufferAttribute(tintMix, 1));
  geometry.setAttribute("aHover", new THREE.BufferAttribute(hover, 1));
  geometry.setAttribute("aLinger", new THREE.BufferAttribute(linger, 1));

  return {
    geometry,
    basePositions,
    positions,
    baseSizes,
    baseAlphas,
    phases,
    revealOffsets,
    tintMix,
    hover,
    linger,
    drift,
    sway,
    count,
  };
}

function StarField({
  revealProgress,
  exitProgress,
  interactive,
  pointerRef,
  mobile,
}: StarFieldProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const pointsRef = useRef<THREE.Points>(null!);
  const linesRef = useRef<THREE.LineSegments>(null!);
  const pointMaterialRef = useRef<THREE.ShaderMaterial | null>(null);

  const starData = useMemo(
    () => buildStarData(mobile ? MOBILE_STAR_COUNT : DESKTOP_STAR_COUNT),
    [mobile]
  );

  const lineGeometry = useMemo(() => {
    const maxConnections = mobile
      ? MOBILE_MAX_CONNECTIONS
      : DESKTOP_MAX_CONNECTIONS;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(maxConnections * 2 * 3);
    const colors = new Float32Array(maxConnections * 2 * 3);
    const alpha = new Float32Array(maxConnections * 2);

    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage)
    );
    geometry.setAttribute(
      "color",
      new THREE.BufferAttribute(colors, 3).setUsage(THREE.DynamicDrawUsage)
    );
    geometry.setAttribute(
      "aAlpha",
      new THREE.BufferAttribute(alpha, 1).setUsage(THREE.DynamicDrawUsage)
    );

    return geometry;
  }, [mobile]);

  useEffect(() => {
    return () => {
      starData.geometry.dispose();
      lineGeometry.dispose();
    };
  }, [lineGeometry, starData.geometry]);

  const pointMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uReveal: { value: 0 },
          uExit: { value: 0 },
          uPixelRatio: {
            value: Math.min(
              typeof window === "undefined" ? 1 : window.devicePixelRatio,
              2
            ),
          },
        },
        vertexShader: /* glsl */ `
          attribute float aSize;
          attribute float aAlpha;
          attribute float aPhase;
          attribute float aRevealOffset;
          attribute float aTintMix;
          attribute float aHover;
          attribute float aLinger;
          varying float vAlpha;
          varying float vTintMix;

          uniform float uTime;
          uniform float uReveal;
          uniform float uExit;
          uniform float uPixelRatio;

          void main() {
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            float reveal = smoothstep(0.0, 1.0, (uReveal - aRevealOffset * 0.55) * 2.6);
            float pulse = 0.5 + 0.5 * sin(uTime * (0.48 + aRevealOffset * 0.35) + aPhase);
            float linger = aLinger * smoothstep(0.58, 0.98, uExit) * 0.24;
            float exitFade = max(1.0 - uExit * (1.18 - aLinger * 0.9), linger);
            float depthFade = clamp(1.18 - (-mvPosition.z) / 20.0, 0.38, 1.0);
            float size = aSize * (1.0 + pulse * 0.2 + aHover * 0.45);

            gl_PointSize = size * uPixelRatio * (120.0 / max(-mvPosition.z, 1.0));
            gl_Position = projectionMatrix * mvPosition;

            vAlpha = aAlpha * reveal * exitFade * depthFade * (0.88 + pulse * 0.18 + aHover * 0.36);
            vTintMix = aTintMix + aHover * 0.06;
          }
        `,
        fragmentShader: /* glsl */ `
          varying float vAlpha;
          varying float vTintMix;

          void main() {
            vec2 centered = gl_PointCoord - vec2(0.5);
            float dist = length(centered);
            if (dist > 0.5) discard;

            vec3 white = vec3(0.96, 0.97, 1.0);
            vec3 gold = vec3(0.93, 0.84, 0.66);
            vec3 color = mix(white, gold, clamp(vTintMix, 0.0, 1.0));

            float core = smoothstep(0.22, 0.0, dist);
            float halo = pow(max(0.0, 1.0 - dist * 1.9), 2.3);
            float alpha = (core * 0.65 + halo * 0.75) * vAlpha;

            gl_FragColor = vec4(color, alpha);
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  const lineMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {},
        vertexShader: /* glsl */ `
          attribute float aAlpha;
          varying float vAlpha;
          varying vec3 vColor;

          void main() {
            vAlpha = aAlpha;
            vColor = color;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          varying float vAlpha;
          varying vec3 vColor;

          void main() {
            gl_FragColor = vec4(vColor, vAlpha);
          }
        `,
        transparent: true,
        depthWrite: false,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  useEffect(() => {
    pointMaterialRef.current = pointMaterial;

    return () => {
      pointMaterialRef.current = null;
      pointMaterial.dispose();
      lineMaterial.dispose();
    };
  }, [lineMaterial, pointMaterial]);

  useFrame(({ camera, clock }) => {
    const t = clock.getElapsedTime();
    const reveal = revealProgress.get();
    const exit = exitProgress.get();
    const pointer = interactive ? pointerRef.current : { x: 0, y: 0 };

    camera.position.x += ((interactive ? pointer.x * 0.24 : 0) - camera.position.x) * 0.03;
    camera.position.y += ((interactive ? pointer.y * 0.18 : 0) - camera.position.y) * 0.03;
    camera.lookAt(0, 0, -4.6);

    groupRef.current.rotation.y += ((interactive ? pointer.x * 0.055 : 0) - groupRef.current.rotation.y) * 0.03;
    groupRef.current.rotation.x += ((interactive ? pointer.y * 0.035 : 0) - groupRef.current.rotation.x) * 0.03;

    const positionsAttr = starData.geometry.getAttribute("position") as THREE.BufferAttribute;
    const hoverAttr = starData.geometry.getAttribute("aHover") as THREE.BufferAttribute;
    const positions = positionsAttr.array as Float32Array;
    const hover = hoverAttr.array as Float32Array;

    for (let i = 0; i < starData.count; i++) {
      const i3 = i * 3;
      const phase = starData.phases[i];
      const swayX = starData.sway[i * 2];
      const swayY = starData.sway[i * 2 + 1];
      const depthParallax = THREE.MathUtils.clamp(
        (-starData.basePositions[i3 + 2] - 1.8) / 13.5,
        0,
        1
      );

      positions[i3] =
        starData.basePositions[i3] +
        Math.sin(t * swayX + phase) * starData.drift[i3] +
        Math.cos(t * 0.08 + phase * 0.7) * 0.06 +
        pointer.x * depthParallax * 0.22;
      positions[i3 + 1] =
        starData.basePositions[i3 + 1] +
        Math.cos(t * swayY + phase * 1.17) * starData.drift[i3 + 1] +
        Math.sin(t * 0.06 + phase) * 0.05 +
        pointer.y * depthParallax * 0.16;
      positions[i3 + 2] =
        starData.basePositions[i3 + 2] +
        Math.sin(t * 0.045 + phase * 0.8) * starData.drift[i3 + 2];

      let hoverTarget = 0;
      if (interactive) {
        _projected.set(positions[i3], positions[i3 + 1], positions[i3 + 2]).project(camera);
        const dx = _projected.x - pointer.x;
        const dy = _projected.y - pointer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        hoverTarget = THREE.MathUtils.smoothstep(0.28, 0.0, dist);
      }

      hover[i] += (hoverTarget - hover[i]) * 0.08;
    }

    positionsAttr.needsUpdate = true;
    hoverAttr.needsUpdate = true;

    const livePointMaterial = pointMaterialRef.current;
    if (!livePointMaterial) return;

    livePointMaterial.uniforms.uTime.value = t;
    livePointMaterial.uniforms.uReveal.value = reveal;
    livePointMaterial.uniforms.uExit.value = exit;

    const linePositions = lineGeometry.getAttribute("position") as THREE.BufferAttribute;
    const lineColors = lineGeometry.getAttribute("color") as THREE.BufferAttribute;
    const lineAlpha = lineGeometry.getAttribute("aAlpha") as THREE.BufferAttribute;
    const linePosArray = linePositions.array as Float32Array;
    const lineColorArray = lineColors.array as Float32Array;
    const lineAlphaArray = lineAlpha.array as Float32Array;
    const maxConnections = mobile
      ? MOBILE_MAX_CONNECTIONS
      : DESKTOP_MAX_CONNECTIONS;
    const threshold = mobile ? 2.55 : 2.95;
    const thresholdSq = threshold * threshold;
    const lineReveal = THREE.MathUtils.smoothstep(reveal, 0.28, 0.66);
    const lineExit = 1 - THREE.MathUtils.smoothstep(exit, 0.0, 1.0);

    let connectionCount = 0;

    for (let i = 0; i < starData.count; i++) {
      if (connectionCount >= maxConnections) break;

      const i3 = i * 3;
      const ix = positions[i3];
      const iy = positions[i3 + 1];
      const iz = positions[i3 + 2];

      for (let j = i + 1; j < starData.count; j++) {
        if (connectionCount >= maxConnections) break;

        const j3 = j * 3;
        const dx = positions[j3] - ix;
        const dy = positions[j3 + 1] - iy;
        const dz = positions[j3 + 2] - iz;
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq > thresholdSq) continue;

        const closeness = 1 - distSq / thresholdSq;
        const pairPulse =
          0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 0.42 + i * 0.67 + j * 0.31));
        const hoverBoost = (hover[i] + hover[j]) * 0.5;
        const alpha =
          closeness *
          closeness *
          pairPulse *
          lineReveal *
          lineExit *
          (0.04 + hoverBoost * 0.045);

        if (alpha < 0.009) continue;

        const baseIndex = connectionCount * 6;
        const alphaIndex = connectionCount * 2;
        const tint = (starData.tintMix[i] + starData.tintMix[j]) * 0.5;
        _mixColor.lerpColors(WHITE, GOLD, tint);

        linePosArray[baseIndex] = ix;
        linePosArray[baseIndex + 1] = iy;
        linePosArray[baseIndex + 2] = iz;
        linePosArray[baseIndex + 3] = positions[j3];
        linePosArray[baseIndex + 4] = positions[j3 + 1];
        linePosArray[baseIndex + 5] = positions[j3 + 2];

        lineColorArray[baseIndex] = _mixColor.r;
        lineColorArray[baseIndex + 1] = _mixColor.g;
        lineColorArray[baseIndex + 2] = _mixColor.b;
        lineColorArray[baseIndex + 3] = _mixColor.r;
        lineColorArray[baseIndex + 4] = _mixColor.g;
        lineColorArray[baseIndex + 5] = _mixColor.b;

        lineAlphaArray[alphaIndex] = alpha;
        lineAlphaArray[alphaIndex + 1] = alpha;

        connectionCount++;
      }
    }

    linePositions.needsUpdate = true;
    lineColors.needsUpdate = true;
    lineAlpha.needsUpdate = true;
    lineGeometry.setDrawRange(0, connectionCount * 2);
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef} geometry={starData.geometry} material={pointMaterial} />
      <lineSegments ref={linesRef} geometry={lineGeometry} material={lineMaterial} />
    </group>
  );
}

export default function ContactConstellationScene(
  props: ContactConstellationSceneProps
) {
  const mobile = props.interactive === false;

  return (
    <Canvas
      camera={{ position: [0, 0, 8.2], fov: 42 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.95,
      }}
      dpr={[1, 1.75]}
      style={{ width: "100%", height: "100%", pointerEvents: "none" }}
    >
      <ambientLight intensity={0.2} color="#d9d7cf" />
      <pointLight position={[0, 0, 5]} intensity={0.35} color="#f4edd9" />
      <pointLight position={[4, -3, -2]} intensity={0.2} color="#b8976a" />
      <StarField {...props} mobile={mobile} />
    </Canvas>
  );
}
