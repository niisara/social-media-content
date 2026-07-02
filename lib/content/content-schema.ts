import { z } from "zod";

// Frontmatter for a single content markdown file (data-model.md: Content Item).
// `status` is informational only — the manifest is the authoritative lifecycle
// source (see research.md Decision 3). It is never read by the app for display.
export const ContentFrontmatterSchema = z.object({
  id: z.string().min(1),
  caption: z.string().min(1),
  hashtags: z.array(z.string()).default([]),
  media: z.array(z.string()).default([]),
  platforms: z.array(z.string()).min(1),
  status: z.string().optional(),
});

export type ContentFrontmatter = z.infer<typeof ContentFrontmatterSchema>;

export interface ContentItem {
  id: string;
  brand: string;
  caption: string;
  hashtags: string[];
  media: string[];
  platforms: string[];
}
