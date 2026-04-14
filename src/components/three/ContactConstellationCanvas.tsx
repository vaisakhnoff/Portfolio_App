"use client";

import dynamic from "next/dynamic";
import type { MotionValue } from "framer-motion";
import type { MutableRefObject } from "react";

type ContactConstellationCanvasProps = {
  revealProgress: MotionValue<number>;
  exitProgress: MotionValue<number>;
  interactive: boolean;
  pointerRef: MutableRefObject<{ x: number; y: number }>;
};

const ContactConstellationScene = dynamic(
  () => import("@/components/three/ContactConstellationScene"),
  {
    ssr: false,
    loading: () => null,
  }
);

export default function ContactConstellationCanvas(
  props: ContactConstellationCanvasProps
) {
  return <ContactConstellationScene {...props} />;
}
