import { DateTime } from "luxon";
import Link from "next/link";
import type { ManifestEntrySummary } from "@/lib/schedule/get-schedule-for-range";
import type { Brand } from "@/lib/schedule/list-brands";
import type { DateRange } from "@/lib/timezone";

export interface CalendarItem extends ManifestEntrySummary {
  date: string;
}

interface CalendarGridProps {
  range: DateRange;
  items: CalendarItem[];
  brands: Brand[];
}

export function CalendarGrid({ range, items, brands }: CalendarGridProps) {
  const brandBySlug = new Map(brands.map((brand) => [brand.slug, brand]));
  const dates = enumerateDates(range);
  const itemsByDate = new Map<string, CalendarItem[]>();
  for (const item of items) {
    const bucket = itemsByDate.get(item.date) ?? [];
    bucket.push(item);
    itemsByDate.set(item.date, bucket);
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
        gap: "0.75rem",
      }}
    >
      {dates.map((date) => (
        <div
          key={date}
          style={{
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            padding: "0.5rem",
            minHeight: 120,
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
            {DateTime.fromISO(date).toFormat("EEE, MMM d")}
          </div>
          {(itemsByDate.get(date) ?? []).map((item) => {
            const brand = brandBySlug.get(item.brand);
            return (
              <Link
                key={item.entryId}
                href={`/items/${item.entryId}?brand=${item.brand}`}
                style={{
                  display: "block",
                  marginBottom: "0.4rem",
                  padding: "0.35rem 0.5rem",
                  borderRadius: 6,
                  borderLeft: `4px solid ${brand?.color ?? "#999"}`,
                  background: "#f7f7f7",
                  textDecoration: "none",
                  color: "inherit",
                  fontSize: "0.85rem",
                }}
              >
                <div style={{ fontWeight: 600 }}>{brand?.displayName ?? item.brand}</div>
                <div>{item.captionPreview ?? "(untitled)"}</div>
                {item.repostOf && <div style={{ color: "var(--color-muted)" }}>Repost</div>}
                {item.brokenReference && (
                  <div style={{ color: "var(--color-danger)" }}>⚠ Missing content file</div>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function enumerateDates(range: DateRange): string[] {
  const dates: string[] = [];
  let cursor = DateTime.fromISO(range.start);
  const end = DateTime.fromISO(range.end);
  while (cursor <= end) {
    dates.push(cursor.toISODate()!);
    cursor = cursor.plus({ days: 1 });
  }
  return dates;
}
