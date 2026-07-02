import { readManifest } from "@/lib/manifest/read-manifest";
import type { ManifestStatus } from "@/lib/manifest/manifest-schema";
import { readContentItem } from "@/lib/content/read-content-item";
import { EntryNotFoundError } from "@/lib/errors";

export interface ItemDetail {
  entryId: string;
  contentId: string;
  brand: string;
  status: ManifestStatus;
  scheduledAt?: string;
  timezone?: string;
  repostOf?: string;
  brokenReference: boolean;
  caption?: string;
  hashtags?: string[];
  media?: string[];
  platforms?: string[];
}

export { EntryNotFoundError };

/** contracts/scheduling-functions.md: getItemDetail. Always reads fresh (spec FR-005/FR-005a). */
export function getItemDetail(entryId: string, brandSlug: string): ItemDetail {
  const { entries } = readManifest(brandSlug);
  const entry = entries.find((candidate) => candidate.entryId === entryId);

  if (!entry) {
    throw new EntryNotFoundError(brandSlug, entryId);
  }

  const contentResult = readContentItem(entry.contentId);

  return {
    entryId: entry.entryId,
    contentId: entry.contentId,
    brand: brandSlug,
    status: entry.status,
    scheduledAt: entry.scheduledAt,
    timezone: entry.timezone,
    repostOf: entry.repostOf,
    brokenReference: !contentResult.ok,
    caption: contentResult.ok ? contentResult.item.caption : undefined,
    hashtags: contentResult.ok ? contentResult.item.hashtags : undefined,
    media: contentResult.ok ? contentResult.item.media : undefined,
    platforms: contentResult.ok ? contentResult.item.platforms : undefined,
  };
}
