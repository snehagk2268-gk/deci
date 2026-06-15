import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/mysql/auth";
import { query } from "@/lib/mysql/db";

export const dynamic = "force-dynamic";

function escapeCSV(val: unknown): string {
  if (val === null || val === undefined) return "";
  const str = typeof val === "object" ? JSON.stringify(val) : String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const outcome = searchParams.get("outcome");
  const risk = searchParams.get("risk");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const format = searchParams.get("format") || "csv";

  let whereClauses = ["user_id = ?"];
  let params: any[] = [user.id];

  if (outcome) { whereClauses.push("outcome = ?"); params.push(outcome); }
  if (risk) { whereClauses.push("risk_level = ?"); params.push(risk); }
  if (from) { whereClauses.push("created_at >= ?"); params.push(from); }
  if (to) { whereClauses.push("created_at <= ?"); params.push(to); }

  params.push(10000);
  const decisions = await query(
    `SELECT * FROM decisions WHERE ${whereClauses.join(" AND ")} ORDER BY created_at DESC LIMIT ?`,
    params
  );

  const timestamp = new Date().toISOString().slice(0, 10);

  if (format === "json") {
    return new NextResponse(JSON.stringify(decisions, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="decitrace-report-${timestamp}.json"`,
      },
    });
  }

  const headers = ["id","created_at","model_name","model_version","agent_name","decision_type","outcome","risk_level","confidence","latency_ms","tokens_input","tokens_output","cost_usd","tags","prompt","response","reviewer_notes","reviewed_at"];
  const rows = decisions.map((d: any) =>
    headers.map((h) => escapeCSV(d[h])).join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="decitrace-report-${timestamp}.csv"`,
    },
  });
}
