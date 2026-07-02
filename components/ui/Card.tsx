import type { CSSProperties, ReactNode } from "react";

interface CardProps {
  /** Sets --brand-color and renders a left-border accent (research.md Decision 2). */
  brandColor?: string;
  /** Lower-emphasis variant for the unscheduled bucket (spec FR-015). */
  muted?: boolean;
  className?: string;
  children: ReactNode;
}

export function Card({ brandColor, muted, className, children }: CardProps) {
  const style = brandColor ? ({ "--brand-color": brandColor } as CSSProperties) : undefined;

  const borderClasses = brandColor
    ? "border-t border-r border-b border-l-4 border-gray-200 border-l-[var(--brand-color)]"
    : "border border-gray-200";

  return (
    <div
      style={style}
      className={[
        "rounded-lg p-3 transition-shadow",
        borderClasses,
        muted ? "bg-gray-50" : "bg-white shadow-sm hover:shadow-md",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
