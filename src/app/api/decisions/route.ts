import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/mysql/auth";
import { query } from "@/lib/mysql/db";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const id = uuidv4();

  const {
    decision_type, model_name, model_version, agent_name,
    prompt, response, outcome, risk_level, confidence,
    latency_ms, tokens_input, tokens_output, cost_usd, tags, metadata,
  } = body;

  await query(
    `INSERT INTO decisions (
      id, user_id, decision_type, model_name, model_version, agent_name,
      prompt, response, outcome, risk_level, confidence, latency_ms,
      tokens_input, tokens_output, cost_usd, tags, metadata
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, user.id, decision_type, model_name, model_version || null, agent_name || null,
      prompt || null, response || null, outcome || "pending", risk_level || "low",
      confidence ?? null, latency_ms ?? null, tokens_input ?? null, tokens_output ?? null,
      cost_usd ?? null,
      tags ? JSON.stringify(tags) : null,
      metadata ? JSON.stringify(metadata) : null,
    ]
  );

  // Log creation event
  await query(
    "INSERT INTO decision_events (id, decision_id, actor_id, action, details) VALUES (?, ?, ?, ?, ?)",
    [uuidv4(), id, user.id, "decision.created", JSON.stringify({ outcome, risk_level, model_name })]
  );

  return NextResponse.json({ id });
}
