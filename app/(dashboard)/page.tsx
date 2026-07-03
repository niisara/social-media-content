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
    <main className="mx-auto max-w-6xl p-6">
      <header className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Scheduling dashboard</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">See every brand schedule at a glance</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Manage scheduled posts, spot untracked content, and keep draft items ready to publish in one modern workspace.
            </p>
          </div>

          <div className="flex w-full max-w-3xl justify-end">
            <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">
              <div>
                <SegmentedControl
                  options={[
                    { label: `← Previous ${view}`, href: withParams({ offset: String(offset - 1) }), active: false },
                    { label: "Today", href: withParams({ offset: "0" }), active: offset === 0 },
                    { label: `Next ${view} →`, href: withParams({ offset: String(offset + 1) }), active: false },
                  ]}
                />
              </div>
              <div>
                <SegmentedControl
                  options={[
                    { label: "Week", href: withParams({ view: "week", offset: "0" }), active: view === "week" },
                    { label: "Month", href: withParams({ view: "month", offset: "0" }), active: view === "month" },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <BrandFilter brands={brands} activeBrand={brand} view={view} offset={offset} />
          <p className="text-sm text-slate-600">Showing <span className="font-semibold text-slate-900">{range.start}</span> – <span className="font-semibold text-slate-900">{range.end}</span></p>
        </div>
      </header>

      <div className="mt-8 grid gap-8">
        <DataIntegrityNotices
          untrackedContent={scheduleView.untrackedContent}
          duplicateContentIds={scheduleView.duplicateContentIds}
        />

        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <CalendarGrid range={range} items={calendarItems} brands={brands} />
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <UnscheduledBucket items={scheduleView.unscheduled} brands={brands} />
        </section>
      </div>
    </main>
  );
}
