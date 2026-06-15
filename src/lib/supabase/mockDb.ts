import fs from "fs";
import path from "path";

const DB_FILE_PATH = path.join(process.cwd(), "supabase-mock-db.json");

export interface MockDb {
  profiles: any[];
  decisions: any[];
  decision_events: any[];
}

const DEFAULT_DB: MockDb = {
  profiles: [],
  decisions: [
    {
      id: "d1-claude-opus",
      user_id: "mock-user-id",
      model_name: "claude-opus",
      model_version: "4.7",
      agent_name: "support-router",
      decision_type: "ticket_classification",
      prompt: "Classify this support ticket into a category.",
      response: "billing",
      outcome: "approved",
      risk_level: "low",
      confidence: 0.94,
      latency_ms: 312,
      tokens_input: 412,
      tokens_output: 64,
      cost_usd: 0.00214,
      tags: ["support", "billing"],
      metadata: { channel: "email", queue: "tier1" },
      reviewer_notes: null,
      reviewed_by: null,
      reviewed_at: null,
      created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    },
    {
      id: "d2-gpt-4",
      user_id: "mock-user-id",
      model_name: "gpt-4",
      model_version: "2026-04-15",
      agent_name: "kyc-agent",
      decision_type: "identity_match",
      prompt: "Compare submitted ID to record on file.",
      response: "partial-match: 0.71",
      outcome: "flagged",
      risk_level: "high",
      confidence: 0.71,
      latency_ms: 980,
      tokens_input: 1820,
      tokens_output: 96,
      cost_usd: 0.00982,
      tags: ["kyc", "finance"],
      metadata: { region: "EU", rule_set: "v2" },
      reviewer_notes: null,
      reviewed_by: null,
      reviewed_at: null,
      created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    },
    {
      id: "d3-llama",
      user_id: "mock-user-id",
      model_name: "llama-3.1-70b",
      model_version: "",
      agent_name: "mod-bot",
      decision_type: "content_moderation",
      prompt: "Decide whether this comment violates policy.",
      response: "block",
      outcome: "approved",
      risk_level: "medium",
      confidence: 0.88,
      latency_ms: 218,
      tokens_input: 240,
      tokens_output: 12,
      cost_usd: 0.00038,
      tags: ["moderation"],
      metadata: { forum_id: "forum_42" },
      reviewer_notes: null,
      reviewed_by: null,
      reviewed_at: null,
      created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "d4-haiku",
      user_id: "mock-user-id",
      model_name: "claude-haiku",
      model_version: "4.5",
      agent_name: "autoreply",
      decision_type: "auto_reply",
      prompt: "Generate an apology to a customer about a delayed shipment.",
      response: "Hi Jane, I'm so sorry your order is late…",
      outcome: "rejected",
      risk_level: "medium",
      confidence: 0.62,
      latency_ms: 410,
      tokens_input: 520,
      tokens_output: 130,
      cost_usd: 0.00085,
      tags: ["support", "tone"],
      metadata: { reason: "tone_too_casual" },
      reviewer_notes: null,
      reviewed_by: null,
      reviewed_at: null,
      created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "d5-opus-risk",
      user_id: "mock-user-id",
      model_name: "claude-opus",
      model_version: "4.7",
      agent_name: "risk-engine",
      decision_type: "loan_decision",
      prompt: "Approve or deny loan based on profile.",
      response: "deny",
      outcome: "overridden",
      risk_level: "critical",
      confidence: 0.49,
      latency_ms: 1240,
      tokens_input: 2400,
      tokens_output: 60,
      cost_usd: 0.0118,
      tags: ["finance", "underwriting"],
      metadata: { applicant_age: 29 },
      reviewer_notes: "Manual override approved due to guarantor standing.",
      reviewed_by: "mock-user-id",
      reviewed_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
      created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    },
  ],
  decision_events: [
    {
      id: "e1",
      decision_id: "d1-claude-opus",
      actor_id: "mock-user-id",
      action: "decision.created",
      details: {
        outcome: "approved",
        risk_level: "low",
        model_name: "claude-opus",
        model_version: "4.7",
      },
      created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    },
    {
      id: "e2",
      decision_id: "d2-gpt-4",
      actor_id: "mock-user-id",
      action: "decision.created",
      details: {
        outcome: "flagged",
        risk_level: "high",
        model_name: "gpt-4",
        model_version: "2026-04-15",
      },
      created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    },
    {
      id: "e3",
      decision_id: "d3-llama",
      actor_id: "mock-user-id",
      action: "decision.created",
      details: {
        outcome: "approved",
        risk_level: "medium",
        model_name: "llama-3.1-70b",
        model_version: "",
      },
      created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "e4",
      decision_id: "d4-haiku",
      actor_id: "mock-user-id",
      action: "decision.created",
      details: {
        outcome: "rejected",
        risk_level: "medium",
        model_name: "claude-haiku",
        model_version: "4.5",
      },
      created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "e5",
      decision_id: "d5-opus-risk",
      actor_id: "mock-user-id",
      action: "decision.created",
      details: {
        outcome: "pending",
        risk_level: "critical",
        model_name: "claude-opus",
        model_version: "4.7",
      },
      created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "e6",
      decision_id: "d5-opus-risk",
      actor_id: "mock-user-id",
      action: "decision.updated",
      details: {
        outcome: { from: "pending", to: "overridden" },
        reviewer_notes_changed: true,
      },
      created_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    },
  ],
};

export function getDb(): MockDb {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const content = fs.readFileSync(DB_FILE_PATH, "utf-8");
      return JSON.parse(content);
    }
  } catch (error) {
    console.error("Error reading mock database:", error);
  }

  // Seed default DB
  saveDb(DEFAULT_DB);
  return DEFAULT_DB;
}

export function saveDb(db: MockDb): void {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing mock database:", error);
  }
}
