"use client";

import { useState } from "react";
import { FileDown, FileText, Filter, Loader2, CheckCircle } from "lucide-react";

const OUTCOMES = ["", "approved", "rejected", "flagged", "pending", "overridden"];
const RISKS = ["", "low", "medium", "high", "critical"];

export default function ReportsPage() {
  const [outcome, setOutcome] = useState("");
  const [risk, setRisk] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [format, setFormat] = useState<"csv" | "json">("csv");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function download() {
    setLoading(true);
    setDone(false);

    const params = new URLSearchParams({ format });
    if (outcome) params.set("outcome", outcome);
    if (risk) params.set("risk", risk);
    if (from) params.set("from", new Date(from).toISOString());
    if (to) {
      const d = new Date(to);
      d.setHours(23, 59, 59, 999);
      params.set("to", d.toISOString());
    }

    const res = await fetch(`/api/export?${params.toString()}`);
    if (!res.ok) { setLoading(false); return; }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `decitrace-report-${new Date().toISOString().slice(0, 10)}.${format}`;
    a.click();
    URL.revokeObjectURL(url);

    setLoading(false);
    setDone(true);
    setTimeout(() => setDone(false), 3000);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="text-xs uppercase tracking-[0.18em] text-azure-500">Export</div>
      <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight md:text-5xl">
        Reports
      </h1>
      <p className="mt-2 text-ink-700/80">
        Download a filtered export of your decision ledger as CSV or JSON.
      </p>

      <div className="mt-8 rounded-2xl border border-ink-900/10 bg-white/80 p-6 shadow-card backdrop-blur">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink-700/60">
          <Filter className="h-3.5 w-3.5" />
          Filters
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {/* Outcome */}
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-700/70">
              Outcome
            </span>
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              className="w-full rounded-xl border border-ink-900/10 bg-paper-50 px-3 py-2.5 text-sm outline-none transition focus:border-azure-300 focus:ring-2 focus:ring-azure-200"
            >
              {OUTCOMES.map((o) => (
                <option key={o} value={o}>{o ? o[0].toUpperCase() + o.slice(1) : "All outcomes"}</option>
              ))}
            </select>
          </label>

          {/* Risk */}
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-700/70">
              Risk level
            </span>
            <select
              value={risk}
              onChange={(e) => setRisk(e.target.value)}
              className="w-full rounded-xl border border-ink-900/10 bg-paper-50 px-3 py-2.5 text-sm outline-none transition focus:border-azure-300 focus:ring-2 focus:ring-azure-200"
            >
              {RISKS.map((r) => (
                <option key={r} value={r}>{r ? r[0].toUpperCase() + r.slice(1) : "All risk levels"}</option>
              ))}
            </select>
          </label>

          {/* Date from */}
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-700/70">
              From date
            </span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full rounded-xl border border-ink-900/10 bg-paper-50 px-3 py-2.5 text-sm outline-none transition focus:border-azure-300 focus:ring-2 focus:ring-azure-200"
            />
          </label>

          {/* Date to */}
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-700/70">
              To date
            </span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded-xl border border-ink-900/10 bg-paper-50 px-3 py-2.5 text-sm outline-none transition focus:border-azure-300 focus:ring-2 focus:ring-azure-200"
            />
          </label>
        </div>

        {/* Format */}
        <div className="mt-6">
          <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-ink-700/70">
            Format
          </span>
          <div className="flex gap-3">
            <button
              onClick={() => setFormat("csv")}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                format === "csv"
                  ? "border-azure-500 bg-azure-50 text-azure-500"
                  : "border-ink-900/10 bg-paper-50 text-ink-700 hover:border-azure-300"
              }`}
            >
              <FileText className="h-4 w-4" />
              CSV
            </button>
            <button
              onClick={() => setFormat("json")}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                format === "json"
                  ? "border-azure-500 bg-azure-50 text-azure-500"
                  : "border-ink-900/10 bg-paper-50 text-ink-700 hover:border-azure-300"
              }`}
            >
              <FileText className="h-4 w-4" />
              JSON
            </button>
          </div>
        </div>

        {/* Download button */}
        <button
          onClick={download}
          disabled={loading}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-azure-500 px-5 py-3 text-sm font-medium text-white shadow-card transition hover:bg-azure-400 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : done ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <FileDown className="h-4 w-4" />
          )}
          {loading ? "Generating…" : done ? "Downloaded!" : `Download ${format.toUpperCase()} report`}
        </button>
      </div>

      {/* Info cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { icon: "📋", title: "All fields included", body: "Every column from the decisions table — model, outcome, risk, prompt, response, cost, and more." },
          { icon: "🔒", title: "Your data only", body: "Reports are scoped to your workspace. Row-level security ensures no cross-tenant data leakage." },
          { icon: "📅", title: "Up to 10,000 rows", body: "Filter by date range to export specific periods. Narrow filters for faster downloads." },
        ].map((c) => (
          <div key={c.title} className="rounded-2xl border border-ink-900/10 bg-white/80 p-4 shadow-card backdrop-blur">
            <div className="text-2xl">{c.icon}</div>
            <div className="mt-2 text-sm font-semibold text-ink-900">{c.title}</div>
            <p className="mt-1 text-xs text-ink-700/70">{c.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
