import type { ReactNode } from "react";
import type { ItemDetail } from "@/lib/schedule/get-item-detail";
import { formatScheduledAt } from "@/lib/timezone";
import { ScheduleForm } from "./ScheduleForm";
import { RepostForm } from "./RepostForm";
import { transitionToPostedAction } from "@/app/actions/schedule";

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
  error?: string;
  /** Slot for additional action forms (e.g. repost), added by later user stories. */
  children?: ReactNode;
}

export function ItemDetailView({ detail, error, children }: ItemDetailViewProps) {
  return (
    <article style={{ marginTop: "1rem" }}>
      <h1 style={{ marginBottom: "0.25rem" }}>{detail.brand}</h1>
      <p style={{ color: "var(--color-muted)", marginTop: 0 }}>
        Status: <strong>{detail.status}</strong>
        {detail.repostOf && (
          <>
            {" "}
            · Repost of <code>{detail.repostOf}</code>
          </>
        )}
      </p>

      {error && (
        <p style={{ color: "var(--color-danger)" }}>
          ⚠ {ERROR_MESSAGES[error] ?? "Something went wrong completing that action."}
        </p>
      )}

      {detail.scheduledAt && detail.timezone && (
        <p>Scheduled for {formatScheduledAt(detail.scheduledAt, detail.timezone)}</p>
      )}

      {detail.brokenReference ? (
        <p style={{ color: "var(--color-danger)" }}>
          ⚠ The content file for this entry (<code>{detail.contentId}</code>) could not be found or
          is invalid.
        </p>
      ) : (
        <>
          <section>
            <h2 style={{ fontSize: "1rem" }}>Caption</h2>
            <p style={{ whiteSpace: "pre-wrap" }}>{detail.caption}</p>
          </section>

          <section>
            <h2 style={{ fontSize: "1rem" }}>Hashtags</h2>
            <p>{detail.hashtags && detail.hashtags.length > 0 ? detail.hashtags.join(" ") : "(none)"}</p>
          </section>

          <section>
            <h2 style={{ fontSize: "1rem" }}>Media</h2>
            {detail.media && detail.media.length > 0 ? (
              <ul>
                {detail.media.map((mediaRef) => (
                  <li key={mediaRef}>{mediaRef}</li>
                ))}
              </ul>
            ) : (
              <p>(none)</p>
            )}
          </section>

          <section>
            <h2 style={{ fontSize: "1rem" }}>Platforms</h2>
            <p>{detail.platforms && detail.platforms.length > 0 ? detail.platforms.join(", ") : "(none)"}</p>
          </section>
        </>
      )}

      {detail.status === "draft" && <ScheduleForm entryId={detail.entryId} brand={detail.brand} />}

      {detail.status === "scheduled" && (
        <form action={transitionToPostedAction} style={{ marginTop: "1rem" }}>
          <input type="hidden" name="entryId" value={detail.entryId} />
          <input type="hidden" name="brand" value={detail.brand} />
          <button type="submit">Mark as Posted</button>
        </form>
      )}

      {detail.status === "posted" && !detail.brokenReference && (
        <RepostForm entryId={detail.entryId} brand={detail.brand} contentId={detail.contentId} />
      )}

      {children}
    </article>
  );
}
