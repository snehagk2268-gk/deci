"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ListChecks,
  PieChart,
  Settings,
  Plus,
  LogOut,
  FileDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/decisions", label: "Decisions", icon: ListChecks },
  { href: "/analytics", label: "Analytics", icon: PieChart },
  { href: "/reports", label: "Reports", icon: FileDown },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ email }: { email: string | null }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-ink-900/10 bg-white/70 p-5 backdrop-blur md:flex animate-slide-left">
      <Link href="/" className="flex items-center gap-2">
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
          <rect x="2" y="2" width="28" height="28" rx="8" fill="#5A85A9" />
          <path d="M8 22 C8 22 10 16 14 14 C18 12 18 18 22 16 C24 15 24 12 24 10" stroke="#D7DEF1" strokeWidth="2" strokeLinecap="round" fill="none"/>
          <circle cx="8" cy="22" r="2" fill="#F9E6E2"/>
          <circle cx="14" cy="14" r="1.5" fill="#D7DEF1"/>
          <circle cx="22" cy="16" r="1.5" fill="#D7DEF1"/>
          <circle cx="24" cy="10" r="2" fill="#F9E6E2"/>
        </svg>
        <span className="font-display text-xl font-semibold tracking-tight">DeciTrace</span>
      </Link>

      <Link
        href="/decisions/new"
        className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-azure-500 px-4 py-2.5 text-sm font-medium text-white shadow-glow transition hover:bg-azure-400"
      >
        <Plus className="h-4 w-4" />
        Log decision
      </Link>

      <nav className="mt-8 flex flex-col gap-1">
        {items.map((it) => {
          const Icon = it.icon;
          const active =
            pathname === it.href ||
            (it.href !== "/dashboard" && pathname.startsWith(it.href));
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-200",
                active
                  ? "bg-azure-500 text-white shadow-card"
                  : "text-ink-800 hover:bg-azure-100 hover:translate-x-1"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 transition",
                  active ? "text-azure-100" : "text-ink-700 group-hover:text-azure-500"
                )}
              />
              {it.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-ink-900/10 bg-paper-50 p-3">
        <div className="text-xs uppercase tracking-wider text-ink-700/60">Signed in</div>
        <div className="mt-0.5 truncate text-sm font-medium text-ink-900">
          {email || "—"}
        </div>
        <button
          onClick={signOut}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-ink-900/10 bg-white px-3 py-1.5 text-xs text-ink-800 transition hover:border-azure-300 hover:text-azure-500"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
