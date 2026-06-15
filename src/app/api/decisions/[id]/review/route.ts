import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/mysql/auth";
import { query } from "@/lib/mysql/db";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { outcome, notes } = await req.json();

  await query(
    "UPDATE decisions SET outcome = ?, reviewer_notes = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ? AND user_id = ?",
    [outcome, notes || null, user.id, params.id, user.id]
  );

  await query(
    "INSERT INTO decision_events (id, decision_id, actor_id, action, details) VALUES (?, ?, ?, ?, ?)",
    [uuidv4(), params.id, user.id, `review.${outcome}`, JSON.stringify({ outcome, notes: notes || null })]
  );

  return NextResponse.json({ ok: true });
}
