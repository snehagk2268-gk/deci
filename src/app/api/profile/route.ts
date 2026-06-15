import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/mysql/auth";
import { query } from "@/lib/mysql/db";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { full_name, organization } = await req.json();

  await query(
    "UPDATE profiles SET full_name = ?, organization = ? WHERE id = ?",
    [full_name, organization, user.id]
  );

  return NextResponse.json({ ok: true });
}
