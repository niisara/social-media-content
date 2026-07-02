import fs from "node:fs";
import matter from "gray-matter";
import { CONTENT_ROOT, contentFilePathFor, listBrandSlugs } from "@/lib/fs-paths";
import { ContentFrontmatterSchema, type ContentItem } from "./content-schema";

export type ContentReadResult =
  | { ok: true; item: ContentItem }
  | { ok: false; contentId: string; reason: string };

/** Reads and validates one content file fresh from disk (spec FR-005/FR-005a — no caching). */
export function readContentItem(contentId: string): ContentReadResult {
  const brand = contentId.split("/")[0] ?? "";
  const filePath = contentFilePathFor(contentId);

  if (!filePath.startsWith(CONTENT_ROOT)) {
    return { ok: false, contentId, reason: "Content ID resolves outside the content directory" };
  }

  let raw: string;
  try {
    raw = fs.readFileSync(filePath, "utf8");
  } catch {
    return { ok: false, contentId, reason: "File not found on disk" };
  }

  let parsed: matter.GrayMatterFile<string>;
  try {
    parsed = matter(raw);
  } catch {
    return { ok: false, contentId, reason: "Could not parse frontmatter" };
  }

  const result = ContentFrontmatterSchema.safeParse(parsed.data);
  if (!result.success) {
    return { ok: false, contentId, reason: `Invalid frontmatter: ${result.error.message}` };
  }

  const frontmatter = result.data;
  if (frontmatter.id !== contentId) {
    return {
      ok: false,
      contentId,
      reason: `Frontmatter id "${frontmatter.id}" does not match file location "${contentId}"`,
    };
  }

  return {
    ok: true,
    item: {
      id: frontmatter.id,
      brand,
      caption: frontmatter.caption,
      hashtags: frontmatter.hashtags,
      media: frontmatter.media,
      platforms: frontmatter.platforms,
    },
  };
}

/** Lists every content file's ID (relative path) for one brand, or all brands if omitted. */
export function listContentFileIds(brandSlug?: string): string[] {
  const brands = brandSlug ? [brandSlug] : listBrandSlugs();
  const ids: string[] = [];
  for (const brand of brands) {
    const brandDir = contentFilePathFor(brand);
    if (!fs.existsSync(brandDir)) continue;
    for (const entry of fs.readdirSync(brandDir, { withFileTypes: true })) {
      if (entry.isFile() && entry.name.endsWith(".md")) {
        ids.push(`${brand}/${entry.name}`);
      }
    }
  }
  return ids;
}
