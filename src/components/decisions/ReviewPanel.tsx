"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle, Flag, RotateCcw } from "lucide-react";
import type { DecisionOutcome } from "@/types";
import { formatRelative } from "@/lib/utils";

const actions: { value: DecisionOutcome; label: string; icon: React.ReactNode; tone: string }[] = [
  { value: "approved", label: "Approve", icon: <CheckCircle2 className="h-4 w-4" />, tone: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" },
  { value: "rejected", label: "Reject", icon: <XCircle className="h-4 w-4" />, tone: "bg-rose-50 text-rose-700 hover:bg-rose-100" },
  { value: "flagged", label: "Flag", icon: <Flag className="h-4 w-4" />, tone: "bg-amber-50 text-amber-700 hover:bg-amber-100" },
  { value: "overridden", label: "Override", icon: <RotateCcw className="h-4 w-4" />, tone: "bg-azure-500 text-white hover:bg-azure-400" },
];

export function ReviewPanel({
  decisionId,
  currentOutcome,
  currentNotes,
  reviewedAt,
}: {
  decisionId: string;
  currentOutcome: DecisionOutcome;
  currentNotes?: string;
  reviewedAt: string | null;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState(currentNotes || "");
  const [busy, setBusy] = useState<DecisionOutcome | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function review(outcome: DecisionOutcome) {
    setError(null);
    setBusy(outcome);

    const res = await fetch(`/api/decisions/${decisionId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outcome, notes: notes || null }),
    });

    setBusy(null);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to update.");
      return;
    }
    router.refresh();
  }

  return (
    <section className="rounded-2xl border border-ink-900/10 bg-white/80 p-6 shadow-card backdrop-blur">
      <div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-ink-700/70">Reviewer actions</div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes for the record (optional)…"
        rows={3}
        className="w-full rounded-xl border border-ink-900/10 bg-paper-50 px-3 py-2.5 text-sm outline-none transition focus:border-azure-300 focus:ring-2 focus:ring-azure-200"
      />
      <div className="mt-3 grid grid-cols-2 gap-2">
        {actions.map((a) => (
          <button key={a.value} onClick={() => review(a.value)} disabled={busy !== null}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition disabled:opacity-60 ${a.tone}`}>
            {busy === a.value ? <Loader2 className="h-4 w-4 animate-spin" /> : a.icon}
            {a.label}
          </button>
        ))}
      </div>
      {error && <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      <div className="mt-4 text-xs text-ink-700/60">
        Current: <span className="font-medium text-ink-900">{currentOutcome}</span>
        {reviewedAt && <span> · last reviewed {formatRelative(reviewedAt)}</span>}
      </div>
    </section>
  );
}
