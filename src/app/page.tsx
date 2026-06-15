import Link from "next/link";
import { ArrowRight, GitBranch, LineChart, Lock, Database, Sparkles, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden text-ink-900" style={{ background: "#D7DEF1" }}>

      {/* Subtle grid overlay */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid-azure [background-size:48px_48px] opacity-30" />
      </div>

      {/* Nav */}
      <header className="relative z-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <Link href="/" className="flex items-center gap-2">
            <Logo />
            <span className="font-display text-xl font-semibold tracking-tight text-ink-900 drop-shadow">DeciTrace</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-ink-700 md:flex">
            <a href="#features" className="hover:text-[#5A85A9]">Features</a>
            <a href="#how" className="hover:text-[#5A85A9]">How it works</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="rounded-full px-4 py-2 text-sm text-ink-800 hover:text-[#5A85A9]">
              Sign in
            </Link>
            <Link href="/auth/signup" className="rounded-full bg-[#5A85A9] px-4 py-2 text-sm font-medium text-white shadow-card transition hover:bg-[#7aa3bf]">
              Start auditing
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-10 md:pt-16">
        <div className="flex flex-col items-center text-center">
          <div className="animate-scale-in inline-flex items-center gap-2 rounded-full border border-[#5A85A9]/30 bg-white/50 px-3 py-1 text-xs font-medium text-[#5A85A9] backdrop-blur-md">
            <span className="dot-pulse text-[#5A85A9]" />
            Live audit ledger · v1.0
          </div>
          <h1 className="animate-fade-up-1 mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-ink-900 md:text-7xl">
            Every AI decision,
            <br />
            <span className="italic text-[#5A85A9]">on the record.</span>
          </h1>
          <p className="animate-fade-up-2 mt-6 max-w-xl text-lg text-ink-700/85">
            DeciTrace is an audit-grade database for the choices your models make. Capture prompts,
            outcomes, risk, and review trails — searchable, reversible, defensible.
          </p>
          <div className="animate-fade-up-3 mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="group inline-flex items-center gap-2 rounded-full bg-[#5A85A9] px-5 py-3 text-sm font-medium text-white shadow-card transition hover:bg-[#7aa3bf]"
            >
              Create your audit workspace
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 rounded-full border border-[#5A85A9]/30 bg-white/50 px-5 py-3 text-sm font-medium text-ink-800 backdrop-blur transition hover:border-[#5A85A9]"
            >
              I already have an account
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 pb-24">
        <div className="flex items-end justify-between">
          <h2 className="animate-fade-up font-display text-3xl font-semibold tracking-tight text-ink-900 md:text-4xl">
            What you get out of the box
          </h2>
          <span className="hidden text-xs uppercase tracking-[0.18em] text-ink-700/60 md:block">
            01 — Capabilities
          </span>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <Feature icon={<Database className="h-5 w-5" />} title="Structured capture" body="Log prompts, responses, model versions, latency, cost, tokens, and arbitrary metadata against a typed schema." delay="-1" />
          <Feature icon={<GitBranch className="h-5 w-5" />} title="Review trails" body="Every override, flag, and approval is signed by a reviewer with full revision history kept in an event log." delay="-2" />
          <Feature icon={<LineChart className="h-5 w-5" />} title="Analytics" body="Slice by model, agent, risk, or tag. Watch outcome shifts over time and detect drift before it bites." delay="-3" />
          <Feature icon={<Lock className="h-5 w-5" />} title="Access control list" body="JWT-secured sessions scope data to the workspace. Roles for admin, auditor, and viewer ship by default." delay="-4" />
          <Feature icon={<Sparkles className="h-5 w-5" />} title="Risk classification" body="Tag decisions across four risk tiers and route critical items to mandatory human review." delay="-5" />
          <Feature icon={<Shield className="h-5 w-5" />} title="Defensible exports" body="Export filtered decision sets with embedded chain-of-custody metadata for regulators and counsel." delay="-5" />
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative z-10 mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-3xl border border-white/15 bg-white/10 p-10 backdrop-blur-md md:p-14">
          <span className="text-xs uppercase tracking-[0.18em] text-[#B1CFEB]">02 — Workflow</span>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight md:text-5xl">
            From <span className="italic text-[#B1CFEB]">decision</span> to{" "}
            <span className="italic text-[#B1CFEB]">defense</span>, in four steps.
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-4">
            {[
              { n: "01", t: "Capture", d: "Stream decisions from your agents via API or batch import." },
              { n: "02", t: "Classify", d: "Outcome, confidence, risk tier — auto-tagged on ingest." },
              { n: "03", t: "Review", d: "Human reviewers approve, override, or escalate flagged rows." },
              { n: "04", t: "Report", d: "Filter, export, and present a clean record on demand." },
            ].map((s) => (
              <div key={s.n} className="border-t border-white/20 pt-4">
                <div className="font-mono text-xs text-[#B1CFEB]">{s.n}</div>
                <div className="mt-2 font-display text-xl font-semibold">{s.t}</div>
                <p className="mt-2 text-sm text-white/70">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-[#5A85A9]/20 bg-white/30 py-8 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 text-sm text-ink-700/60 md:flex-row">
          <div className="flex items-center gap-2">
            <Logo />
            <span>© 2026 DeciTrace. All decisions accounted for.</span>
          </div>
          <span>Built on Next.js + MySQL</span>
        </div>
      </footer>
    </div>
  );
}

function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <rect x="2" y="2" width="28" height="28" rx="8" fill="#5A85A9" />
      <path d="M8 22 C8 22 10 16 14 14 C18 12 18 18 22 16 C24 15 24 12 24 10" stroke="#D7DEF1" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <circle cx="8" cy="22" r="2" fill="#F9E6E2"/>
      <circle cx="14" cy="14" r="1.5" fill="#D7DEF1"/>
      <circle cx="22" cy="16" r="1.5" fill="#D7DEF1"/>
      <circle cx="24" cy="10" r="2" fill="#F9E6E2"/>
    </svg>
  );
}

function Feature({ icon, title, body, delay = "" }: { icon: React.ReactNode; title: string; body: string; delay?: string }) {
  return (
    <div className={`animate-fade-up${delay} group rounded-2xl border border-white/60 bg-white/50 p-6 shadow-card backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-[#5A85A9]/50 hover:shadow-xl`}>
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#5A85A9]/15 text-[#5A85A9] ring-1 ring-[#5A85A9]/20 transition group-hover:bg-[#5A85A9] group-hover:text-white">
        {icon}
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold tracking-tight text-ink-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-700/80">{body}</p>
    </div>
  );
}
