export type DecisionOutcome = "approved" | "rejected" | "flagged" | "pending" | "overridden";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface Decision {
  id: string;
  user_id: string;
  model_name: string;
  model_version: string | null;
  agent_name: string | null;
  decision_type: string;
  prompt: string | null;
  response: string | null;
  outcome: DecisionOutcome;
  risk_level: RiskLevel;
  confidence: number | null;
  latency_ms: number | null;
  tokens_input: number | null;
  tokens_output: number | null;
  cost_usd: number | null;
  tags: string[] | null;
  metadata: Record<string, unknown> | null;
  reviewer_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface DecisionAuditEvent {
  id: string;
  decision_id: string;
  actor_id: string | null;
  action: string;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  organization: string | null;
  role: "admin" | "auditor" | "viewer";
  created_at: string;
}
