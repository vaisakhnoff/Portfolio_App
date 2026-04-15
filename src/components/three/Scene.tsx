"use client";

import { Suspense, useRef, useMemo, useEffect, useCallback, useState } from "react";
import { Canvas, useFrame, ThreeEvent, useThree } from "@react-three/fiber";
import { Center, Text3D } from "@react-three/drei";
import * as THREE from "three";
import helvetikerFont from "three/examples/fonts/helvetiker_regular.typeface.json";
import { scrollStore } from "@/lib/scrollStore";
import GlassPanel from "@/components/three/GlassPanel";

const CAMERA_KEYFRAMES = [
  { at: 0, pos: [0, 0.65, 6.4] as const, look: [0, 0.05, 0] as const },
  { at: 0.12, pos: [0, 0.42, 4.4] as const, look: [0, 0.04, -0.2] as const },
  { at: 0.22, pos: [0, 0.18, 2.2] as const, look: [0, 0.02, -0.55] as const },
  { at: 0.3, pos: [0, 0.04, 0.72] as const, look: [0, 0, -0.95] as const },
  { at: 0.36, pos: [0, 0.0, -0.18] as const, look: [0, 0, -1.45] as const },
  { at: 0.44, pos: [0, -0.02, -1.65] as const, look: [0, -0.02, -3.2] as const },
  { at: 0.56, pos: [0.7, -0.08, -4.9] as const, look: [2.1, -0.08, -6.8] as const },
  { at: 0.7, pos: [-0.5, -0.24, -8.6] as const, look: [-2.3, -0.3, -10.7] as const },
  { at: 0.84, pos: [0, -0.42, -12.7] as const, look: [0, -0.45, -14.7] as const },
  { at: 1.0, pos: [0, -0.6, -16.6] as const, look: [0, -0.62, -18.8] as const },
];

const _pos = new THREE.Vector3();
const _look = new THREE.Vector3();
const _startPos = new THREE.Vector3();
const _endPos = new THREE.Vector3();
const _startLk = new THREE.Vector3();
const _endLk = new THREE.Vector3();

const PARTICLE_COUNT_DESKTOP = 360;
const PARTICLE_COUNT_MOBILE = 180;

const PARTICLE_PALETTE = [
  new THREE.Color("#ffffff"),
  new THREE.Color("#f5e6c8"),
  new THREE.Color("#e8d5a3"),
  new THREE.Color("#d4c9a8"),
  new THREE.Color("#f0e0c0"),
];

const FOG_COLOR_REST = new THREE.Color("#060708");
const FOG_COLOR_INSIDE = new THREE.Color("#020304");
const _fogColor = new THREE.Color();
const _particleRaycaster = new THREE.Raycaster();
const _particlePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 4.5);
const _rippleFallback = new THREE.Vector3();

type ParticleInteractionState = {
  enabled: boolean;
  active: boolean;
  pointerNdc: THREE.Vector2;
  rippleCenter: THREE.Vector3;
  ripplePulse: number;
};

function createSeededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function interpolateCamera(progress: number, mobileScale: number) {
  const p = THREE.MathUtils.clamp(progress, 0, 1);

  let i = 0;
  for (; i < CAMERA_KEYFRAMES.length - 2; i++) {
    if (p <= CAMERA_KEYFRAMES[i + 1].at) break;
  }

  const start = CAMERA_KEYFRAMES[i];
  const end = CAMERA_KEYFRAMES[i + 1];
  const range = end.at - start.at;
  const local = range > 0 ? (p - start.at) / range : 0;
  const t = local * local * (3 - 2 * local);

  _startPos.set(start.pos[0], start.pos[1], start.pos[2]);
  _endPos.set(end.pos[0], end.pos[1], end.pos[2]);
  _startLk.set(start.look[0], start.look[1], start.look[2]);
  _endLk.set(end.look[0], end.look[1], end.look[2]);

  _pos.lerpVectors(_startPos, _endPos, t);
  _look.lerpVectors(_startLk, _endLk, t);

  _pos.x *= mobileScale;
  _look.x *= mobileScale;
  _pos.y *= mobileScale === 1 ? 1 : 0.6; // Slightly less aggressive scale for y
  _look.y *= mobileScale === 1 ? 1 : 0.6;

  return { pos: _pos, look: _look };
}

function CameraRig() {
  const mobileScale = useRef(1);

  useEffect(() => {
    const check = () => {
      mobileScale.current = window.innerWidth < 768 ? 0.45 : 1;
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useFrame(({ camera, clock }) => {
    const t = clock.getElapsedTime();
    const progress = scrollStore.progress;
    const { pos, look } = interpolateCamera(progress, mobileScale.current);

    const approachFade = 1 - THREE.MathUtils.smoothstep(progress, 0.18, 0.34);
    const idleX = Math.sin(t * 0.18) * 0.08 * approachFade;
    const idleY = Math.cos(t * 0.14) * 0.045 * approachFade;

    camera.position.set(pos.x + idleX, pos.y + idleY, pos.z);
    camera.lookAt(look.x, look.y, look.z);
  });

  return null;
}

type ParticleData = {
  geometry: THREE.BufferGeometry;
  origins: Float32Array;
  velocities: Float32Array;
  seeds: Float32Array;
  depths: Float32Array;
  offsets: Float32Array;
  interaction: Float32Array;
  count: number;
};

function buildParticleData(count: number) {
  const random = createSeededRandom(1337 + count);
  const positions = new Float32Array(count * 3);
  const origins = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const seeds = new Float32Array(count * 4);
  const velocities = new Float32Array(count * 3);
  const depths = new Float32Array(count);
  const offsets = new Float32Array(count * 3);
  const interaction = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const i4 = i * 4;

    const r = 1.2 + Math.pow(random(), 0.58) * 22;
    const theta = random() * Math.PI * 2;
    const phi = Math.acos(2 * random() - 1);

    const tunnelBias = random() < 0.35;
    const x = tunnelBias ? (random() - 0.5) * 2.2 : r * Math.sin(phi) * Math.cos(theta);
    const y = tunnelBias ? (random() - 0.5) * 1.5 : r * Math.sin(phi) * Math.sin(theta) * 0.52;
    const z = tunnelBias ? THREE.MathUtils.lerp(2.8, -12.5, random()) : r * Math.cos(phi) - 6.4;

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;
    origins[i3] = x;
    origins[i3 + 1] = y;
    origins[i3 + 2] = z;

    const depth = THREE.MathUtils.clamp((r - 1.2) / 22, 0, 1);
    depths[i] = depth;

    sizes[i] = THREE.MathUtils.lerp(4.2, 0.95, depth) + (random() - 0.5) * 0.7;

    const color = PARTICLE_PALETTE[Math.floor(random() * PARTICLE_PALETTE.length)];
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;

    seeds[i4] = random() * Math.PI * 2;
    seeds[i4 + 1] = random() * Math.PI * 2;
    seeds[i4 + 2] = random() * Math.PI * 2;
    seeds[i4 + 3] = 0.55 + random() * 1.1;

    const speed = THREE.MathUtils.lerp(0.011, 0.0025, depth);
    velocities[i3] = (random() - 0.5) * speed;
    velocities[i3 + 1] = (random() - 0.35) * speed * 0.72;
    velocities[i3 + 2] = (random() - 0.5) * speed * 0.55;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute("aInteract", new THREE.BufferAttribute(interaction, 1));

  return { geometry, origins, velocities, seeds, depths, offsets, interaction, count };
}

function ParticleInteractionController({
  interactionRef,
}: {
  interactionRef: React.MutableRefObject<ParticleInteractionState>;
}) {
  const { gl, camera } = useThree();

  useEffect(() => {
    const domElement = gl.domElement;
    const hoverMedia = window.matchMedia("(hover: hover) and (pointer: fine)");

    const syncEnabled = () => {
      // Always enable interaction so tap/ripple works on mobile
      interactionRef.current.enabled = true;
    };

    const updatePointer = (event: PointerEvent) => {
      if (!interactionRef.current.enabled) return;

      const rect = domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);

      interactionRef.current.pointerNdc.set(x, y);
      interactionRef.current.active = true;
    };

    const handlePointerMove = (event: PointerEvent) => {
      updatePointer(event);
    };

    const handlePointerLeave = () => {
      interactionRef.current.active = false;
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (!interactionRef.current.enabled) return;

      updatePointer(event);
      _particleRaycaster.setFromCamera(interactionRef.current.pointerNdc, camera);

      if (
        !_particleRaycaster.ray.intersectPlane(
          _particlePlane,
          interactionRef.current.rippleCenter
        )
      ) {
        _particleRaycaster.ray.at(8.5, _rippleFallback);
        interactionRef.current.rippleCenter.copy(_rippleFallback);
      }

      interactionRef.current.ripplePulse = 1;
    };

    syncEnabled();
    window.addEventListener("resize", syncEnabled);
    hoverMedia.addEventListener("change", syncEnabled);
    domElement.addEventListener("pointermove", handlePointerMove);
    domElement.addEventListener("pointerleave", handlePointerLeave);
    domElement.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.removeEventListener("resize", syncEnabled);
      hoverMedia.removeEventListener("change", syncEnabled);
      domElement.removeEventListener("pointermove", handlePointerMove);
      domElement.removeEventListener("pointerleave", handlePointerLeave);
      domElement.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [camera, gl, interactionRef]);

  return null;
}

function ParticleField({
  interactionRef,
}: {
  interactionRef: React.MutableRefObject<ParticleInteractionState>;
}) {
  const pointsRef = useRef<THREE.Points>(null!);
  const dataRef = useRef<ParticleData | null>(null);
  const mobileRef = useRef(false);

  useEffect(() => {
    const check = () => { mobileRef.current = window.innerWidth < 768; };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const data = useMemo(() => {
    const count =
      typeof window !== "undefined" && window.innerWidth < 768
        ? PARTICLE_COUNT_MOBILE
        : PARTICLE_COUNT_DESKTOP;

    return buildParticleData(count);
  }, []);

  useEffect(() => {
    dataRef.current = data;

    return () => {
      dataRef.current = null;
    };
  }, [data]);

  useEffect(() => {
    return () => {
      data.geometry.dispose();
    };
  }, [data]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uScrollFade: { value: 1.0 },
          uInsideBoost: { value: 0.0 },
          uFogNear: { value: 7.25 },
          uFogFar: { value: 30.0 },
          uFogStrength: { value: 0.45 },
          uFogColor: { value: FOG_COLOR_REST.clone() },
          uMobile: { value: 0.0 },
        },
        vertexShader: /* glsl */ `
          attribute float aSize;
          attribute float aInteract;
          varying vec3 vColor;
          varying float vDist;
          varying float vInteract;
          uniform float uInsideBoost;

          void main() {
            vColor = color;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vDist = -mv.z;
            vInteract = aInteract;
            float boost = mix(1.0, 1.18, uInsideBoost) * (1.0 + aInteract * 0.22);
            gl_PointSize = aSize * boost * (280.0 / max(-mv.z, 1.0));
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uScrollFade;
          uniform float uInsideBoost;
          uniform float uFogNear;
          uniform float uFogFar;
          uniform float uFogStrength;
          uniform vec3 uFogColor;
          uniform float uMobile;
          varying vec3 vColor;
          varying float vDist;
          varying float vInteract;

          void main() {
            float d = length(gl_PointCoord - vec2(0.5));
            if (d > 0.5) discard;
            float alpha = 1.0 - smoothstep(0.05, 0.5, d);
            float depthAlpha = clamp(1.0 / (1.0 + vDist * 0.06), 0.06, 0.48);
            float insideAlpha = mix(1.0, 1.18, uInsideBoost);
            float fogFactor = smoothstep(uFogNear, uFogFar, vDist) * uFogStrength;
            vec3 hoverColor = mix(vColor, vec3(1.0, 0.98, 0.92), vInteract * 0.18);
            vec3 foggedColor = mix(hoverColor, uFogColor, fogFactor * 0.35);
            float fogAlpha = 1.0 - fogFactor * 0.7;
            float glowDimmer = mix(1.0, 0.65, uMobile); // Reduce glow intensity on mobile
            gl_FragColor = vec4(
              foggedColor,
              alpha * depthAlpha * insideAlpha * fogAlpha * (1.0 + vInteract * 0.22) * uScrollFade * glowDimmer
            );
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
      }),
    []
  );

  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  useFrame(({ camera }, delta) => {
    const dataValue = dataRef.current;
    if (!dataValue) return;

    const { origins, velocities, seeds, depths, offsets, interaction, count } = dataValue;
    const posAttr = pointsRef.current.geometry.getAttribute("position") as THREE.BufferAttribute;
    const interactAttr = pointsRef.current.geometry.getAttribute("aInteract") as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    const dt = Math.min(delta, 0.1);
    const t = performance.now() * 0.001;
    const progress = scrollStore.progress;
    const insideBoost = THREE.MathUtils.smoothstep(progress, 0.28, 0.42);
    const interactionState = interactionRef.current;
    const canInteract = interactionState.enabled && interactionState.active;
    let rayOriginX = 0;
    let rayOriginY = 0;
    let rayOriginZ = 0;
    let rayDirX = 0;
    let rayDirY = 0;
    let rayDirZ = 0;

    if (canInteract) {
      _particleRaycaster.setFromCamera(interactionState.pointerNdc, camera);
      rayOriginX = _particleRaycaster.ray.origin.x;
      rayOriginY = _particleRaycaster.ray.origin.y;
      rayOriginZ = _particleRaycaster.ray.origin.z;
      rayDirX = _particleRaycaster.ray.direction.x;
      rayDirY = _particleRaycaster.ray.direction.y;
      rayDirZ = _particleRaycaster.ray.direction.z;
    }

    const rippleCenter = interactionState.rippleCenter;
    const ripplePulse = interactionState.ripplePulse;
    const rippleProgress = 1 - ripplePulse;
    const rippleRadius = THREE.MathUtils.lerp(0.2, 3.6, rippleProgress);
    const rippleWidth = 0.55;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const i4 = i * 4;
      const depth = depths[i];

      const isMobile = mobileRef.current;
      const speedScale = isMobile ? 0.45 : 1.0;
      const travelBoost = THREE.MathUtils.lerp(1, 1.25, insideBoost);
      origins[i3] += velocities[i3] * dt * 60 * travelBoost * speedScale;
      origins[i3 + 1] += velocities[i3 + 1] * dt * 60 * travelBoost * speedScale;
      origins[i3 + 2] += velocities[i3 + 2] * dt * 60 * travelBoost * speedScale;

      const ox = origins[i3];
      const oy = origins[i3 + 1];
      const oz = origins[i3 + 2] + 6.4;
      const dist = Math.sqrt(ox * ox + oy * oy + oz * oz);

      if (dist > 23) {
        const pull = (dist - 23) * 0.003;
        origins[i3] -= (ox / dist) * pull;
        origins[i3 + 1] -= (oy / dist) * pull;
        origins[i3 + 2] -= (oz / dist) * pull;
      }

      const freq = seeds[i4 + 3];
      const amp = THREE.MathUtils.lerp(0.18, 0.04, depth) * THREE.MathUtils.lerp(1, 1.15, insideBoost);
      const baseX = origins[i3] + Math.sin(t * 0.3 * freq + seeds[i4]) * amp;
      const baseY = origins[i3 + 1] + Math.cos(t * 0.25 * freq + seeds[i4 + 1]) * amp * 0.7;
      const baseZ = origins[i3 + 2] + Math.sin(t * 0.2 * freq + seeds[i4 + 2]) * amp * 0.5;

      let targetOffsetX = 0;
      let targetOffsetY = 0;
      let targetOffsetZ = 0;
      let targetInteract = 0;

      if (canInteract) {
        const toPointX = baseX - rayOriginX;
        const toPointY = baseY - rayOriginY;
        const toPointZ = baseZ - rayOriginZ;
        const alongRay = Math.max(
          0,
          toPointX * rayDirX + toPointY * rayDirY + toPointZ * rayDirZ
        );
        const closestX = rayOriginX + rayDirX * alongRay;
        const closestY = rayOriginY + rayDirY * alongRay;
        const closestZ = rayOriginZ + rayDirZ * alongRay;
        let diffX = baseX - closestX;
        let diffY = baseY - closestY;
        let diffZ = baseZ - closestZ;
        const distSq = diffX * diffX + diffY * diffY + diffZ * diffZ;
        const radius = THREE.MathUtils.lerp(1.7, 0.9, depth);

        if (distSq < radius * radius) {
          const dist = Math.sqrt(Math.max(distSq, 0.0001));
          const falloff = 1 - dist / radius;
          const eased = falloff * falloff * (3 - 2 * falloff);
          const repel = THREE.MathUtils.lerp(0.34, 0.12, depth);

          if (distSq < 0.0002) {
            diffX = 0.001 + Math.sin(seeds[i4]) * 0.01;
            diffY = Math.cos(seeds[i4 + 1]) * 0.01;
            diffZ = Math.sin(seeds[i4 + 2]) * 0.01;
          }

          const norm = 1 / Math.sqrt(diffX * diffX + diffY * diffY + diffZ * diffZ);
          targetOffsetX += diffX * norm * repel * eased;
          targetOffsetY += diffY * norm * repel * eased;
          targetOffsetZ += diffZ * norm * repel * eased;
          targetInteract = Math.max(targetInteract, eased);
        }
      }

      if (ripplePulse > 0.001) {
        const rippleX = baseX - rippleCenter.x;
        const rippleY = baseY - rippleCenter.y;
        const rippleZ = baseZ - rippleCenter.z;
        const rippleDist = Math.sqrt(
          rippleX * rippleX + rippleY * rippleY + rippleZ * rippleZ
        );
        const rippleDelta = rippleDist - rippleRadius;
        const rippleWave =
          Math.exp(-(rippleDelta * rippleDelta) / (2 * rippleWidth * rippleWidth)) *
          ripplePulse;

        if (rippleWave > 0.01 && rippleDist > 0.0001) {
          const rippleStrength = THREE.MathUtils.lerp(0.24, 0.1, depth) * rippleWave;
          targetOffsetX += (rippleX / rippleDist) * rippleStrength;
          targetOffsetY += (rippleY / rippleDist) * rippleStrength;
          targetOffsetZ += (rippleZ / rippleDist) * rippleStrength;
          targetInteract = Math.max(targetInteract, rippleWave * 0.8);
        }
      }

      offsets[i3] += (targetOffsetX - offsets[i3]) * 0.1;
      offsets[i3 + 1] += (targetOffsetY - offsets[i3 + 1]) * 0.1;
      offsets[i3 + 2] += (targetOffsetZ - offsets[i3 + 2]) * 0.1;
      interaction[i] += (targetInteract - interaction[i]) * 0.09;

      arr[i3] = baseX + offsets[i3];
      arr[i3 + 1] = baseY + offsets[i3 + 1];
      arr[i3 + 2] = baseZ + offsets[i3 + 2];
    }

    posAttr.needsUpdate = true;
    interactAttr.needsUpdate = true;

    if (interactionState.ripplePulse > 0.001) {
      interactionState.ripplePulse *= 0.92;
    } else if (interactionState.ripplePulse !== 0) {
      interactionState.ripplePulse = 0;
    }

    const scrollFade = 1 - THREE.MathUtils.smoothstep(progress, 0.86, 1.0);
    const fogNear = THREE.MathUtils.lerp(7.25, 4.8, insideBoost);
    const fogFar = THREE.MathUtils.lerp(30, 18.5, insideBoost);
    const shader = pointsRef.current.material as THREE.ShaderMaterial;
    shader.uniforms.uFogNear.value = fogNear;
    shader.uniforms.uFogFar.value = fogFar;
    shader.uniforms.uFogStrength.value = THREE.MathUtils.lerp(0.42, 0.62, insideBoost);
    shader.uniforms.uFogColor.value.copy(
      _fogColor.lerpColors(FOG_COLOR_REST, FOG_COLOR_INSIDE, insideBoost)
    );
    shader.uniforms.uScrollFade.value = scrollFade;
    shader.uniforms.uInsideBoost.value = insideBoost;
    shader.uniforms.uMobile.value = mobileRef.current ? 1.0 : 0.0;
  });

  return <points ref={pointsRef} geometry={data.geometry} material={material} />;
}

const EMISSIVE_REST = 0.16;
const EMISSIVE_HOVER = 0.35;
const EMISSIVE_PULSE = 0.75;
const HALO_REST = 0.12;
const HALO_HOVER = 0.20;
const HALO_PULSE = 0.35;
const SCALE_REST = 1.0;
const SCALE_HOVER = 1.12;
const SCALE_PULSE = 1.25;

type BackgroundTextConfig = {
  text: string;
  position: [number, number, number];
  rotation: [number, number, number];
  size: number;
  height: number;
  opacityRange: [number, number];
  driftSpeed: [number, number];
  driftAmount: [number, number];
  phase: number;
};

const BACKGROUND_TEXT_CONFIG: BackgroundTextConfig[] = [
  {
    text: "DIGITAL",
    position: [-9.8, 3.35, -24.5],
    rotation: [0.08, 0.42, -0.04],
    size: 1.42,
    height: 0.24,
    opacityRange: [0.02, 0.055],
    driftSpeed: [0.038, 0.027],
    driftAmount: [0.34, 0.18],
    phase: 0.4,
  },
  {
    text: "MOTION",
    position: [9.4, -3.1, -27.2],
    rotation: [-0.04, -0.46, 0.05],
    size: 1.08,
    height: 0.2,
    opacityRange: [0.016, 0.046],
    driftSpeed: [0.03, 0.023],
    driftAmount: [0.24, 0.14],
    phase: 2.1,
  },
  {
    text: "DEPTH",
    position: [-7.5, -4.4, -21.6],
    rotation: [0.05, 0.3, 0.02],
    size: 0.9,
    height: 0.18,
    opacityRange: [0.014, 0.038],
    driftSpeed: [0.027, 0.02],
    driftAmount: [0.2, 0.12],
    phase: 4.3,
  },
];

function BackgroundTextLayer() {
  const textRefs = useRef<Array<THREE.Mesh | null>>([]);

  const materials = useMemo(
    () =>
      BACKGROUND_TEXT_CONFIG.map(
        () =>
          new THREE.MeshStandardMaterial({
            color: new THREE.Color("#d6c39a"),
            emissive: new THREE.Color("#8c7241"),
            emissiveIntensity: 0.18,
            roughness: 0.6,
            metalness: 0.2,
            transparent: true,
            opacity: 0,
            depthWrite: false,
          })
      ),
    []
  );

  useEffect(() => {
    return () => {
      for (const material of materials) {
        material.dispose();
      }
    };
  }, [materials]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const progress = scrollStore.progress;
    const uiClearance = THREE.MathUtils.lerp(
      0.42,
      1,
      THREE.MathUtils.smoothstep(progress, 0.06, 0.18)
    );
    const endFade = 1 - THREE.MathUtils.smoothstep(progress, 0.84, 1.0);

    BACKGROUND_TEXT_CONFIG.forEach((config, index) => {
      const mesh = textRefs.current[index];
      const material = materials[index];

      if (!mesh) return;

      mesh.position.x =
        config.position[0] +
        Math.sin(t * config.driftSpeed[0] + config.phase) * config.driftAmount[0];
      mesh.position.y =
        config.position[1] +
        Math.cos(t * config.driftSpeed[1] + config.phase) * config.driftAmount[1];
      mesh.position.z = config.position[2] + Math.sin(t * 0.018 + config.phase) * 0.22;

      const pulse = 0.5 + 0.5 * Math.sin(t * 0.12 + config.phase);
      const targetOpacity =
        THREE.MathUtils.lerp(
          config.opacityRange[0],
          config.opacityRange[1],
          pulse
        ) *
        uiClearance *
        endFade;

      material.opacity += (targetOpacity - material.opacity) * 0.035;
    });
  });

  return (
    <group>
      {BACKGROUND_TEXT_CONFIG.map((config, index) => (
        <group
          key={config.text}
          rotation={config.rotation}
          position={config.position}
        >
          <Center>
            <Text3D
              ref={(mesh) => {
                textRefs.current[index] = mesh;
              }}
              font={helvetikerFont as any}
              size={config.size}
              height={config.height}
              curveSegments={10}
              bevelEnabled
              bevelSegments={3}
              bevelThickness={0.02}
              bevelSize={0.01}
              smooth={0.4}
              material={materials[index]}
            >
              {config.text}
            </Text3D>
          </Center>
        </group>
      ))}
    </group>
  );
}

function HeroObject() {
  const groupRef = useRef<THREE.Group>(null!);
  const hovered = useRef(false);
  const pulse = useRef(0);
  const materialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const haloMaterialRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const mobileRef = useRef(false);

  useEffect(() => {
    const check = () => { mobileRef.current = window.innerWidth < 768; };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#8a7550"),
        metalness: 0.92,
        roughness: 0.32,
        clearcoat: 0.18,
        clearcoatRoughness: 0.36,
        reflectivity: 0.55,
        envMapIntensity: 0.7,
        emissive: new THREE.Color("#d4af37"),
        emissiveIntensity: EMISSIVE_REST,
      }),
    []
  );

  const haloMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#d4af37",
        wireframe: true,
        transparent: true,
        opacity: HALO_REST,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  useEffect(() => {
    materialRef.current = material;
    haloMaterialRef.current = haloMaterial;
    return () => {
      material.dispose();
      haloMaterial.dispose();
    };
  }, [material, haloMaterial]);

  const onPointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!mobileRef.current) {
      hovered.current = true;
      document.body.style.cursor = "pointer";
    }
  }, []);

  const onPointerOut = useCallback(() => {
    if (!mobileRef.current) {
      hovered.current = false;
      document.body.style.cursor = "";
    }
  }, []);

  const onPointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    pulse.current = 1;
  }, []);

  useFrame(({ clock }) => {
    const meshMaterial = materialRef.current;
    const ringMaterial = haloMaterialRef.current;
    if (!meshMaterial || !ringMaterial) return;

    const t = clock.getElapsedTime();
    const progress = scrollStore.progress;
    const tunnelProgress = THREE.MathUtils.smoothstep(progress, 0.08, 0.36);
    const insideProgress = THREE.MathUtils.smoothstep(progress, 0.3, 0.44);
    const isMobile = mobileRef.current;

    groupRef.current.rotation.y = t * (isMobile ? 0.04 : 0.08) + tunnelProgress * (isMobile ? 0.09 : 0.18);
    groupRef.current.rotation.x = Math.sin(t * (isMobile ? 0.11 : 0.22)) * 0.05 * (1 - insideProgress);
    groupRef.current.position.y = Math.sin(t * (isMobile ? 0.22 : 0.45)) * 0.06 * (1 - insideProgress * 0.75);

    pulse.current *= 0.92;
    if (pulse.current < 0.005) pulse.current = 0;
    const p = pulse.current;

    const baseScale = THREE.MathUtils.lerp(1, 1.3, tunnelProgress) * (isMobile ? 1.03 : 1.1); // More engaging on all screen sizes
    
    // Tap interaction effect reduction on mobile
    const currentHoverScale = isMobile ? SCALE_REST : SCALE_HOVER;
    const currentPulseScale = isMobile ? 1.08 : SCALE_PULSE;
    
    const interactionScale =
      p > 0
        ? THREE.MathUtils.lerp(currentHoverScale, currentPulseScale, p)
        : hovered.current
          ? currentHoverScale
          : SCALE_REST;
    const scaleTarget = baseScale * interactionScale;

    const emissiveBase = THREE.MathUtils.lerp(EMISSIVE_REST, 0.14, tunnelProgress);
    const targetEmHover = isMobile ? emissiveBase : EMISSIVE_HOVER;
    const targetEmPulse = isMobile ? EMISSIVE_HOVER : EMISSIVE_PULSE;
    const emTarget =
      p > 0
        ? THREE.MathUtils.lerp(targetEmHover, targetEmPulse, p)
        : hovered.current
          ? targetEmHover
          : emissiveBase;

    const haloBase = THREE.MathUtils.lerp(HALO_REST, 0.13, tunnelProgress);
    const targetHaloHover = isMobile ? haloBase : HALO_HOVER;
    const targetHaloPulse = isMobile ? HALO_HOVER : HALO_PULSE;
    const haloTarget =
      p > 0
        ? THREE.MathUtils.lerp(targetHaloHover, targetHaloPulse, p)
        : hovered.current
          ? targetHaloHover
          : haloBase;

    meshMaterial.emissiveIntensity += (emTarget - meshMaterial.emissiveIntensity) * 0.08;
    ringMaterial.opacity += (haloTarget - ringMaterial.opacity) * 0.08;

    const s = groupRef.current.scale.x;
    groupRef.current.scale.setScalar(s + (scaleTarget - s) * 0.08);
  });

  return (
    <group ref={groupRef}>
      <mesh
        material={material}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        onPointerDown={onPointerDown}
      >
        <torusKnotGeometry args={[1, 0.35, 220, 36, 2, 3]} />
      </mesh>
      <mesh material={haloMaterial}>
        <torusKnotGeometry args={[1.03, 0.37, 110, 18, 2, 3]} />
      </mesh>
    </group>
  );
}

function AtmosphereRig() {
  const ambientRef = useRef<THREE.AmbientLight>(null!);
  const keyLightRef = useRef<THREE.DirectionalLight>(null!);
  const rimLightRef = useRef<THREE.DirectionalLight>(null!);
  const fillLightRef = useRef<THREE.PointLight>(null!);
  const fogRef = useRef<THREE.Fog>(null!);
  const mobileRef = useRef(false);

  useEffect(() => {
    const check = () => { mobileRef.current = window.innerWidth < 768; };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useFrame(() => {
    const progress = scrollStore.progress;
    const insideProgress = THREE.MathUtils.smoothstep(progress, 0.28, 0.42);
    const isMobile = mobileRef.current;
    const lightScale = isMobile ? 0.75 : 1.0;

    fogRef.current.color.copy(_fogColor.lerpColors(FOG_COLOR_REST, FOG_COLOR_INSIDE, insideProgress));
    fogRef.current.near = THREE.MathUtils.lerp(7.25, 4.8, insideProgress);
    fogRef.current.far = THREE.MathUtils.lerp(30, 18.5, insideProgress);

    ambientRef.current.intensity = THREE.MathUtils.lerp(0.26, 0.16, insideProgress) * lightScale;
    keyLightRef.current.intensity = THREE.MathUtils.lerp(1.35, 0.82, insideProgress) * lightScale;
    rimLightRef.current.intensity = THREE.MathUtils.lerp(0.78, 0.42, insideProgress) * lightScale;
    fillLightRef.current.intensity = THREE.MathUtils.lerp(0.18, 0.08, insideProgress) * lightScale;
  });

  return (
    <>
      <fog ref={fogRef} attach="fog" args={[FOG_COLOR_REST, 7.25, 30]} />
      <ambientLight ref={ambientRef} intensity={0.26} color="#d4c9a8" />
      <directionalLight ref={keyLightRef} position={[4, 5, 4]} intensity={1.35} color="#fff5e6" />
      <directionalLight ref={rimLightRef} position={[-4, 2, -4]} intensity={0.78} color="#d4af37" />
      <pointLight
        ref={fillLightRef}
        position={[0, -3, 2]}
        intensity={0.18}
        color="#b8976a"
        distance={10}
        decay={2}
      />
    </>
  );
}

export default function Scene() {
  const interactionRef = useRef<ParticleInteractionState>({
    enabled: false,
    active: false,
    pointerNdc: new THREE.Vector2(),
    rippleCenter: new THREE.Vector3(999, 999, 999),
    ripplePulse: 0,
  });

  const [dpr, setDpr] = useState<[number, number]>([1, 2]);

  useEffect(() => {
    const handleResize = () => setDpr(window.innerWidth < 768 ? [1, 1.5] : [1, 2]);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0.65, 6.4], fov: 40 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
      dpr={dpr}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "auto",
      }}
    >
      <AtmosphereRig />
      <CameraRig />
      <ParticleInteractionController interactionRef={interactionRef} />
      <ParticleField interactionRef={interactionRef} />
      <Suspense fallback={null}>
        <BackgroundTextLayer />
      </Suspense>
      <HeroObject />

      <GlassPanel
        position={[-3, 0.2, -3]}
        rotation={[0, 0.25, 0]}
        width={3}
        height={2.2}
        visibleRange={[0.46, 0.64]}
        title="About"
        subtitle="MERN Stack Developer"
        body="Passionate about building responsive, performant web applications with clean architecture and practical UI thinking."
      />
      <GlassPanel
        position={[3, -0.1, -7]}
        rotation={[0, -0.3, 0]}
        width={2.8}
        height={2.6}
        visibleRange={[0.6, 0.8]}
        title="Skills"
        subtitle="Core Technologies"
        items={["React.js / Next.js", "Node.js / Express.js", "MongoDB / PostgreSQL", "Tailwind CSS", "Git / Postman"]}
      />
      <GlassPanel
        position={[-2.5, -0.4, -11]}
        rotation={[0, 0.2, 0]}
        width={3.2}
        height={2.4}
        visibleRange={[0.78, 0.94]}
        title="Projects"
        subtitle="Featured Work"
        items={["TimeVault", "Flower Shop Website", "Responsive MERN Projects"]}
      />
    </Canvas>
  );
}
