import { transitionToScheduledAction } from "@/app/actions/schedule";

interface ScheduleFormProps {
  entryId: string;
  brand: string;
}

export function ScheduleForm({ entryId, brand }: ScheduleFormProps) {
  return (
    <form action={transitionToScheduledAction} className="grid gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 shadow-sm shadow-slate-200/40">
      <input type="hidden" name="entryId" value={entryId} />
      <input type="hidden" name="brand" value={brand} />
      <div>
        <label className="block text-sm font-semibold text-slate-900">Scheduled date &amp; time</label>
        <input
          type="datetime-local"
          name="scheduledAt"
          required
          className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-900">Timezone</label>
        <input
          type="text"
          name="timezone"
          required
          placeholder="America/New_York"
          className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
        />
      </div>
      <button
        type="submit"
        className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-2 focus:outline-offset-2 focus:outline-slate-950"
      >
        Mark as Scheduled
      </button>
    </form>
  );
}
