import { getSessionUser } from "@/lib/mysql/auth";
import { queryOne } from "@/lib/mysql/db";
import { SettingsForm } from "@/components/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getSessionUser();

  const profile = await queryOne<any>(
    "SELECT * FROM profiles WHERE id = ?",
    [user!.id]
  );

  return (
    <div className="mx-auto max-w-3xl">
      <div className="text-xs uppercase tracking-[0.18em] text-azure-500">Account</div>
      <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight md:text-5xl">Settings</h1>
      <p className="mt-2 text-ink-700/80">Profile information that appears on the audit trail.</p>

      <SettingsForm
        email={user!.email!}
        initialName={profile?.full_name ?? ""}
        initialOrg={profile?.organization ?? ""}
        role={profile?.role ?? "auditor"}
      />

      <div className="mt-6 rounded-2xl border border-azure-300/40 bg-gradient-to-br from-azure-500 via-azure-400 to-[#B1CFEB] p-6 text-white shadow-card">
        <div className="text-xs uppercase tracking-[0.18em] text-azure-100">Audit hygiene</div>
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">Your records are immutable.</h2>
        <p className="mt-2 text-sm text-white/80">Reviews, overrides, and edits are appended to the event log. Past records cannot be rewritten — that's the point of an audit ledger.</p>
      </div>
    </div>
  );
}
