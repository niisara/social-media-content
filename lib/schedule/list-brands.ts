import { listBrandSlugs } from "@/lib/fs-paths";

export interface Brand {
  slug: string;
  displayName: string;
  color: string;
}

const PALETTE = [
  "#2563eb",
  "#dc2626",
  "#16a34a",
  "#d97706",
  "#7c3aed",
  "#0891b2",
  "#db2777",
  "#65a30d",
  "#ea580c",
  "#4f46e5",
];

/** Discovers every brand under content/ (contracts/scheduling-functions.md: listBrands). */
export function listBrands(): Brand[] {
  return listBrandSlugs().map((slug) => ({
    slug,
    displayName: slugToDisplayName(slug),
    color: colorForSlug(slug),
  }));
}

function slugToDisplayName(slug: string): string {
  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word[0]!.toUpperCase() + word.slice(1))
    .join(" ");
}

/** Deterministic per slug, so the same brand always gets the same color regardless of read order. */
function colorForSlug(slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length]!;
}
