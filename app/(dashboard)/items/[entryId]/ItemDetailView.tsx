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
  "invalid-timezone": "That timezone isn't recognized — use an IANA zone name like America/New_York.",
  "invalid-transition": "This item's status changed before the action completed — reload and try again.",
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
  return (
    <article className="mt-4">
      <div className="flex flex-wrap items-center gap-2">
        <BrandTag brand={brand} />
        <StatusChip status={detail.status} />
        {detail.repostOf && <RepostBadge />}
      </div>

      {detail.repostOf && (
        <p className="mt-1 text-sm text-gray-500">
          Repost of <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">{detail.repostOf}</code>
        </p>
      )}

      {error && (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          ⚠ {ERROR_MESSAGES[error] ?? "Something went wrong completing that action."}
        </p>
      )}

      {detail.scheduledAt && detail.timezone && (
        <p className="mt-3 text-sm text-gray-600">
          Scheduled for {formatScheduledAt(detail.scheduledAt, detail.timezone)}
        </p>
      )}

      {detail.brokenReference ? (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          ⚠ The content file for this entry (<code className="text-xs">{detail.contentId}</code>)
          could not be found or is invalid.
        </p>
      ) : (
        <>
          <section className="mt-6">
            <h2 className="text-sm font-semibold text-gray-700">Caption</h2>
            <p className="mt-1 whitespace-pre-wrap text-base text-gray-900">{detail.caption}</p>
          </section>

          <section className="mt-4">
            <h2 className="text-sm font-semibold text-gray-700">Hashtags</h2>
            <p className="mt-1 text-sm text-gray-600">
              {detail.hashtags && detail.hashtags.length > 0 ? detail.hashtags.join(" ") : "(none)"}
            </p>
          </section>

          <section className="mt-4">
            <h2 className="text-sm font-semibold text-gray-700">Media</h2>
            {detail.media && detail.media.length > 0 ? (
              <ul className="mt-1 list-inside list-disc text-sm text-gray-600">
                {detail.media.map((mediaRef) => (
                  <li key={mediaRef}>{mediaRef}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-sm text-gray-600">(none)</p>
            )}
          </section>

          <section className="mt-4">
            <h2 className="text-sm font-semibold text-gray-700">Platforms</h2>
            <p className="mt-1 text-sm text-gray-600">
              {detail.platforms && detail.platforms.length > 0 ? detail.platforms.join(", ") : "(none)"}
            </p>
          </section>
        </>
      )}

      {detail.status === "draft" && <ScheduleForm entryId={detail.entryId} brand={detail.brand} />}

      {detail.status === "scheduled" && (
        <form action={transitionToPostedAction} className="mt-4">
          <input type="hidden" name="entryId" value={detail.entryId} />
          <input type="hidden" name="brand" value={detail.brand} />
          <button
            type="submit"
            className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 focus:outline-2 focus:outline-offset-2 focus:outline-gray-900"
          >
            Mark as Posted
          </button>
        </form>
      )}

      {detail.status === "posted" && !detail.brokenReference && (
        <RepostForm entryId={detail.entryId} brand={detail.brand} contentId={detail.contentId} />
      )}

      {children}
    </article>
  );
}
