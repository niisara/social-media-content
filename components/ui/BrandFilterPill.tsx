import Link from "next/link";
import type { CSSProperties } from "react";

interface BrandFilterPillProps {
  label: string;
  /** Omit for the neutral "All brands" pill. */
  color?: string;
  active: boolean;
  href: string;
}

/** Clearly distinguished active vs. inactive state, using the brand's own accent color (spec FR-013). */
export function BrandFilterPill({ label, color, active, href }: BrandFilterPillProps) {
  const style = color ? ({ "--brand-color": color } as CSSProperties) : undefined;

  const activeClasses = color
    ? "bg-[var(--brand-color)] text-white border-[var(--brand-color)]"
    : "bg-gray-900 text-white border-gray-900";

  const inactiveClasses = color
    ? "border-[var(--brand-color)] text-[var(--brand-color)] bg-white hover:bg-gray-50"
    : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50";

  return (
    <Link
      href={href}
      style={style}
      className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
        active ? activeClasses : inactiveClasses
      }`}
    >
      {label}
    </Link>
  );
}
