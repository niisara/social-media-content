import type { ManifestEntry } from "@/lib/manifest/manifest-schema";
import { InvalidTransitionError } from "@/lib/errors";

/** draft -> scheduled (spec FR-006/FR-007/FR-009). Caller has already validated scheduledAt/timezone are present. */
export function applyScheduledTransition(
  entry: ManifestEntry,
  scheduledAt: string,
  timezone: string,
): ManifestEntry {
  if (entry.status !== "draft") {
    throw new InvalidTransitionError(entry.status, "scheduled");
  }
  return { ...entry, status: "scheduled", scheduledAt, timezone };
}

/** scheduled -> posted (spec FR-008/FR-009). */
export function applyPostedTransition(entry: ManifestEntry): ManifestEntry {
  if (entry.status !== "scheduled") {
    throw new InvalidTransitionError(entry.status, "posted");
  }
  return { ...entry, status: "posted" };
}
