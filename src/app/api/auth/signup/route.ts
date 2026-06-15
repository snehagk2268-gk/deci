import { NextRequest, NextResponse } from "next/server";
import { signUp, createSessionToken, COOKIE_NAME } from "@/lib/mysql/auth";

export async function POST(req: NextRequest) {
  const { email, password, fullName, organization } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required." }, { status: 400 });
  }

  const { user, error } = await signUp(email, password, fullName, organization);
  if (error || !user) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const token = await createSessionToken(user);
  const res = NextResponse.json({ user });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return res;
}
