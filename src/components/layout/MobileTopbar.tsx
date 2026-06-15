"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Plus, LogOut, LayoutDashboard, ListChecks, PieChart, Settings, FileDown } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/decisions", label: "Decisions", icon: ListChecks },
  { href: "/analytics", label: "Analytics", icon: PieChart },
  { href: "/reports", label: "Reports", icon: FileDown },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileTopbar({ email }: { email: string | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-ink-900/10 bg-paper-50/90 px-4 py-3 backdrop-blur md:hidden">
      <Link href="/dashboard" className="flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
          <rect x="2" y="2" width="28" height="28" rx="8" fill="#5A85A9" />
          <path d="M8 22 C8 22 10 16 14 14 C18 12 18 18 22 16 C24 15 24 12 24 10" stroke="#D7DEF1" strokeWidth="2" strokeLinecap="round" fill="none"/>
          <circle cx="8" cy="22" r="2" fill="#F9E6E2"/>
          <circle cx="14" cy="14" r="1.5" fill="#D7DEF1"/>
          <circle cx="22" cy="16" r="1.5" fill="#D7DEF1"/>
          <circle cx="24" cy="10" r="2" fill="#F9E6E2"/>
        </svg>
        <span className="font-display text-lg font-semibold">DeciTrace</span>
      </Link>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg p-2 text-ink-800 hover:bg-azure-50"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-0 flex h-full w-72 flex-col bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="font-display text-lg font-semibold">Menu</span>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 hover:bg-azure-50"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <Link
              href="/decisions/new"
              onClick={() => setOpen(false)}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-azure-500 px-4 py-2.5 text-sm font-medium text-white"
            >
              <Plus className="h-4 w-4" />
              Log decision
            </Link>
            <nav className="mt-6 flex flex-col gap-1">
              {items.map((it) => {
                const Icon = it.icon;
                const active =
                  pathname === it.href ||
                  (it.href !== "/dashboard" && pathname.startsWith(it.href));
                return (
                  <Link
                    key={it.href}
                    href={it.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm",
                      active ? "bg-azure-500 text-white" : "text-ink-800 hover:bg-azure-100"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {it.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-auto rounded-2xl border border-ink-900/10 bg-paper-50 p-3">
              <div className="text-xs uppercase tracking-wider text-ink-700/60">Signed in</div>
              <div className="mt-0.5 truncate text-sm font-medium">{email || "—"}</div>
              <button
                onClick={signOut}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-ink-900/10 bg-white px-3 py-1.5 text-xs"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
