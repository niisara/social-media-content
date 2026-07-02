import fs from "node:fs";
import path from "node:path";

export const CONTENT_ROOT = path.join(process.cwd(), "content");

/** Brand slugs are directory names directly under content/. */
export function listBrandSlugs(): string[] {
  if (!fs.existsSync(CONTENT_ROOT)) return [];
  return fs
    .readdirSync(CONTENT_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

export function manifestPathFor(brandSlug: string): string {
  return path.join(CONTENT_ROOT, brandSlug, "manifest.yaml");
}

export function contentFilePathFor(contentId: string): string {
  return path.join(CONTENT_ROOT, contentId);
}
