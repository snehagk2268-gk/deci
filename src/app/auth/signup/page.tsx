"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Mail, Lock, User, Building2, ArrowRight } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [organization, setOrganization] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    const supabase = createClient();
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, organization },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    if (data.session) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setInfo("Check your email to confirm your account, then sign in.");
    }
  }

  return (
    <div>
      <div className="text-xs uppercase tracking-[0.18em] text-azure-500">Create workspace</div>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
        Start auditing in minutes.
      </h1>
      <p className="mt-3 text-ink-700/80">
        Already on DeciTrace?{" "}
        <Link href="/auth/login" className="font-medium text-azure-500 hover:underline">
          Sign in
        </Link>
        .
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Full name"
            icon={<User className="h-4 w-4" />}
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Ada Lovelace"
          />
          <Field
            label="Organization"
            icon={<Building2 className="h-4 w-4" />}
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            placeholder="Acme AI"
          />
        </div>
        <Field
          label="Email"
          icon={<Mail className="h-4 w-4" />}
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
        />
        <Field
          label="Password"
          icon={<Lock className="h-4 w-4" />}
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
        />

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        {info && (
          <div className="rounded-lg border border-azure-200 bg-azure-50 px-3 py-2 text-sm text-azure-500">
            {info}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink-900 px-5 py-3 text-sm font-medium text-paper-50 shadow-card transition hover:bg-azure-500 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Create account
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  icon,
  ...props
}: { label: string; icon: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-700/70">
        {label}
      </span>
      <span className="relative block">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-700/50">
          {icon}
        </span>
        <input
          {...props}
          className="w-full rounded-xl border border-ink-900/10 bg-white/80 px-9 py-3 text-sm shadow-card outline-none transition focus:border-azure-300 focus:ring-2 focus:ring-azure-200"
        />
      </span>
    </label>
  );
}
