import { DateTime } from "luxon";
import Link from "next/link";
import type { ManifestEntrySummary } from "@/lib/schedule/get-schedule-for-range";
import type { Brand } from "@/lib/schedule/list-brands";
import type { DateRange } from "@/lib/timezone";
import { Card } from "@/components/ui/Card";
import { BrandTag } from "@/components/ui/BrandTag";
import { StatusChip } from "@/components/ui/StatusChip";
import { RepostBadge } from "@/components/ui/RepostBadge";

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
  const today = DateTime.now().toISODate();

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-7">
      {dates.map((date) => {
        const dayItems = itemsByDate.get(date) ?? [];
        const dt = DateTime.fromISO(date);
        const isToday = date === today;
        const isWeekend = dt.weekday === 6 || dt.weekday === 7;
        const isEmpty = dayItems.length === 0;

        return (
          <div
            key={date}
            className={[
              "min-h-32 rounded-lg p-2 transition-colors",
              isToday
                ? "border-2 border-gray-900 bg-white"
                : isWeekend
                  ? "border border-gray-200 bg-gray-50"
                  : "border border-gray-200 bg-white",
            ].join(" ")}
          >
            <div
              className={`mb-2 flex items-center gap-1.5 text-sm font-semibold ${
                isToday ? "text-gray-900" : "text-gray-700"
              }`}
            >
              {dt.toFormat("EEE, MMM d")}
              {isToday && (
                <span className="rounded-full bg-gray-900 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
                  Today
                </span>
              )}
            </div>

            {isEmpty ? (
              <p className="text-xs text-gray-400">No content</p>
            ) : (
              <div className="flex flex-col gap-2">
                {dayItems.map((item) => {
                  const brand = brandBySlug.get(item.brand);
                  return (
                    <Link key={item.entryId} href={`/items/${item.entryId}?brand=${item.brand}`} className="block">
                      <Card brandColor={brand?.color} className="p-2">
                        <div className="flex items-center justify-between gap-2">
                          <BrandTag
                            brand={{ displayName: brand?.displayName ?? item.brand, color: brand?.color ?? "#6b7280" }}
                          />
                          <StatusChip status={item.status} />
                        </div>
                        <p className="mt-1.5 line-clamp-2 text-sm text-gray-800">
                          {item.captionPreview ?? "(untitled)"}
                        </p>
                        {(item.repostOf || item.brokenReference) && (
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            {item.repostOf && <RepostBadge />}
                            {item.brokenReference && (
                              <span className="text-xs font-medium text-red-600">⚠ Missing content file</span>
                            )}
                          </div>
                        )}
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
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
