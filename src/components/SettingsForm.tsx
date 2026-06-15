"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";

export function SettingsForm({
  email,
  initialName,
  initialOrg,
  role,
}: {
  email: string;
  initialName: string;
  initialOrg: string;
  role: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [org, setOrg] = useState(initialOrg);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setSaving(true);

    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: name || null, organization: org || null }),
    });

    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setErr(data.error || "Failed to save.");
      return;
    }
    setMsg("Saved.");
    router.refresh();
  }

  return (
    <form
      onSubmit={save}
      className="mt-8 space-y-5 rounded-2xl border border-ink-900/10 bg-white/80 p-6 shadow-card backdrop-blur"
    >
      <Field label="Email" value={email} readOnly />
      <Field
        label="Full name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ada Lovelace"
      />
      <Field
        label="Organization"
        value={org}
        onChange={(e) => setOrg(e.target.value)}
        placeholder="Acme AI"
      />
      <Field label="Role" value={role} readOnly mono />

      {err && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      )}
      {msg && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {msg}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-azure-500 px-5 py-2.5 text-sm font-medium text-white shadow-glow transition hover:bg-azure-400 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  mono,
  ...props
}: { label: string; mono?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-700/70">
        {label}
      </span>
      <input
        {...props}
        className={`w-full rounded-xl border border-ink-900/10 bg-paper-50 px-3 py-2.5 text-sm outline-none transition focus:border-azure-300 focus:ring-2 focus:ring-azure-200 ${
          props.readOnly ? "text-ink-700/70" : ""
        } ${mono ? "font-mono" : ""}`}
      />
    </label>
  );
}
