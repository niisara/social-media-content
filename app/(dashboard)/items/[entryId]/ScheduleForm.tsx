import { transitionToScheduledAction } from "@/app/actions/schedule";

interface ScheduleFormProps {
  entryId: string;
  brand: string;
}

export function ScheduleForm({ entryId, brand }: ScheduleFormProps) {
  return (
    <form
      action={transitionToScheduledAction}
      style={{ marginTop: "1rem", display: "grid", gap: "0.5rem", maxWidth: 320 }}
    >
      <input type="hidden" name="entryId" value={entryId} />
      <input type="hidden" name="brand" value={brand} />
      <label>
        Scheduled date &amp; time
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
      <button type="submit">Mark as Scheduled</button>
    </form>
  );
}
