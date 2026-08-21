import type { ReactNode } from "react";

type GlassPanelProps = {
  children: ReactNode;
  className?: string;
};

export function GlassPanel({ children, className = "" }: GlassPanelProps) {
  return (
    <div
      className={`rounded-2xl border border-line bg-void-3/65 backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}
