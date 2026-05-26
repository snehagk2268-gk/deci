import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative min-h-screen overflow-hidden text-ink-900"
      style={{ background: "#8fa8c0" }}
    >
      {/* Fluid wave background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 60% at 20% 30%, rgba(220,210,195,0.75) 0%, transparent 60%),
            radial-gradient(ellipse 60% 80% at 75% 70%, rgba(210,200,185,0.65) 0%, transparent 55%),
            radial-gradient(ellipse 50% 50% at 50% 10%, rgba(230,220,205,0.55) 0%, transparent 50%),
            radial-gradient(ellipse 70% 40% at 10% 80%, rgba(140,165,190,0.80) 0%, transparent 55%),
            radial-gradient(ellipse 55% 65% at 85% 20%, rgba(160,180,200,0.70) 0%, transparent 50%),
            radial-gradient(ellipse 40% 70% at 60% 50%, rgba(225,215,200,0.50) 0%, transparent 45%)
          `,
        }}
      />

      {/* Centered card */}
      <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo + tagline */}
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect x="2" y="2" width="28" height="28" rx="8" fill="#5A85A9" />
                <path d="M8 22 C8 22 10 16 14 14 C18 12 18 18 22 16 C24 15 24 12 24 10" stroke="#D7DEF1" strokeWidth="2" strokeLinecap="round" fill="none"/>
                <circle cx="8" cy="22" r="2" fill="#F9E6E2"/>
                <circle cx="14" cy="14" r="1.5" fill="#D7DEF1"/>
                <circle cx="22" cy="16" r="1.5" fill="#D7DEF1"/>
                <circle cx="24" cy="10" r="2" fill="#F9E6E2"/>
              </svg>
              <span className="font-display text-2xl font-semibold tracking-tight text-white drop-shadow">
                DeciTrace
              </span>
            </Link>
            <p className="mt-3 text-sm text-white/80 drop-shadow">
              Audit-grade tracking for every AI decision your organization makes.
            </p>
          </div>

          {/* Form card */}
          <div className="rounded-2xl bg-white/70 p-8 shadow-card backdrop-blur-md">
            {children}
          </div>

          <p className="mt-6 text-center text-xs text-white/60">
            © 2026 DeciTrace · audit-grade by default
          </p>
        </div>
      </div>
    </div>
  );
}
