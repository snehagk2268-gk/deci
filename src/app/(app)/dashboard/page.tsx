import Link from "next/link";
import { ArrowUpRight, Activity, AlertTriangle, ShieldCheck, Cpu } from "lucide-react";
import { getSessionUser } from "@/lib/mysql/auth";
import { query } from "@/lib/mysql/db";
import { formatNumber, formatRelative } from "@/lib/utils";
import { OutcomeBadge, RiskBadge } from "@/components/decisions/Badges";
import { TrendChart } from "@/components/charts/TrendChart";
import type { Decision } from "@/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getSessionUser();

  const recent = await query<Decision>(
    "SELECT * FROM decisions WHERE user_id = ? ORDER BY created_at DESC LIMIT 8",
    [user!.id]
  );

  const [{ total }] = await query<{ total: number }>(
    "SELECT COUNT(*) as total FROM decisions WHERE user_id = ?",
    [user!.id]
  );

  const [{ flagged }] = await query<{ flagged: number }>(
    "SELECT COUNT(*) as flagged FROM decisions WHERE user_id = ? AND outcome = 'flagged'",
    [user!.id]
  );

  const [{ approved }] = await query<{ approved: number }>(
    "SELECT COUNT(*) as approved FROM decisions WHERE user_id = ? AND outcome = 'approved'",
    [user!.id]
  );

  const confidenceRows = await query<{ confidence: number }>(
    "SELECT confidence FROM decisions WHERE user_id = ? AND confidence IS NOT NULL LIMIT 1000",
    [user!.id]
  );

  const avgConfidence =
    confidenceRows.length
      ? confidenceRows.reduce((s, r) => s + Number(r.confidence), 0) / confidenceRows.length
      : null;

  const trendRows = await query<{ created_at: string; outcome: string }>(
    "SELECT created_at, outcome FROM decisions WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY) ORDER BY created_at ASC",
    [user!.id]
  );

  const trend = buildTrend(trendRows);
  const greetingName = user?.full_name || user?.email?.split("@")[0] || "there";

  // Parse JSON tags for decisions
  const decisions = recent.map((d: any) => ({
    ...d,
    tags: typeof d.tags === "string" ? JSON.parse(d.tags || "null") : d.tags,
    metadata: typeof d.metadata === "string" ? JSON.parse(d.metadata || "null") : d.metadata,
  })) as Decision[];

  return (
    <div>
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-azure-500">Audit overview</div>
          <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Hello, {greetingName}.
          </h1>
          <p className="mt-2 max-w-xl text-ink-700/80">
            A live view of your AI decisions, their outcomes, and what needs your attention.
          </p>
        </div>
        <Link
          href="/decisions"
          className="inline-flex items-center gap-2 rounded-full border border-ink-900/10 bg-white/80 px-4 py-2 text-sm text-ink-800 backdrop-blur transition hover:border-azure-300"
        >
          Open ledger
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPI label="Total decisions" value={formatNumber(total ?? 0)} icon={<Activity className="h-4 w-4" />} accent="azure" delay="animate-fade-up-1" />
        <KPI label="Approved" value={formatNumber(approved ?? 0)} icon={<ShieldCheck className="h-4 w-4" />} accent="emerald" delay="animate-fade-up-2" />
        <KPI label="Flagged" value={formatNumber(flagged ?? 0)} icon={<AlertTriangle className="h-4 w-4" />} accent="amber" delay="animate-fade-up-3" />
        <KPI label="Avg confidence" value={avgConfidence !== null ? avgConfidence.toFixed(3) : "—"} icon={<Cpu className="h-4 w-4" />} accent="indigo" delay="animate-fade-up-4" />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-ink-900/10 bg-white/80 p-6 shadow-card backdrop-blur lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-ink-700/60">Last 14 days</div>
              <h2 className="mt-1 font-display text-xl font-semibold tracking-tight">Decision volume by outcome</h2>
            </div>
          </div>
          <div className="mt-6 h-72">
            <TrendChart data={trend} />
          </div>
        </div>

        <div className="rounded-2xl border border-azure-300/40 bg-gradient-to-br from-azure-500 via-azure-400 to-[#B1CFEB] p-6 text-white shadow-card">
          <div className="text-xs uppercase tracking-wider text-azure-100">Compliance posture</div>
          <h2 className="mt-1 font-display text-xl font-semibold tracking-tight">All systems on the record.</h2>
          <ul className="mt-5 space-y-3 text-sm">
            <li className="flex items-center justify-between border-b border-white/20 pb-2"><span>MySQL database</span><span className="font-mono text-azure-100">connected</span></li>
            <li className="flex items-center justify-between border-b border-white/20 pb-2"><span>Event log</span><span className="font-mono text-azure-100">append-only</span></li>
            <li className="flex items-center justify-between border-b border-white/20 pb-2"><span>Auth</span><span className="font-mono text-azure-100">JWT sessions</span></li>
            <li className="flex items-center justify-between"><span>Last export</span><span className="font-mono text-azure-100">never</span></li>
          </ul>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-ink-900/10 bg-white/80 shadow-card backdrop-blur">
        <div className="flex items-center justify-between border-b border-ink-900/10 px-6 py-4">
          <h2 className="font-display text-xl font-semibold tracking-tight">Recent decisions</h2>
          <Link href="/decisions" className="text-sm font-medium text-azure-500 hover:underline">See all</Link>
        </div>
        {decisions.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="font-display text-xl">No decisions yet.</div>
            <p className="mt-2 text-sm text-ink-700/70">Log your first decision to see it appear here.</p>
            <Link href="/decisions/new" className="mt-4 inline-flex items-center gap-2 rounded-full bg-azure-500 px-4 py-2 text-sm font-medium text-white">Log decision</Link>
          </div>
        ) : (
          <div className="divide-y divide-ink-900/5">
            {decisions.map((d) => (
              <Link key={d.id} href={`/decisions/${d.id}`} className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-azure-50/50">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-ink-700/70">
                    <span className="font-mono">{d.model_name}</span>
                    {d.model_version && <span className="font-mono text-ink-700/50">@{d.model_version}</span>}
                    <span>·</span>
                    <span>{formatRelative(d.created_at)}</span>
                  </div>
                  <div className="mt-1 truncate font-medium text-ink-900">{d.decision_type}</div>
                  {d.prompt && <div className="mt-0.5 truncate text-sm text-ink-700/70">{d.prompt}</div>}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <RiskBadge level={d.risk_level} />
                  <OutcomeBadge outcome={d.outcome} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function KPI({ label, value, icon, accent, delay = "" }: { label: string; value: string; icon: React.ReactNode; accent: "azure" | "emerald" | "amber" | "indigo"; delay?: string }) {
  const accents: Record<string, string> = {
    azure: "bg-azure-50 text-azure-500 ring-azure-100",
    emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    amber: "bg-amber-50 text-amber-600 ring-amber-100",
    indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100",
  };
  return (
    <div className={`${delay} rounded-2xl border border-ink-900/10 bg-white/80 p-5 shadow-card backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}>
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-ink-700/60">{label}</span>
        <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ring-1 ${accents[accent]}`}>{icon}</span>
      </div>
      <div className="mt-3 font-display text-3xl font-semibold tracking-tight numeric-tabular">{value}</div>
    </div>
  );
}

function buildTrend(rows: { created_at: string; outcome: string }[]) {
  const days: { date: string; approved: number; flagged: number; rejected: number; other: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push({ date: d.toISOString().slice(5, 10), approved: 0, flagged: 0, rejected: 0, other: 0 });
  }
  for (const r of rows) {
    const key = new Date(r.created_at).toISOString().slice(5, 10);
    const day = days.find((x) => x.date === key);
    if (!day) continue;
    if (r.outcome === "approved") day.approved += 1;
    else if (r.outcome === "flagged") day.flagged += 1;
    else if (r.outcome === "rejected") day.rejected += 1;
    else day.other += 1;
  }
  return days;
}
