import { listCharacterSlugs } from "@/lib/fs-paths";

export interface Character {
  /** Exact folder name under character/ — the stable value / file-path key. */
  slug: string;
  /** Human-readable form of the slug (hyphens/underscores → spaces, title-cased). */
  label: string;
}

/**
 * Discovers every character under character/, derived at call time from the
 * folder names (no hardcoded list). Non-directory entries are excluded by
 * listCharacterSlugs. Sorted ascending by display label.
 */
export function listCharacters(): Character[] {
  return listCharacterSlugs()
    .map((slug) => ({ slug, label: slugToLabel(slug) }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function slugToLabel(slug: string): string {
  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word[0]!.toUpperCase() + word.slice(1))
    .join(" ");
}
