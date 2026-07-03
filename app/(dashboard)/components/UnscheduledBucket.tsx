import Link from "next/link";
import type { ManifestEntrySummary } from "@/lib/schedule/get-schedule-for-range";
import type { Brand } from "@/lib/schedule/list-brands";
import { Card } from "@/components/ui/Card";
import { BrandTag } from "@/components/ui/BrandTag";
import { StatusChip } from "@/components/ui/StatusChip";

interface UnscheduledBucketProps {
  items: ManifestEntrySummary[];
  brands: Brand[];
}

export function UnscheduledBucket({ items, brands }: UnscheduledBucketProps) {
  const brandBySlug = new Map(brands.map((brand) => [brand.slug, brand]));

  return (
    <section className="space-y-4">
      <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Unscheduled content</h2>
            <p className="mt-1 text-sm text-slate-600">Draft items without a scheduled date are easy to review here.</p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-900 shadow-sm">
            {items.length} open
          </span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          No drafts waiting to be scheduled.
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const brand = brandBySlug.get(item.brand);
            return (
              <li key={item.entryId}>
                <Link href={`/items/${item.entryId}?brand=${item.brand}`} className="block">
                  <Card brandColor={brand?.color} muted className="h-full p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <BrandTag brand={{ displayName: brand?.displayName ?? item.brand, color: brand?.color ?? "#6b7280" }} />
                      <StatusChip status={item.status} />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-700 line-clamp-3">
                      {item.captionPreview ?? "(untitled)"}
                    </p>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
