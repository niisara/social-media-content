import Link from "next/link";

interface SegmentedControlOption {
  label: string;
  href: string;
  active: boolean;
}

interface SegmentedControlProps {
  options: SegmentedControlOption[];
}

/** A grouped, bordered control set with the active option clearly marked (spec FR-012). */
export function SegmentedControl({ options }: SegmentedControlProps) {
  return (
    <div className="inline-flex items-center rounded-lg border border-gray-300 bg-white p-0.5">
      {options.map((option) => (
        <Link
          key={option.label}
          href={option.href}
          className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
            option.active ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}
