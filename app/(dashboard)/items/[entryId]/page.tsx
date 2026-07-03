import { notFound } from "next/navigation";
import Link from "next/link";
import { getItemDetail, EntryNotFoundError } from "@/lib/schedule/get-item-detail";
import { listBrands } from "@/lib/schedule/list-brands";
import { ItemDetailView } from "./ItemDetailView";

interface ItemDetailPageProps {
  params: Promise<{ entryId: string }>;
  searchParams: Promise<{ brand?: string; error?: string }>;
}

export default async function ItemDetailPage({ params, searchParams }: ItemDetailPageProps) {
  const { entryId } = await params;
  const { brand, error } = await searchParams;

  if (!brand) {
    notFound();
  }

  let detail;
  try {
    detail = getItemDetail(entryId, brand);
  } catch (error) {
    if (error instanceof EntryNotFoundError) {
      notFound();
    }
    throw error;
  }

  const brandInfo = listBrands().find((candidate) => candidate.slug === detail.brand);

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm shadow-slate-200/50">
        <Link href="/" className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
          ← Back to dashboard
        </Link>
        <span className="text-xs uppercase tracking-[0.24em] text-slate-500">Item detail</span>
      </div>
      <ItemDetailView
        detail={detail}
        brand={{ displayName: brandInfo?.displayName ?? detail.brand, color: brandInfo?.color ?? "#6b7280" }}
        error={error}
      />
    </main>
  );
}
