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
    <div className="flex flex-col gap-3">
      {untrackedContent.length > 0 && (
        <WarningBanner title={`Untracked content (${untrackedContent.length})`}>
          These files exist under <code className="text-xs">content/</code> but have no manifest
          entry yet.
          <ul className="mt-1 list-inside list-disc">
            {untrackedContent.map((item) => (
              <li key={item.contentId}>
                {item.brand}: {item.contentId}
              </li>
            ))}
          </ul>
        </WarningBanner>
      )}
      {duplicateContentIds.length > 0 && (
        <WarningBanner title={`Duplicate content references (${duplicateContentIds.length})`}>
          The same content ID is tracked by more than one manifest entry.
          <ul className="mt-1 list-inside list-disc">
            {duplicateContentIds.map((contentId) => (
              <li key={contentId}>{contentId}</li>
            ))}
          </ul>
        </WarningBanner>
      )}
    </div>
  );
}
