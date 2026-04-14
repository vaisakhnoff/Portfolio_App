"use client";

import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import LoadingScreen from "@/components/LoadingScreen";

const MIN_VISIBLE_MS = 1100;

export default function InitialLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const start = performance.now();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    let finished = false;

    const closeWhenReady = () => {
      if (finished) return;
      finished = true;

      const elapsed = performance.now() - start;
      const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);

      window.setTimeout(() => {
        setVisible(false);
        document.body.style.overflow = previousOverflow;
      }, remaining);
    };

    if (document.readyState === "complete") {
      closeWhenReady();
    } else {
      window.addEventListener("load", closeWhenReady, { once: true });
    }

    const fallback = window.setTimeout(closeWhenReady, 3500);

    return () => {
      window.clearTimeout(fallback);
      window.removeEventListener("load", closeWhenReady);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return <AnimatePresence>{visible ? <LoadingScreen /> : null}</AnimatePresence>;
}
