import type { ManifestStatus } from "@/lib/manifest/manifest-schema";
import { STATUS_STYLES } from "@/lib/theme/status-colors";

interface StatusChipProps {
  status: ManifestStatus;
}

/** Never accepts an arbitrary color — always draws from the fixed status mapping (spec FR-004). */
export function StatusChip({ status }: StatusChipProps) {
  const { label, className } = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}
