import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Decision, DecisionOutcome, RiskLevel } from "@/types";
import { OutcomeBadge, RiskBadge } from "@/components/decisions/Badges";
import { formatNumber, formatRelative } from "@/lib/utils";
import { Plus, Search } from "lucide-react";

export const dynamic = "force-dynamic";

const OUTCOMES: DecisionOutcome[] = ["approved", "rejected", "flagged", "pending", "overridden"];
const RISKS: RiskLevel[] = ["low", "medium", "high", "critical"];

interface PageProps {
  searchParams: { q?: string; outcome?: string; risk?: string; page?: string };
}

const PAGE_SIZE = 20;

export default async function DecisionsPage({ searchParams }: PageProps) {
  const supabase = createClient();

  const q = (searchParams.q || "").trim();
  const outcomeFilter = searchParams.outcome;
  const riskFilter = searchParams.risk;
  const page = Math.max(1, Number(searchParams.page) || 1);

  let query = supabase
    .from("decisions")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (q) {
    query = query.or(
      `decision_type.ilike.%${q}%,model_name.ilike.%${q}%,prompt.ilike.%${q}%,agent_name.ilike.%${q}%`
    );
  }
  if (outcomeFilter && OUTCOMES.includes(outcomeFilter as DecisionOutcome)) {
    query = query.eq("outcome", outcomeFilter);
  }
  if (riskFilter && RISKS.includes(riskFilter as RiskLevel)) {
    query = query.eq("risk_level", riskFilter);
  }

  query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  const { data, count } = await query;
  const decisions = (data ?? []) as Decision[];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-azure-500">Ledger</div>
          <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Decisions
          </h1>
          <p className="mt-2 text-ink-700/80">
            {formatNumber(total)} {total === 1 ? "record" : "records"} · scoped to your workspace
          </p>
        </div>
        <Link
          href="/decisions/new"
          className="inline-flex items-center gap-2 rounded-full bg-azure-500 px-4 py-2.5 text-sm font-medium text-white shadow-glow transition hover:bg-azure-400"
        >
          <Plus className="h-4 w-4" />
          Log decision
        </Link>
      </div>

      <form
        method="get"
        className="mt-8 flex flex-wrap gap-3 rounded-2xl border border-ink-900/10 bg-white/80 p-3 shadow-card backdrop-blur"
      >
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-700/50" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search type, model, prompt, agent…"
            className="w-full rounded-xl border border-ink-900/5 bg-paper-50 px-9 py-2.5 text-sm outline-none transition focus:border-azure-300 focus:ring-2 focus:ring-azure-200"
          />
        </div>
        <Select name="outcome" value={outcomeFilter} placeholder="All outcomes" options={OUTCOMES} />
        <Select name="risk" value={riskFilter} placeholder="All risk levels" options={RISKS} />
        <button
          type="submit"
          className="rounded-full bg-ink-900 px-4 py-2 text-sm font-medium text-paper-50 transition hover:bg-azure-500"
        >
          Apply
        </button>
        {(q || outcomeFilter || riskFilter) && (
          <Link
            href="/decisions"
            className="rounded-full border border-ink-900/10 px-4 py-2 text-sm text-ink-800 transition hover:border-azure-300"
          >
            Clear
          </Link>
        )}
      </form>

      <div className="mt-6 overflow-hidden rounded-2xl border border-ink-900/10 bg-white/80 shadow-card backdrop-blur">
        {decisions.length === 0 ? (
          <div className="px-6 py-20 text-center">
            <div className="font-display text-2xl">Nothing here yet.</div>
            <p className="mt-2 text-sm text-ink-700/70">
              Adjust your filters or log a new decision.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden grid-cols-12 gap-4 border-b border-ink-900/10 bg-paper-100/60 px-6 py-3 text-xs uppercase tracking-wider text-ink-700/60 md:grid">
              <div className="col-span-4">Type · model</div>
              <div className="col-span-3">Prompt</div>
              <div className="col-span-1">Risk</div>
              <div className="col-span-2">Outcome</div>
              <div className="col-span-1 text-right">Conf.</div>
              <div className="col-span-1 text-right">When</div>
            </div>
            <div className="divide-y divide-ink-900/5">
              {decisions.map((d) => (
                <Link
                  key={d.id}
                  href={`/decisions/${d.id}`}
                  className="grid grid-cols-1 gap-3 px-6 py-4 transition hover:bg-azure-50/50 md:grid-cols-12 md:items-center md:gap-4"
                >
                  <div className="md:col-span-4">
                    <div className="font-medium text-ink-900">{d.decision_type}</div>
                    <div className="mt-0.5 truncate font-mono text-xs text-ink-700/70">
                      {d.model_name}
                      {d.model_version ? ` @${d.model_version}` : ""}
                      {d.agent_name ? ` · ${d.agent_name}` : ""}
                    </div>
                  </div>
                  <div className="truncate text-sm text-ink-700/85 md:col-span-3">
                    {d.prompt || <span className="text-ink-700/40">—</span>}
                  </div>
                  <div className="md:col-span-1">
                    <RiskBadge level={d.risk_level} />
                  </div>
                  <div className="md:col-span-2">
                    <OutcomeBadge outcome={d.outcome} />
                  </div>
                  <div className="font-mono text-xs text-ink-700/80 md:col-span-1 md:text-right numeric-tabular">
                    {d.confidence !== null ? Number(d.confidence).toFixed(3) : "—"}
                  </div>
                  <div className="text-xs text-ink-700/70 md:col-span-1 md:text-right">
                    {formatRelative(d.created_at)}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm">
          <div className="text-ink-700/70">
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <Link
                href={buildPageHref(searchParams, page - 1)}
                className="rounded-full border border-ink-900/10 px-4 py-2 hover:border-azure-300"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={buildPageHref(searchParams, page + 1)}
                className="rounded-full bg-ink-900 px-4 py-2 text-paper-50 hover:bg-azure-500"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Select({
  name,
  value,
  options,
  placeholder,
}: {
  name: string;
  value: string | undefined;
  options: string[];
  placeholder: string;
}) {
  return (
    <select
      name={name}
      defaultValue={value || ""}
      className="rounded-xl border border-ink-900/5 bg-paper-50 px-3 py-2.5 text-sm outline-none transition focus:border-azure-300 focus:ring-2 focus:ring-azure-200"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o[0].toUpperCase() + o.slice(1)}
        </option>
      ))}
    </select>
  );
}

function buildPageHref(
  current: { q?: string; outcome?: string; risk?: string },
  page: number
) {
  const params = new URLSearchParams();
  if (current.q) params.set("q", current.q);
  if (current.outcome) params.set("outcome", current.outcome);
  if (current.risk) params.set("risk", current.risk);
  params.set("page", String(page));
  return `/decisions?${params.toString()}`;
}
