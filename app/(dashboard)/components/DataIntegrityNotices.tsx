import type { ContentItemSummary } from "@/lib/schedule/get-schedule-for-range";
import { WarningBanner } from "@/components/ui/WarningBanner";

interface DataIntegrityNoticesProps {
  untrackedContent: ContentItemSummary[];
  duplicateContentIds: string[];
}

export function DataIntegrityNotices({ untrackedContent, duplicateContentIds }: DataIntegrityNoticesProps) {
  if (untrackedContent.length === 0 && duplicateContentIds.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {untrackedContent.length > 0 && (
        <WarningBanner title={`Untracked content (${untrackedContent.length})`}>
          <p className="text-sm text-slate-700">
            These files exist under <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">content/</code> but have no manifest entry yet.
          </p>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {untrackedContent.map((item) => (
              <li key={item.contentId} className="rounded-2xl bg-white px-3 py-2 shadow-sm">
                <span className="font-semibold text-slate-900">{item.brand}</span>: {item.contentId}
              </li>
            ))}
          </ul>
        </WarningBanner>
      )}
      {duplicateContentIds.length > 0 && (
        <WarningBanner title={`Duplicate content references (${duplicateContentIds.length})`}>
          <p className="text-sm text-slate-700">The same content ID is tracked by more than one manifest entry.</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {duplicateContentIds.map((contentId) => (
              <li key={contentId} className="rounded-2xl bg-white px-3 py-2 shadow-sm">{contentId}</li>
            ))}
          </ul>
        </WarningBanner>
      )}
    </div>
  );
}
