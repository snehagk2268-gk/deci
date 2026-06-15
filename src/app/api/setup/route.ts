import { NextResponse } from "next/server";
import pool from "@/lib/mysql/db";
import fs from "fs/promises";
import path from "path";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const seed = searchParams.get("seed") === "true";

    const conn = await pool.getConnection();

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS profiles (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        organization VARCHAR(255),
        role ENUM('admin','auditor','viewer') NOT NULL DEFAULT 'auditor',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS decisions (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        model_name VARCHAR(255) NOT NULL,
        model_version VARCHAR(255),
        agent_name VARCHAR(255),
        decision_type VARCHAR(255) NOT NULL,
        prompt TEXT,
        response TEXT,
        outcome ENUM('approved','rejected','flagged','pending','overridden') NOT NULL DEFAULT 'pending',
        risk_level ENUM('low','medium','high','critical') NOT NULL DEFAULT 'low',
        confidence DECIMAL(5,4),
        latency_ms INT,
        tokens_input INT,
        tokens_output INT,
        cost_usd DECIMAL(10,6),
        tags JSON,
        metadata JSON,
        reviewer_notes TEXT,
        reviewed_by VARCHAR(36),
        reviewed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_outcome (outcome),
        INDEX idx_risk_level (risk_level)
      )
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS decision_events (
        id VARCHAR(36) PRIMARY KEY,
        decision_id VARCHAR(36) NOT NULL,
        actor_id VARCHAR(36),
        action VARCHAR(255) NOT NULL,
        details JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_decision_id (decision_id)
      )
    `);

    if (seed) {
      const seedSqlPath = path.join(process.cwd(), "src/lib/mysql/seed.sql");
      const seedSql = await fs.readFile(seedSqlPath, "utf-8");
      const cleanedSql = seedSql
        .split("\n")
        .filter((line) => !line.trim().startsWith("--"))
        .join("\n");

      const statements = cleanedSql
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const statement of statements) {
        await conn.execute(statement);
      }
    }

    conn.release();
    return NextResponse.json({
      ok: true,
      message: seed
        ? "Database tables created and seeded successfully!"
        : "Database tables created successfully!",
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
