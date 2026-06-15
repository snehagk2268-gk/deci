import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/mysql/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileTopbar } from "@/components/layout/MobileTopbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="relative min-h-screen bg-[#D7DEF1] text-ink-900">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid-azure [background-size:48px_48px] opacity-30" />
        <div className="absolute inset-x-0 top-0 h-[300px] bg-radial-azure" />
      </div>
      <div className="flex">
        <Sidebar email={user.email ?? null} />
        <div className="min-h-screen flex-1">
          <MobileTopbar email={user.email ?? null} />
          <main className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
