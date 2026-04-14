import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export default function GlassCard({ children, className = "", ...props }: GlassCardProps) {
  return (
    <div 
      className={`glass-panel p-6 sm:p-8 shadow-xl shadow-black/40 hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-500 ease-out ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
