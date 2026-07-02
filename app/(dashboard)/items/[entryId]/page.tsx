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
    <main className="mx-auto max-w-2xl p-6">
      <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900">
        ← Back to dashboard
      </Link>
      <ItemDetailView
        detail={detail}
        brand={{ displayName: brandInfo?.displayName ?? detail.brand, color: brandInfo?.color ?? "#6b7280" }}
        error={error}
      />
    </main>
  );
}
