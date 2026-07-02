import { createRepostAction } from "@/app/actions/repost";

interface RepostFormProps {
  entryId: string;
  brand: string;
  contentId: string;
}

export function RepostForm({ entryId, brand, contentId }: RepostFormProps) {
  return (
    <form
      action={createRepostAction}
      style={{ marginTop: "1rem", display: "grid", gap: "0.5rem", maxWidth: 320 }}
    >
      <input type="hidden" name="originalEntryId" value={entryId} />
      <input type="hidden" name="brand" value={brand} />
      <input type="hidden" name="originalContentId" value={contentId} />
      <label>
        Repost date &amp; time (independent of the original)
        <input type="datetime-local" name="scheduledAt" required style={{ display: "block", width: "100%" }} />
      </label>
      <label>
        Timezone (IANA, e.g. America/New_York)
        <input
          type="text"
          name="timezone"
          required
          placeholder="America/New_York"
          style={{ display: "block", width: "100%" }}
        />
      </label>
      <button type="submit">Create Repost</button>
    </form>
  );
}
