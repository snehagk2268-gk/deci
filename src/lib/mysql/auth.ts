import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { query, queryOne } from "./db";
import { v4 as uuidv4 } from "uuid";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "decitrace-development-fallback-only-do-not-use-in-prod"
);

const COOKIE_NAME = "dt-session";

export interface SessionUser {
  id: string;
  email: string;
  full_name: string | null;
  organization: string | null;
  role: string;
}

export async function signUp(
  email: string,
  password: string,
  fullName: string,
  organization: string
): Promise<{ user: SessionUser | null; error: string | null }> {
  try {
    const existing = await queryOne("SELECT id FROM profiles WHERE email = ?", [email]);
    if (existing) return { user: null, error: "Email already registered." };

    const hash = await bcrypt.hash(password, 10);
    const id = uuidv4();

    await query(
      "INSERT INTO profiles (id, email, password_hash, full_name, organization) VALUES (?, ?, ?, ?, ?)",
      [id, email, hash, fullName || null, organization || null]
    );

    const user: SessionUser = { id, email, full_name: fullName, organization, role: "auditor" };
    return { user, error: null };
  } catch (e: any) {
    return { user: null, error: e.message };
  }
}

export async function signIn(
  email: string,
  password: string
): Promise<{ user: SessionUser | null; error: string | null }> {
  try {
    const row = await queryOne<any>(
      "SELECT id, email, password_hash, full_name, organization, role FROM profiles WHERE email = ?",
      [email]
    );
    if (!row) return { user: null, error: "Invalid email or password." };

    const valid = await bcrypt.compare(password, row.password_hash);
    if (!valid) return { user: null, error: "Invalid email or password." };

    const user: SessionUser = {
      id: row.id,
      email: row.email,
      full_name: row.full_name,
      organization: row.organization,
      role: row.role,
    };
    return { user, error: null };
  } catch (e: any) {
    return { user: null, error: e.message };
  }
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
