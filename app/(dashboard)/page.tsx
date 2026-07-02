import { getScheduleForRange } from "@/lib/schedule/get-schedule-for-range";
import { listBrands } from "@/lib/schedule/list-brands";
import {
  currentMonthRange,
  currentWeekRange,
  scheduledCalendarDate,
  shiftMonthRange,
  shiftWeekRange,
} from "@/lib/timezone";
import { CalendarGrid, type CalendarItem } from "./components/CalendarGrid";
import { UnscheduledBucket } from "./components/UnscheduledBucket";
import { DataIntegrityNotices } from "./components/DataIntegrityNotices";
import { BrandFilter } from "./components/BrandFilter";
import { SegmentedControl } from "@/components/ui/SegmentedControl";

interface DashboardPageProps {
  searchParams: Promise<{ view?: string; offset?: string; brand?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const view = params.view === "month" ? "month" : "week";
  const offset = Number.parseInt(params.offset ?? "0", 10) || 0;
  const brand = params.brand || undefined;

  const baseRange = view === "month" ? currentMonthRange() : currentWeekRange();
  const range =
    offset === 0 ? baseRange : view === "month" ? shiftMonthRange(baseRange, offset) : shiftWeekRange(baseRange, offset);

  const scheduleView = getScheduleForRange(range, brand);
  const brands = listBrands();

  const calendarItems: CalendarItem[] = scheduleView.scheduled
    .map((item) => {
      const date = item.scheduledAt && item.timezone ? scheduledCalendarDate(item.scheduledAt, item.timezone) : null;
      return date ? { ...item, date } : null;
    })
    .filter((item): item is CalendarItem => item !== null);

  const withParams = (overrides: Record<string, string | undefined>) => {
    const next = new URLSearchParams({ view, offset: String(offset), ...(brand ? { brand } : {}) });
    for (const [key, value] of Object.entries(overrides)) {
      if (value === undefined) next.delete(key);
      else next.set(key, value);
    }
    return `/?${next.toString()}`;
  };

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Scheduling Dashboard</h1>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <nav className="flex flex-wrap items-center gap-3">
          <SegmentedControl
            options={[
              { label: `← Previous ${view}`, href: withParams({ offset: String(offset - 1) }), active: false },
              { label: "Today", href: withParams({ offset: "0" }), active: offset === 0 },
              { label: `Next ${view} →`, href: withParams({ offset: String(offset + 1) }), active: false },
            ]}
          />
          <SegmentedControl
            options={[
              { label: "Week", href: withParams({ view: "week", offset: "0" }), active: view === "week" },
              { label: "Month", href: withParams({ view: "month", offset: "0" }), active: view === "month" },
            ]}
          />
          <p className="text-sm text-gray-600">
            Showing {range.start} – {range.end}
          </p>
        </nav>

        <div className="mt-3 border-t border-gray-100 pt-3">
          <BrandFilter brands={brands} activeBrand={brand} view={view} offset={offset} />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-6">
        <DataIntegrityNotices
          untrackedContent={scheduleView.untrackedContent}
          duplicateContentIds={scheduleView.duplicateContentIds}
        />

        <CalendarGrid range={range} items={calendarItems} brands={brands} />

        <UnscheduledBucket items={scheduleView.unscheduled} brands={brands} />
      </div>
    </main>
  );
}
