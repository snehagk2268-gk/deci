import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Decision } from "@/types";

export const dynamic = "force-dynamic";

function escapeCSV(val: unknown): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCSV(decisions: Decision[]): string {
  const headers = [
    "id", "created_at", "model_name", "model_version", "agent_name",
    "decision_type", "outcome", "risk_level", "confidence",
    "latency_ms", "tokens_input", "tokens_output", "cost_usd",
    "tags", "prompt", "response", "reviewer_notes", "reviewed_at",
  ];

  const rows = decisions.map((d) =>
    [
      d.id,
      d.created_at,
      d.model_name,
      d.model_version,
      d.agent_name,
      d.decision_type,
      d.outcome,
      d.risk_level,
      d.confidence,
      d.latency_ms,
      d.tokens_input,
      d.tokens_output,
      d.cost_usd,
      (d.tags ?? []).join(";"),
      d.prompt,
      d.response,
      d.reviewer_notes,
      d.reviewed_at,
    ]
      .map(escapeCSV)
      .join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const outcome = searchParams.get("outcome");
  const risk = searchParams.get("risk");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const format = searchParams.get("format") || "csv";

  let query = supabase
    .from("decisions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10000);

  if (outcome) query = query.eq("outcome", outcome);
  if (risk) query = query.eq("risk_level", risk);
  if (from) query = query.gte("created_at", from);
  if (to) query = query.lte("created_at", to);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const decisions = (data ?? []) as Decision[];
  const timestamp = new Date().toISOString().slice(0, 10);

  if (format === "json") {
    return new NextResponse(JSON.stringify(decisions, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="decitrace-report-${timestamp}.json"`,
      },
    });
  }

  const csv = toCSV(decisions);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="decitrace-report-${timestamp}.csv"`,
    },
  });
}
