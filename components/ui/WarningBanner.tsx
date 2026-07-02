import type { ReactNode } from "react";
import { TriangleAlert } from "lucide-react";

interface WarningBannerProps {
  icon?: ReactNode;
  title: string;
  children: ReactNode;
}

/** Visually distinct from Card — used for the untracked-content warning, never normal content (spec FR-014). */
export function WarningBanner({ icon, title, children }: WarningBannerProps) {
  return (
    <div className="flex gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900">
      <div className="mt-0.5 shrink-0">
        {icon ?? <TriangleAlert className="h-5 w-5" aria-hidden="true" />}
      </div>
      <div>
        <p className="font-semibold">{title}</p>
        <div className="mt-1 text-sm">{children}</div>
      </div>
    </div>
  );
}
