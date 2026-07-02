import { listBrandSlugs } from "@/lib/fs-paths";
import { readManifest } from "@/lib/manifest/read-manifest";
import type { ManifestStatus } from "@/lib/manifest/manifest-schema";
import { listContentFileIds, readContentItem } from "@/lib/content/read-content-item";
import { scheduledCalendarDate, isDateWithinRange, type DateRange } from "@/lib/timezone";

export interface ManifestEntrySummary {
  entryId: string;
  contentId: string;
  brand: string;
  status: ManifestStatus;
  scheduledAt?: string;
  timezone?: string;
  repostOf?: string;
  brokenReference: boolean;
  /** Short preview of the content's caption, when the file resolves; display convenience only. */
  captionPreview?: string;
}

export interface ContentItemSummary {
  contentId: string;
  brand: string;
}

export interface ScheduleView {
  scheduled: ManifestEntrySummary[];
  unscheduled: ManifestEntrySummary[];
  untrackedContent: ContentItemSummary[];
  duplicateContentIds: string[];
}

/**
 * Answers "what's scheduled for date X" using manifest data alone (spec FR-019):
 * the scheduled/unscheduled classification and date grouping below only ever
 * read `scheduledAt`/`timezone` from the manifest. Content files are opened
 * only to flag broken references (FR-020), a separate, secondary concern.
 */
export function getScheduleForRange(range: DateRange, brandSlug?: string): ScheduleView {
  const brands = brandSlug ? [brandSlug] : listBrandSlugs();

  const scheduled: ManifestEntrySummary[] = [];
  const unscheduled: ManifestEntrySummary[] = [];
  const untrackedContent: ContentItemSummary[] = [];
  const nonRepostOwnerCounts = new Map<string, number>();

  for (const brand of brands) {
    const { entries } = readManifest(brand);
    const trackedContentIds = new Set<string>();

    for (const entry of entries) {
      trackedContentIds.add(entry.contentId);

      if (!entry.repostOf) {
        nonRepostOwnerCounts.set(entry.contentId, (nonRepostOwnerCounts.get(entry.contentId) ?? 0) + 1);
      }

      const contentResult = readContentItem(entry.contentId);

      const summary: ManifestEntrySummary = {
        entryId: entry.entryId,
        contentId: entry.contentId,
        brand,
        status: entry.status,
        scheduledAt: entry.scheduledAt,
        timezone: entry.timezone,
        repostOf: entry.repostOf,
        brokenReference: !contentResult.ok,
        captionPreview: contentResult.ok ? truncate(contentResult.item.caption, 80) : undefined,
      };

      if (entry.status === "draft" || !entry.scheduledAt || !entry.timezone) {
        unscheduled.push(summary);
        continue;
      }

      const calendarDate = scheduledCalendarDate(entry.scheduledAt, entry.timezone);
      if (calendarDate && isDateWithinRange(calendarDate, range)) {
        scheduled.push(summary);
      }
    }

    for (const contentId of listContentFileIds(brand)) {
      if (!trackedContentIds.has(contentId)) {
        untrackedContent.push({ contentId, brand });
      }
    }
  }

  const duplicateContentIds = [...nonRepostOwnerCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([contentId]) => contentId);

  return { scheduled, unscheduled, untrackedContent, duplicateContentIds };
}

function truncate(text: string, maxLength: number): string {
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}
