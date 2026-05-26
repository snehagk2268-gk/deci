import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl text-center">
      <div className="text-xs uppercase tracking-[0.18em] text-azure-500">404</div>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl">
        Decision not found.
      </h1>
      <p className="mt-3 text-ink-700/80">
        It may have been deleted, or you don't have access to it.
      </p>
      <Link
        href="/decisions"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-azure-500 px-5 py-2.5 text-sm font-medium text-white"
      >
        Back to decisions
      </Link>
    </div>
  );
}
