import type { ManifestStatus } from "@/lib/manifest/manifest-schema";

/**
 * Fixed, semantic lifecycle-status colors (spec: draft=neutral,
 * scheduled=blue, posted=green). Defined once here so no component ever
 * hand-picks a status color independently (mirrors the brand-color
 * centralization in lib/schedule/list-brands.ts).
 */
export const STATUS_STYLES: Record<ManifestStatus, { label: string; className: string }> = {
  draft: {
    label: "Draft",
    className: "bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-300",
  },
  scheduled: {
    label: "Scheduled",
    className: "bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-300",
  },
  posted: {
    label: "Posted",
    className: "bg-green-100 text-green-700 ring-1 ring-inset ring-green-300",
  },
};

/** Repost indicator (spec: reposted=purple) — a badge shown alongside, never instead of, StatusChip. */
export const REPOST_BADGE_STYLE = {
  label: "Repost",
  className: "bg-purple-100 text-purple-700 ring-1 ring-inset ring-purple-300",
};
