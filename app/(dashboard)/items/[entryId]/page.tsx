import { notFound } from "next/navigation";
import Link from "next/link";
import { getItemDetail, EntryNotFoundError } from "@/lib/schedule/get-item-detail";
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

  return (
    <main style={{ padding: "1.5rem", maxWidth: 700, margin: "0 auto" }}>
      <Link href="/">← Back to dashboard</Link>
      <ItemDetailView detail={detail} error={error} />
    </main>
  );
}
