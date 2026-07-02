"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { updateManifestEntry, EntryNotFoundError } from "@/lib/manifest/write-manifest";
import { isValidTimezone } from "@/lib/timezone";
import { InvalidTransitionError } from "@/lib/errors";
import { applyPostedTransition, applyScheduledTransition } from "@/lib/schedule/transitions";

/** contracts/scheduling-functions.md: transitionToScheduled (spec FR-006, FR-007). */
export async function transitionToScheduledAction(formData: FormData): Promise<void> {
  const brand = String(formData.get("brand") ?? "");
  const entryId = String(formData.get("entryId") ?? "");
  const scheduledAt = String(formData.get("scheduledAt") ?? "").trim();
  const timezone = String(formData.get("timezone") ?? "").trim();

  let errorCode: string | null = null;

  if (!scheduledAt || !timezone) {
    errorCode = "missing-schedule-fields";
  } else if (!isValidTimezone(timezone)) {
    errorCode = "invalid-timezone";
  } else {
    try {
      updateManifestEntry(brand, entryId, (entry) =>
        applyScheduledTransition(entry, scheduledAt, timezone),
      );
    } catch (error) {
      if (error instanceof EntryNotFoundError) errorCode = "entry-not-found";
      else if (error instanceof InvalidTransitionError) errorCode = "invalid-transition";
      else throw error;
    }
  }

  revalidatePath(`/items/${entryId}`);
  revalidatePath("/");
  redirect(`/items/${entryId}?brand=${brand}${errorCode ? `&error=${errorCode}` : ""}`);
}

/** contracts/scheduling-functions.md: transitionToPosted (spec FR-008, FR-009). */
export async function transitionToPostedAction(formData: FormData): Promise<void> {
  const brand = String(formData.get("brand") ?? "");
  const entryId = String(formData.get("entryId") ?? "");

  let errorCode: string | null = null;

  try {
    updateManifestEntry(brand, entryId, applyPostedTransition);
  } catch (error) {
    if (error instanceof EntryNotFoundError) errorCode = "entry-not-found";
    else if (error instanceof InvalidTransitionError) errorCode = "invalid-transition";
    else throw error;
  }

  revalidatePath(`/items/${entryId}`);
  revalidatePath("/");
  redirect(`/items/${entryId}?brand=${brand}${errorCode ? `&error=${errorCode}` : ""}`);
}
