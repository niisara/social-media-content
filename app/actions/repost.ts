"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { readManifest } from "@/lib/manifest/read-manifest";
import { appendManifestEntry } from "@/lib/manifest/write-manifest";
import { readContentItem } from "@/lib/content/read-content-item";
import { isValidTimezone } from "@/lib/timezone";

/** contracts/scheduling-functions.md: createRepost (spec FR-012–FR-015). */
export async function createRepostAction(formData: FormData): Promise<void> {
  const brand = String(formData.get("brand") ?? "");
  const originalEntryId = String(formData.get("originalEntryId") ?? "");
  const originalContentId = String(formData.get("originalContentId") ?? "");
  const scheduledAt = String(formData.get("scheduledAt") ?? "").trim();
  const timezone = String(formData.get("timezone") ?? "").trim();

  let errorCode: string | null = null;
  let newEntryId: string | null = null;

  if (!scheduledAt || !timezone) {
    errorCode = "missing-schedule-fields";
  } else if (!isValidTimezone(timezone)) {
    errorCode = "invalid-timezone";
  } else if (!readContentItem(originalContentId).ok) {
    errorCode = "content-not-found";
  } else {
    const { entries } = readManifest(brand);
    const original = entries.find((entry) => entry.entryId === originalEntryId);

    if (!original || original.status !== "posted") {
      errorCode = "original-not-posted";
    } else {
      newEntryId = `${originalEntryId}-repost-${Date.now()}`;
      appendManifestEntry(brand, {
        entryId: newEntryId,
        contentId: originalContentId,
        status: "scheduled",
        scheduledAt,
        timezone,
        repostOf: originalContentId,
      });
    }
  }

  revalidatePath("/");
  revalidatePath(`/items/${originalEntryId}`);

  if (errorCode || !newEntryId) {
    redirect(`/items/${originalEntryId}?brand=${brand}&error=${errorCode ?? "repost-failed"}`);
  }

  revalidatePath(`/items/${newEntryId}`);
  redirect(`/items/${newEntryId}?brand=${brand}`);
}
