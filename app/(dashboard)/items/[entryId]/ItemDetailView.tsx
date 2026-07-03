import type { ReactNode } from "react";
import type { ItemDetail } from "@/lib/schedule/get-item-detail";
import { formatScheduledAt } from "@/lib/timezone";
import { ScheduleForm } from "./ScheduleForm";
import { RepostForm } from "./RepostForm";
import { transitionToPostedAction } from "@/app/actions/schedule";
import { BrandTag } from "@/components/ui/BrandTag";
import { StatusChip } from "@/components/ui/StatusChip";
import { RepostBadge } from "@/components/ui/RepostBadge";

const ERROR_MESSAGES: Record<string, string> = {
  "missing-schedule-fields": "Both a scheduled date and a timezone are required.",
  "invalid-timezone": "That timezone isn&apos;t recognized — use an IANA zone name like America/New_York.",
  "invalid-transition": "This item&apos;s status changed before the action completed — reload and try again.",
  "entry-not-found": "This entry no longer exists in the manifest — it may have been edited or removed externally.",
  "content-not-found": "The original content file could not be found.",
  "original-not-posted": "Only items with status \"posted\" can be reposted.",
  "repost-failed": "The repost could not be created — please try again.",
};

interface ItemDetailViewProps {
  detail: ItemDetail;
  brand: { displayName: string; color: string };
  error?: string;
  /** Slot for additional action forms, if ever needed beyond schedule/repost. */
  children?: ReactNode;
}

export function ItemDetailView({ detail, brand, error, children }: ItemDetailViewProps) {
  const previewTitle = detail.contentId.split("/").pop()?.replace(/\.md$/, "") ?? detail.contentId;

  return (
    <article
      style={{ "--brand-color": brand.color } as React.CSSProperties}
      className="mt-4 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_80px_rgba(15,23,42,0.06)]"
    >
      <div className="bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_45%)] p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Content item</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{previewTitle}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">A polished, modern view of this content item&apos;s status, schedule, and metadata.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <BrandTag brand={brand} />
            <StatusChip status={detail.status} />
            {detail.repostOf && <RepostBadge />}
          </div>
        </div>

        {detail.repostOf && (
          <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            Repost of <code className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{detail.repostOf}</code>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm font-medium text-rose-700">
            ⚠ {ERROR_MESSAGES[error] ?? "Something went wrong completing that action."}
          </div>
        )}

        {detail.brokenReference ? (
          <div className="mt-4 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm font-medium text-rose-700">
            ⚠ The content file for this entry (<code className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{detail.contentId}</code>) could not be found or is invalid.
          </div>
        ) : detail.scheduledAt && detail.timezone ? (
          <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
            Scheduled for <span className="font-semibold text-slate-900">{formatScheduledAt(detail.scheduledAt, detail.timezone)}</span>
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 px-6 pb-6 sm:grid-cols-[1.2fr_0.8fr] sm:px-8 sm:pb-8">
        <div className="grid gap-6">
          <section className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Caption</h2>
            <p className="mt-4 whitespace-pre-wrap text-base leading-7 text-slate-900">{detail.caption}</p>
          </section>

          <div className="grid gap-4 sm:grid-cols-2">
            <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
              <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Hashtags</h3>
              <p className="mt-3 text-sm leading-6 text-slate-700">{detail.hashtags && detail.hashtags.length > 0 ? detail.hashtags.join(" ") : "(none)"}</p>
            </section>
            <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
              <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Platforms</h3>
              <p className="mt-3 text-sm leading-6 text-slate-700">{detail.platforms && detail.platforms.length > 0 ? detail.platforms.join(", ") : "(none)"}</p>
            </section>
          </div>

          <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
            <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Media</h3>
            {detail.media && detail.media.length > 0 ? (
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                {detail.media.map((mediaRef) => (
                  <li key={mediaRef} className="rounded-2xl bg-slate-50 px-3 py-2">{mediaRef}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm leading-6 text-slate-700">(none)</p>
            )}
          </section>
        </div>

        <div className="space-y-5">
          <section className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Details</h3>
            <dl className="mt-5 space-y-4 text-sm leading-6 text-slate-700">
              <div>
                <dt className="font-medium text-slate-900">Content file</dt>
                <dd className="mt-1 overflow-hidden rounded-2xl bg-white px-3 py-2 text-slate-700 shadow-sm shadow-slate-200/40">{detail.contentId}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-900">Manifest entry</dt>
                <dd className="mt-1 overflow-hidden rounded-2xl bg-white px-3 py-2 text-slate-700 shadow-sm shadow-slate-200/40">{detail.entryId}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-900">Brand</dt>
                <dd className="mt-1 text-slate-700">{detail.brand}</dd>
              </div>
              {detail.repostOf ? (
                <div>
                  <dt className="font-medium text-slate-900">Repost source</dt>
                  <dd className="mt-1 overflow-hidden rounded-2xl bg-white px-3 py-2 text-slate-700 shadow-sm shadow-slate-200/40">{detail.repostOf}</dd>
                </div>
              ) : null}
            </dl>
          </section>

          <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6">
            <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Actions</h3>
            <div className="mt-5 space-y-4">
              {detail.status === "draft" && <ScheduleForm entryId={detail.entryId} brand={detail.brand} />}
              {detail.status === "scheduled" && (
                <form action={transitionToPostedAction} className="grid gap-3">
                  <input type="hidden" name="entryId" value={detail.entryId} />
                  <input type="hidden" name="brand" value={detail.brand} />
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-2 focus:outline-offset-2 focus:outline-slate-950"
                  >
                    Mark as Posted
                  </button>
                </form>
              )}
              {detail.status === "posted" && !detail.brokenReference && <RepostForm entryId={detail.entryId} brand={detail.brand} contentId={detail.contentId} />}
            </div>
          </section>
        </div>
      </div>

      {children}
    </article>
  );
}
