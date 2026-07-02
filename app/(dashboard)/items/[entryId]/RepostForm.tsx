import { createRepostAction } from "@/app/actions/repost";

interface RepostFormProps {
  entryId: string;
  brand: string;
  contentId: string;
}

export function RepostForm({ entryId, brand, contentId }: RepostFormProps) {
  return (
    <form action={createRepostAction} className="mt-4 grid max-w-xs gap-3">
      <input type="hidden" name="originalEntryId" value={entryId} />
      <input type="hidden" name="brand" value={brand} />
      <input type="hidden" name="originalContentId" value={contentId} />
      <label className="text-sm font-medium text-gray-700">
        Repost date &amp; time (independent of the original)
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
        className="rounded-md border border-purple-300 bg-purple-50 px-3 py-1.5 text-sm font-medium text-purple-700 hover:bg-purple-100 focus:outline-2 focus:outline-offset-2 focus:outline-purple-500"
      >
        Create Repost
      </button>
    </form>
  );
}
