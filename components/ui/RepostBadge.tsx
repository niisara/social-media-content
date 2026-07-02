import { Repeat } from "lucide-react";
import { REPOST_BADGE_STYLE } from "@/lib/theme/status-colors";

/** Shown alongside a StatusChip, never instead of it (spec FR-005). */
export function RepostBadge() {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${REPOST_BADGE_STYLE.className}`}
    >
      <Repeat className="h-3 w-3" aria-hidden="true" />
      {REPOST_BADGE_STYLE.label}
    </span>
  );
}
