import type { CSSProperties } from "react";
import type { Brand } from "@/lib/schedule/list-brands";

interface BrandTagProps {
  brand: Pick<Brand, "displayName" | "color">;
}

/** The one place a brand's color-to-swatch mapping is rendered (spec FR-001, FR-002). */
export function BrandTag({ brand }: BrandTagProps) {
  const style = { "--brand-color": brand.color } as CSSProperties;

  return (
    <span
      style={style}
      className="inline-flex min-w-0 items-center gap-1.5 text-xs font-semibold text-[var(--brand-color)]"
    >
      <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-[var(--brand-color)]" />
      <span className="max-w-32 truncate" title={brand.displayName}>
        {brand.displayName}
      </span>
    </span>
  );
}
