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
    <section className="rounded-lg border border-dashed border-gray-300 bg-gray-50/60 p-4">
      <h2 className="text-sm font-semibold text-gray-500">Unscheduled ({items.length})</h2>
      {items.length === 0 ? (
        <p className="mt-1 text-sm text-gray-500">No drafts waiting to be scheduled.</p>
      ) : (
        <ul className="mt-2 flex list-none flex-wrap gap-2 p-0">
          {items.map((item) => {
            const brand = brandBySlug.get(item.brand);
            return (
              <li key={item.entryId} className="w-56">
                <Link href={`/items/${item.entryId}?brand=${item.brand}`} className="block">
                  <Card brandColor={brand?.color} muted className="p-2">
                    <div className="flex items-center justify-between gap-2">
                      <BrandTag brand={{ displayName: brand?.displayName ?? item.brand, color: brand?.color ?? "#6b7280" }} />
                      <StatusChip status={item.status} />
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-sm text-gray-700">
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
