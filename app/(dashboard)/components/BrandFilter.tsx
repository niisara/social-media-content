import Link from "next/link";
import type { Brand } from "@/lib/schedule/list-brands";

interface BrandFilterProps {
  brands: Brand[];
  activeBrand?: string;
  view: string;
  offset: number;
}

export function BrandFilter({ brands, activeBrand, view, offset }: BrandFilterProps) {
  const baseParams = { view, offset: String(offset) };

  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
      <Link
        href={`/?${new URLSearchParams(baseParams).toString()}`}
        style={{
          padding: "0.3rem 0.7rem",
          borderRadius: 999,
          border: "1px solid var(--color-border)",
          background: !activeBrand ? "#111" : "transparent",
          color: !activeBrand ? "#fff" : "inherit",
          textDecoration: "none",
          fontSize: "0.85rem",
        }}
      >
        All brands
      </Link>
      {brands.map((brand) => {
        const isActive = activeBrand === brand.slug;
        return (
          <Link
            key={brand.slug}
            href={`/?${new URLSearchParams({ ...baseParams, brand: brand.slug }).toString()}`}
            style={{
              padding: "0.3rem 0.7rem",
              borderRadius: 999,
              border: `1px solid ${brand.color}`,
              background: isActive ? brand.color : "transparent",
              color: isActive ? "#fff" : "inherit",
              textDecoration: "none",
              fontSize: "0.85rem",
            }}
          >
            {brand.displayName}
          </Link>
        );
      })}
    </div>
  );
}
