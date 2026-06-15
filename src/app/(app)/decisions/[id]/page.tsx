import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/mysql/auth";
import { queryOne, query } from "@/lib/mysql/db";
import type { Decision, DecisionAuditEvent } from "@/types";
import { OutcomeBadge, RiskBadge } from "@/components/decisions/Badges";
import { ReviewPanel } from "@/components/decisions/ReviewPanel";
import { formatRelative } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DecisionDetailPage({ params }: { params: { id: string } }) {
  const user = await getSessionUser();

  const row = await queryOne<any>(
    "SELECT * FROM decisions WHERE id = ? AND user_id = ?",
    [params.id, user!.id]
  );

  if (!row) notFound();

  const decision: Decision = {
    ...row,
    tags: typeof row.tags === "string" ? JSON.parse(row.tags || "null") : row.tags,
    metadata: typeof row.metadata === "string" ? JSON.parse(row.metadata || "null") : row.metadata,
  };

  const events = await query<DecisionAuditEvent>(
    "SELECT * FROM decision_events WHERE decision_id = ? ORDER BY created_at ASC",
    [params.id]
  );

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-azure-500">Decision record</div>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight md:text-4xl">{decision.decision_type}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-ink-700/70">
            <span className="font-mono">{decision.model_name}{decision.model_version ? `@${decision.model_version}` : ""}</span>
            {decision.agent_name && <><span>·</span><span>{decision.agent_name}</span></>}
            <span>·</span>
            <span>{formatRelative(decision.created_at)}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <OutcomeBadge outcome={decision.outcome} />
            <RiskBadge level={decision.risk_level} />
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {decision.prompt && (
            <Card title="Prompt / Input">
              <p className="whitespace-pre-wrap text-sm text-ink-800">{decision.prompt}</p>
            </Card>
          )}
          {decision.response && (
            <Card title="Response / Output">
              <p className="whitespace-pre-wrap text-sm text-ink-800">{decision.response}</p>
            </Card>
          )}

          <Card title="Performance">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat label="Confidence" value={decision.confidence !== null ? Number(decision.confidence).toFixed(4) : "—"} />
              <Stat label="Latency" value={decision.latency_ms !== null ? `${decision.latency_ms}ms` : "—"} />
              <Stat label="Tokens in" value={decision.tokens_input !== null ? String(decision.tokens_input) : "—"} />
              <Stat label="Tokens out" value={decision.tokens_output !== null ? String(decision.tokens_output) : "—"} />
              <Stat label="Cost (USD)" value={decision.cost_usd !== null ? `$${Number(decision.cost_usd).toFixed(6)}` : "—"} />
            </div>
          </Card>

          {decision.tags && decision.tags.length > 0 && (
            <Card title="Tags">
              <div className="flex flex-wrap gap-2">
                {decision.tags.map((t) => (
                  <span key={t} className="rounded-full bg-azure-50 px-3 py-1 text-xs font-medium text-azure-500 ring-1 ring-azure-200">{t}</span>
                ))}
              </div>
            </Card>
          )}

          {decision.metadata && (
            <Card title="Metadata">
              <pre className="overflow-x-auto rounded-xl bg-paper-100 p-4 font-mono text-xs text-ink-800">{JSON.stringify(decision.metadata, null, 2)}</pre>
            </Card>
          )}

          <Card title="Audit trail">
            {events.length === 0 ? (
              <p className="text-sm text-ink-700/60">No events yet.</p>
            ) : (
              <div className="space-y-3">
                {events.map((ev: any) => (
                  <div key={ev.id} className="flex items-start gap-3 border-b border-ink-900/5 pb-3 last:border-0">
                    <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-azure-400" />
                    <div>
                      <div className="font-mono text-xs font-medium text-ink-900">{ev.action}</div>
                      <div className="text-xs text-ink-700/60">{formatRelative(ev.created_at)}</div>
                      {ev.details && (
                        <pre className="mt-1 rounded bg-paper-100 px-2 py-1 font-mono text-[10px] text-ink-700">
                          {JSON.stringify(typeof ev.details === "string" ? JSON.parse(ev.details) : ev.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div>
          <ReviewPanel
            decisionId={decision.id}
            currentOutcome={decision.outcome}
            reviewedAt={decision.reviewed_at}
          />
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-ink-900/10 bg-white/80 p-6 shadow-card backdrop-blur">
      <div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-ink-700/60">{title}</div>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-ink-700/60">{label}</div>
      <div className="mt-1 font-mono text-sm font-medium text-ink-900 numeric-tabular">{value}</div>
    </div>
  );
}
