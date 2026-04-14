"use client";

import { useRef, useEffect, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
 * MagneticButton — premium hover interaction for DOM buttons / links
 *
 * On desktop, the element smoothly pulls toward the cursor while hovered
 * (0.3× offset from center) and springs back on leave. A soft gold glow
 * fades in on hover. Uses direct DOM manipulation — zero React re-renders
 * during animation.
 *
 * On mobile (< 768px), all effects are disabled — the component renders
 * as a plain wrapper.
 * ═══════════════════════════════════════════════════════════════════════ */

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
}

export default function MagneticButton({
  children,
  className = "",
  href,
  type = "button",
  onClick,
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement>(null);
  const isDesktop = useRef(false);

  useEffect(() => {
    isDesktop.current = window.innerWidth >= 768;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDesktop.current || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    ref.current.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    ref.current.style.boxShadow =
      "0 0 25px rgba(212,175,55,0.18), 0 0 60px rgba(212,175,55,0.06)";
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transform = "translate(0, 0)";
    ref.current.style.boxShadow = "none";
  }, []);

  const style: React.CSSProperties = {
    display: "inline-block",
    transition:
      "transform 0.45s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.4s ease",
    willChange: "transform",
  };

  const props = {
    ref: ref as any,
    className,
    style,
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
    onClick,
  };

  if (href) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} {...props}>
      {children}
    </button>
  );
}
