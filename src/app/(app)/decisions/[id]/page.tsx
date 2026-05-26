import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Cpu, Coins, Gauge, Hash } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Decision, DecisionAuditEvent } from "@/types";
import { OutcomeBadge, RiskBadge } from "@/components/decisions/Badges";
import { ReviewPanel } from "@/components/decisions/ReviewPanel";
import { formatCurrency, formatNumber, formatRelative } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DecisionDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: decision } = await supabase
    .from("decisions")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!decision) notFound();

  const d = decision as Decision;

  const { data: events } = await supabase
    .from("decision_events")
    .select("*")
    .eq("decision_id", params.id)
    .order("created_at", { ascending: false });

  const auditEvents = (events ?? []) as DecisionAuditEvent[];

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        href="/decisions"
        className="inline-flex items-center gap-2 text-sm text-ink-700 hover:text-azure-500"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to decisions
      </Link>

      <div className="mt-4 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-azure-500">
            <Hash className="h-3 w-3" />
            <span className="font-mono">{d.id.slice(0, 8)}</span>
          </div>
          <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            {d.decision_type}
          </h1>
          <p className="mt-2 font-mono text-sm text-ink-700/80">
            {d.model_name}
            {d.model_version ? ` @${d.model_version}` : ""}
            {d.agent_name ? ` · ${d.agent_name}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RiskBadge level={d.risk_level} />
          <OutcomeBadge outcome={d.outcome} />
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          <Card title="Prompt">
            {d.prompt ? (
              <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-ink-800">
                {d.prompt}
              </pre>
            ) : (
              <Empty />
            )}
          </Card>

          <Card title="Response">
            {d.response ? (
              <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-ink-800">
                {d.response}
              </pre>
            ) : (
              <Empty />
            )}
          </Card>

          {d.metadata && (
            <Card title="Metadata">
              <pre className="overflow-x-auto rounded-lg bg-ink-950 p-4 font-mono text-xs text-paper-100">
                {JSON.stringify(d.metadata, null, 2)}
              </pre>
            </Card>
          )}

          <Card title="Audit trail">
            {auditEvents.length === 0 ? (
              <p className="text-sm text-ink-700/70">
                No events yet. Initial creation event will appear automatically once the trigger is
                applied.
              </p>
            ) : (
              <ol className="relative space-y-5 border-l border-azure-200 pl-6">
                {auditEvents.map((e) => (
                  <li key={e.id} className="relative">
                    <span className="absolute -left-[27px] top-1.5 inline-block h-3 w-3 rounded-full bg-azure-500 ring-4 ring-paper-50" />
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="font-medium text-ink-900">{e.action}</span>
                      <span className="text-xs text-ink-700/60">{formatRelative(e.created_at)}</span>
                    </div>
                    {e.details && (
                      <pre className="mt-2 overflow-x-auto rounded-md border border-ink-900/5 bg-paper-100 p-2 font-mono text-xs text-ink-800">
                        {JSON.stringify(e.details, null, 2)}
                      </pre>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <Card title="Performance">
            <ul className="divide-y divide-ink-900/5">
              <Stat
                icon={<Gauge className="h-4 w-4" />}
                label="Confidence"
                value={d.confidence !== null ? Number(d.confidence).toFixed(3) : "—"}
              />
              <Stat
                icon={<Clock className="h-4 w-4" />}
                label="Latency"
                value={d.latency_ms !== null ? `${formatNumber(d.latency_ms)} ms` : "—"}
              />
              <Stat
                icon={<Cpu className="h-4 w-4" />}
                label="Tokens"
                value={
                  d.tokens_input !== null || d.tokens_output !== null
                    ? `${formatNumber(d.tokens_input ?? 0)} in / ${formatNumber(d.tokens_output ?? 0)} out`
                    : "—"
                }
              />
              <Stat
                icon={<Coins className="h-4 w-4" />}
                label="Cost"
                value={d.cost_usd !== null ? formatCurrency(Number(d.cost_usd)) : "—"}
              />
            </ul>
          </Card>

          {d.tags && d.tags.length > 0 && (
            <Card title="Tags">
              <div className="flex flex-wrap gap-1.5">
                {d.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center rounded-full bg-azure-50 px-2.5 py-0.5 text-xs font-medium text-azure-500 ring-1 ring-inset ring-azure-200"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </Card>
          )}

          <ReviewPanel
            decisionId={d.id}
            currentOutcome={d.outcome}
            currentNotes={d.reviewer_notes ?? ""}
            reviewedAt={d.reviewed_at}
          />

          <Card title="Logged">
            <div className="text-sm">
              <div className="text-ink-700/70">{formatRelative(d.created_at)}</div>
              <div className="mt-1 font-mono text-xs text-ink-700/50">
                {new Date(d.created_at).toISOString()}
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-ink-900/10 bg-white/80 p-6 shadow-card backdrop-blur">
      <div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-ink-700/70">
        {title}
      </div>
      {children}
    </section>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <li className="flex items-center justify-between py-2.5">
      <span className="flex items-center gap-2 text-sm text-ink-700/80">
        <span className="text-azure-500">{icon}</span>
        {label}
      </span>
      <span className="font-mono text-sm text-ink-900 numeric-tabular">{value}</span>
    </li>
  );
}

function Empty() {
  return <p className="text-sm italic text-ink-700/50">No content recorded.</p>;
}
