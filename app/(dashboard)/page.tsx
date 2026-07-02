import Link from "next/link";
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
    <main style={{ padding: "1.5rem", maxWidth: 1100, margin: "0 auto" }}>
      <h1>Scheduling Dashboard</h1>

      <nav style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "1rem" }}>
        <Link href={withParams({ offset: String(offset - 1) })}>← Previous {view}</Link>
        <Link href={withParams({ offset: "0" })}>Today</Link>
        <Link href={withParams({ offset: String(offset + 1) })}>Next {view} →</Link>
        <span style={{ marginLeft: "auto" }}>
          <Link href={withParams({ view: view === "week" ? "month" : "week", offset: "0" })}>
            Switch to {view === "week" ? "month" : "week"} view
          </Link>
        </span>
      </nav>

      <p style={{ color: "var(--color-muted)" }}>Showing {range.start} – {range.end}</p>

      <BrandFilter brands={brands} activeBrand={brand} view={view} offset={offset} />

      <DataIntegrityNotices
        untrackedContent={scheduleView.untrackedContent}
        duplicateContentIds={scheduleView.duplicateContentIds}
      />

      <CalendarGrid range={range} items={calendarItems} brands={brands} />

      <UnscheduledBucket items={scheduleView.unscheduled} brands={brands} />
    </main>
  );
}
