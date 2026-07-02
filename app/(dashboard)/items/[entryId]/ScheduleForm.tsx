import { transitionToScheduledAction } from "@/app/actions/schedule";

interface ScheduleFormProps {
  entryId: string;
  brand: string;
}

export function ScheduleForm({ entryId, brand }: ScheduleFormProps) {
  return (
    <form action={transitionToScheduledAction} className="mt-4 grid max-w-xs gap-3">
      <input type="hidden" name="entryId" value={entryId} />
      <input type="hidden" name="brand" value={brand} />
      <label className="text-sm font-medium text-gray-700">
        Scheduled date &amp; time
        <input
          type="datetime-local"
          name="scheduledAt"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none"
        />
      </label>
      <label className="text-sm font-medium text-gray-700">
        Timezone (IANA, e.g. America/New_York)
        <input
          type="text"
          name="timezone"
          required
          placeholder="America/New_York"
          className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none"
        />
      </label>
      <button
        type="submit"
        className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 focus:outline-2 focus:outline-offset-2 focus:outline-gray-900"
      >
        Mark as Scheduled
      </button>
    </form>
  );
}
