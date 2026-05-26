import type { DecisionOutcome, RiskLevel } from "@/types";
import { cn } from "@/lib/utils";

const outcomeMap: Record<DecisionOutcome, { label: string; className: string }> = {
  approved: {
    label: "Approved",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  rejected: {
    label: "Rejected",
    className: "bg-rose-50 text-rose-700 ring-rose-200",
  },
  flagged: {
    label: "Flagged",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  pending: {
    label: "Pending",
    className: "bg-azure-50 text-azure-500 ring-azure-200",
  },
  overridden: {
    label: "Overridden",
    className: "bg-mist text-ink-800 ring-mist-dark",
  },
};

const riskMap: Record<RiskLevel, { label: string; className: string }> = {
  low: { label: "Low", className: "bg-paper-100 text-ink-700 ring-ink-900/10" },
  medium: { label: "Medium", className: "bg-azure-50 text-azure-500 ring-azure-200" },
  high: { label: "High", className: "bg-amber-50 text-amber-700 ring-amber-200" },
  critical: { label: "Critical", className: "bg-rose-50 text-rose-700 ring-rose-200" },
};

export function OutcomeBadge({ outcome }: { outcome: DecisionOutcome }) {
  const x = outcomeMap[outcome];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        x.className
      )}
    >
      {x.label}
    </span>
  );
}

export function RiskBadge({ level }: { level: RiskLevel }) {
  const x = riskMap[level];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        x.className
      )}
    >
      {x.label} risk
    </span>
  );
}
