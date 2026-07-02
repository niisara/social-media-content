import type { Brand } from "@/lib/schedule/list-brands";
import { BrandFilterPill } from "@/components/ui/BrandFilterPill";

interface BrandFilterProps {
  brands: Brand[];
  activeBrand?: string;
  view: string;
  offset: number;
}

export function BrandFilter({ brands, activeBrand, view, offset }: BrandFilterProps) {
  const baseParams = { view, offset: String(offset) };

  return (
    <div className="flex flex-wrap gap-2">
      <BrandFilterPill
        label="All brands"
        active={!activeBrand}
        href={`/?${new URLSearchParams(baseParams).toString()}`}
      />
      {brands.map((brand) => (
        <BrandFilterPill
          key={brand.slug}
          label={brand.displayName}
          color={brand.color}
          active={activeBrand === brand.slug}
          href={`/?${new URLSearchParams({ ...baseParams, brand: brand.slug }).toString()}`}
        />
      ))}
    </div>
  );
}
