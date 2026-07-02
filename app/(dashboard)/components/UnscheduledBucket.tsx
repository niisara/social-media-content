import Link from "next/link";
import type { ManifestEntrySummary } from "@/lib/schedule/get-schedule-for-range";
import type { Brand } from "@/lib/schedule/list-brands";

interface UnscheduledBucketProps {
  items: ManifestEntrySummary[];
  brands: Brand[];
}

export function UnscheduledBucket({ items, brands }: UnscheduledBucketProps) {
  const brandBySlug = new Map(brands.map((brand) => [brand.slug, brand]));

  return (
    <section style={{ marginTop: "1.5rem" }}>
      <h2 style={{ fontSize: "1rem" }}>Unscheduled ({items.length})</h2>
      {items.length === 0 ? (
        <p style={{ color: "var(--color-muted)" }}>No drafts waiting to be scheduled.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {items.map((item) => {
            const brand = brandBySlug.get(item.brand);
            return (
              <li key={item.entryId}>
                <Link
                  href={`/items/${item.entryId}?brand=${item.brand}`}
                  style={{
                    display: "block",
                    padding: "0.4rem 0.6rem",
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
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
