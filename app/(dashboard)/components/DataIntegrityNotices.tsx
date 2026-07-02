import type { ContentItemSummary } from "@/lib/schedule/get-schedule-for-range";

interface DataIntegrityNoticesProps {
  untrackedContent: ContentItemSummary[];
  duplicateContentIds: string[];
}

export function DataIntegrityNotices({
  untrackedContent,
  duplicateContentIds,
}: DataIntegrityNoticesProps) {
  if (untrackedContent.length === 0 && duplicateContentIds.length === 0) {
    return null;
  }

  return (
    <section
      style={{
        marginTop: "1rem",
        padding: "0.75rem 1rem",
        border: `1px solid var(--color-danger)`,
        borderRadius: 8,
        background: "#fff5f5",
      }}
    >
      {untrackedContent.length > 0 && (
        <div style={{ marginBottom: duplicateContentIds.length > 0 ? "0.5rem" : 0 }}>
          <strong>Untracked content ({untrackedContent.length}):</strong> these files exist under
          content/ but have no manifest entry yet.
          <ul>
            {untrackedContent.map((item) => (
              <li key={item.contentId}>
                {item.brand}: {item.contentId}
              </li>
            ))}
          </ul>
        </div>
      )}
      {duplicateContentIds.length > 0 && (
        <div>
          <strong>Duplicate content references ({duplicateContentIds.length}):</strong> the same
          content ID is tracked by more than one manifest entry.
          <ul>
            {duplicateContentIds.map((contentId) => (
              <li key={contentId}>{contentId}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
