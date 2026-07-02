import { listBrandSlugs } from "@/lib/fs-paths";

export interface Brand {
  slug: string;
  displayName: string;
  color: string;
}

/**
 * Deliberately avoids the hues reserved for semantic meaning elsewhere in
 * the UI (blue/green = scheduled/posted, purple = repost, gray = draft,
 * amber/red = warning/danger — see lib/theme/status-colors.ts) so a brand's
 * accent color is never mistaken for a status or alert signal.
 *
 * Every entry maintains at least a 4.5:1 contrast ratio against white
 * (spec FR-018), whether used as text-on-white (BrandTag) or as
 * white-text-on-color (BrandFilterPill's active state) — verified during
 * Polish (tasks.md T028).
 */
const PALETTE = [
  "#4f46e5", // indigo-600 (6.29:1)
  "#0e7490", // cyan-700 (5.36:1)
  "#0f766e", // teal-700 (5.47:1)
  "#4d7c0f", // lime-700 (4.99:1)
  "#c2410c", // orange-700 (5.18:1)
  "#e11d48", // rose-600 (4.70:1)
  "#db2777", // pink-600 (4.60:1)
  "#c026d3", // fuchsia-600 (4.71:1)
  "#4338ca", // indigo-700 (7.90:1)
  "#115e59", // teal-800 (7.58:1)
  "#9a3412", // orange-800 (7.31:1)
  "#9d174d", // pink-800 (7.88:1)
  "#155e75", // cyan-800 (7.27:1)
  "#86198f", // fuchsia-800 (8.24:1)
  "#3f6212", // lime-800 (7.08:1)
  "#9f1239", // rose-800 (8.02:1)
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
