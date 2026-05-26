"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function NewDecisionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    decision_type: "",
    model_name: "",
    model_version: "",
    agent_name: "",
    prompt: "",
    response: "",
    outcome: "pending",
    risk_level: "low",
    confidence: "",
    latency_ms: "",
    tokens_input: "",
    tokens_output: "",
    cost_usd: "",
    tags: "",
    metadata: "",
  });

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Not signed in.");
      setLoading(false);
      return;
    }

    let metadata: object | null = null;
    if (form.metadata.trim()) {
      try {
        metadata = JSON.parse(form.metadata);
      } catch {
        setError("Metadata must be valid JSON.");
        setLoading(false);
        return;
      }
    }

    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      user_id: user.id,
      decision_type: form.decision_type,
      model_name: form.model_name,
      model_version: form.model_version || null,
      agent_name: form.agent_name || null,
      prompt: form.prompt || null,
      response: form.response || null,
      outcome: form.outcome,
      risk_level: form.risk_level,
      confidence: form.confidence ? Number(form.confidence) : null,
      latency_ms: form.latency_ms ? Number(form.latency_ms) : null,
      tokens_input: form.tokens_input ? Number(form.tokens_input) : null,
      tokens_output: form.tokens_output ? Number(form.tokens_output) : null,
      cost_usd: form.cost_usd ? Number(form.cost_usd) : null,
      tags: tags.length ? tags : null,
      metadata,
    };

    const { data, error: err } = await supabase
      .from("decisions")
      .insert(payload)
      .select("id")
      .single();

    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push(`/decisions/${data.id}`);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/decisions"
        className="inline-flex items-center gap-2 text-sm text-ink-700 hover:text-azure-500"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to decisions
      </Link>

      <div className="mt-4">
        <div className="text-xs uppercase tracking-[0.18em] text-azure-500">New record</div>
        <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight md:text-5xl">
          Log a decision
        </h1>
        <p className="mt-2 text-ink-700/80">
          Capture the inputs, outputs, and conditions of an AI decision for the audit ledger.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-6 rounded-2xl border border-ink-900/10 bg-white/80 p-6 shadow-card backdrop-blur"
      >
        <Section title="Identity">
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Decision type"
              required
              value={form.decision_type}
              onChange={(e) => set("decision_type", e.target.value)}
              placeholder="content_moderation, loan_approval, …"
            />
            <Field
              label="Agent / system"
              value={form.agent_name}
              onChange={(e) => set("agent_name", e.target.value)}
              placeholder="support-bot-v3"
            />
            <Field
              label="Model name"
              required
              value={form.model_name}
              onChange={(e) => set("model_name", e.target.value)}
              placeholder="gpt-4, claude-opus, llama-3.1-70b"
            />
            <Field
              label="Model version"
              value={form.model_version}
              onChange={(e) => set("model_version", e.target.value)}
              placeholder="2026-04-15"
            />
          </div>
        </Section>

        <Section title="Content">
          <Textarea
            label="Prompt / input"
            value={form.prompt}
            onChange={(e) => set("prompt", e.target.value)}
            placeholder="The user query or input that triggered the decision…"
            rows={4}
          />
          <Textarea
            label="Response / output"
            value={form.response}
            onChange={(e) => set("response", e.target.value)}
            placeholder="The model's response or chosen action…"
            rows={4}
          />
        </Section>

        <Section title="Classification">
          <div className="grid gap-4 md:grid-cols-2">
            <SelectField
              label="Outcome"
              value={form.outcome}
              onChange={(e) => set("outcome", e.target.value)}
              options={[
                { value: "approved", label: "Approved" },
                { value: "rejected", label: "Rejected" },
                { value: "flagged", label: "Flagged" },
                { value: "pending", label: "Pending" },
                { value: "overridden", label: "Overridden" },
              ]}
            />
            <SelectField
              label="Risk level"
              value={form.risk_level}
              onChange={(e) => set("risk_level", e.target.value)}
              options={[
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
                { value: "critical", label: "Critical" },
              ]}
            />
          </div>
        </Section>

        <Section title="Performance">
          <div className="grid gap-4 md:grid-cols-3">
            <Field
              label="Confidence (0–1)"
              type="number"
              step="0.001"
              min="0"
              max="1"
              value={form.confidence}
              onChange={(e) => set("confidence", e.target.value)}
              placeholder="0.873"
            />
            <Field
              label="Latency (ms)"
              type="number"
              min="0"
              value={form.latency_ms}
              onChange={(e) => set("latency_ms", e.target.value)}
              placeholder="412"
            />
            <Field
              label="Cost (USD)"
              type="number"
              step="0.000001"
              min="0"
              value={form.cost_usd}
              onChange={(e) => set("cost_usd", e.target.value)}
              placeholder="0.0042"
            />
            <Field
              label="Tokens in"
              type="number"
              min="0"
              value={form.tokens_input}
              onChange={(e) => set("tokens_input", e.target.value)}
              placeholder="312"
            />
            <Field
              label="Tokens out"
              type="number"
              min="0"
              value={form.tokens_output}
              onChange={(e) => set("tokens_output", e.target.value)}
              placeholder="89"
            />
          </div>
        </Section>

        <Section title="Metadata">
          <Field
            label="Tags (comma separated)"
            value={form.tags}
            onChange={(e) => set("tags", e.target.value)}
            placeholder="finance, kyc, eu-region"
          />
          <Textarea
            label="Metadata (JSON)"
            value={form.metadata}
            onChange={(e) => set("metadata", e.target.value)}
            placeholder='{"session_id": "abc-123", "rule_set": "v2"}'
            rows={4}
            mono
          />
        </Section>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2">
          <Link
            href="/decisions"
            className="rounded-full border border-ink-900/10 px-4 py-2 text-sm text-ink-800 hover:border-azure-300"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full bg-azure-500 px-5 py-2.5 text-sm font-medium text-white shadow-glow transition hover:bg-azure-400 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save decision
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4 border-b border-ink-900/5 pb-6 last:border-b-0 last:pb-0">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-700/70">
        {title}
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-700/70">
        {label}
      </span>
      <input
        {...props}
        className="w-full rounded-xl border border-ink-900/10 bg-paper-50 px-3 py-2.5 text-sm outline-none transition focus:border-azure-300 focus:ring-2 focus:ring-azure-200"
      />
    </label>
  );
}

function Textarea({
  label,
  mono,
  ...props
}: { label: string; mono?: boolean } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-700/70">
        {label}
      </span>
      <textarea
        {...props}
        className={`w-full rounded-xl border border-ink-900/10 bg-paper-50 px-3 py-2.5 text-sm outline-none transition focus:border-azure-300 focus:ring-2 focus:ring-azure-200 ${
          mono ? "font-mono text-xs" : ""
        }`}
      />
    </label>
  );
}

function SelectField({
  label,
  options,
  ...props
}: {
  label: string;
  options: { value: string; label: string }[];
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-700/70">
        {label}
      </span>
      <select
        {...props}
        className="w-full rounded-xl border border-ink-900/10 bg-paper-50 px-3 py-2.5 text-sm outline-none transition focus:border-azure-300 focus:ring-2 focus:ring-azure-200"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
