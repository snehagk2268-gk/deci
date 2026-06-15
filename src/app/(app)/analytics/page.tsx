import { getSessionUser } from "@/lib/mysql/auth";
import { query } from "@/lib/mysql/db";
import { OutcomeChart } from "@/components/charts/OutcomeChart";
import { RiskChart } from "@/components/charts/RiskChart";
import { ModelBarChart } from "@/components/charts/ModelBarChart";
import { formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const user = await getSessionUser();

  const decisions = await query<any>(
    "SELECT outcome, risk_level, model_name, model_version, confidence, latency_ms, cost_usd FROM decisions WHERE user_id = ? ORDER BY created_at DESC LIMIT 2000",
    [user!.id]
  );

  const [{ total }] = await query<{ total: number }>(
    "SELECT COUNT(*) as total FROM decisions WHERE user_id = ?",
    [user!.id]
  );

  const outcomeBuckets: Record<string, number> = {};
  const riskBuckets: Record<string, number> = {};
  const modelBuckets: Record<string, number> = {};
  let confSum = 0, confN = 0, latencySum = 0, latencyN = 0, costSum = 0;

  for (const d of decisions) {
    outcomeBuckets[d.outcome] = (outcomeBuckets[d.outcome] || 0) + 1;
    riskBuckets[d.risk_level] = (riskBuckets[d.risk_level] || 0) + 1;
    const mk = d.model_name + (d.model_version ? `@${d.model_version}` : "");
    modelBuckets[mk] = (modelBuckets[mk] || 0) + 1;
    if (d.confidence !== null) { confSum += Number(d.confidence); confN++; }
    if (d.latency_ms !== null) { latencySum += d.latency_ms; latencyN++; }
    if (d.cost_usd !== null) costSum += Number(d.cost_usd);
  }

  const outcomeData = Object.entries(outcomeBuckets).map(([name, value]) => ({ name, value }));
  const riskData = Object.entries(riskBuckets).map(([name, value]) => ({ name, value }));
  const modelData = Object.entries(modelBuckets).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);

  return (
    <div>
      <div>
        <div className="text-xs uppercase tracking-[0.18em] text-azure-500">Analytics</div>
        <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight md:text-5xl">Patterns in the ledger</h1>
        <p className="mt-2 max-w-2xl text-ink-700/80">
          Aggregates over your most recent {formatNumber(decisions.length)} decisions ({formatNumber(total ?? 0)} total).
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tile label="Decisions analyzed" value={formatNumber(decisions.length)} />
        <Tile label="Avg confidence" value={confN ? (confSum / confN).toFixed(3) : "—"} />
        <Tile label="Avg latency" value={latencyN ? `${Math.round(latencySum / latencyN)} ms` : "—"} />
        <Tile label="Total cost" value={costSum > 0 ? `$${costSum.toFixed(4)}` : "—"} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Section title="Outcomes"><div className="h-72"><OutcomeChart data={outcomeData} /></div></Section>
        <Section title="Risk distribution"><div className="h-72"><RiskChart data={riskData} /></div></Section>
      </div>

      <div className="mt-6">
        <Section title="Top models by volume"><div className="h-80"><ModelBarChart data={modelData} /></div></Section>
      </div>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-ink-900/10 bg-white/80 p-5 shadow-card backdrop-blur">
      <div className="text-xs uppercase tracking-wider text-ink-700/60">{label}</div>
      <div className="mt-2 font-display text-3xl font-semibold tracking-tight numeric-tabular">{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-ink-900/10 bg-white/80 p-6 shadow-card backdrop-blur">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-700/70">{title}</div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
