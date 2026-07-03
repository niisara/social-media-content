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
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
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
              "min-h-[14rem] rounded-[1.75rem] p-4 transition-all",
              isToday
                ? "bg-slate-950 text-white shadow-[0_20px_80px_rgba(15,23,42,0.12)]"
                : isEmpty
                  ? "border border-dashed border-slate-300 bg-slate-50"
                  : isWeekend
                    ? "border border-slate-200 bg-slate-50"
                    : "border border-slate-200 bg-white shadow-sm",
            ].join(" ")}
          >
            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm font-semibold">
              <span className={isToday ? "text-white" : "text-slate-900"}>{dt.toFormat("EEE, MMM d")}</span>
              {isToday && (
                <span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-950">
                  Today
                </span>
              )}
            </div>

            {isEmpty ? (
              <div className={isToday ? "text-slate-200" : "text-slate-500"}>
                <p className="text-sm">No content</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {dayItems.map((item) => {
                  const brand = brandBySlug.get(item.brand);
                  return (
                    <Link key={item.entryId} href={`/items/${item.entryId}?brand=${item.brand}`} className="block">
                      <Card brandColor={brand?.color} className={isToday ? "bg-slate-900 text-white" : "p-3"}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <BrandTag
                            brand={{ displayName: brand?.displayName ?? item.brand, color: brand?.color ?? "#6b7280" }}
                          />
                          <StatusChip status={item.status} />
                        </div>
                        <p className={isToday ? "mt-3 text-sm text-slate-200" : "mt-3 text-sm text-slate-800"}>
                          {item.captionPreview ?? "(untitled)"}
                        </p>
                        {(item.repostOf || item.brokenReference) && (
                          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium">
                            {item.repostOf && <RepostBadge />}
                            {item.brokenReference && (
                              <span className={isToday ? "text-rose-300" : "text-rose-600"}>⚠ Missing content</span>
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
