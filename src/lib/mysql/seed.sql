-- DeciTrace MySQL Seed Data

-- Insert a default auditor user (password is 'password')
INSERT INTO profiles (id, email, password_hash, full_name, organization, role)
VALUES (
  'd9bbfda6-5c5e-44cb-8a45-5d9c3bd0175b',
  'auditor@example.com',
  '$2a$10$Y145pXQx6eN05yU3Dk232e0o9T5nB7t8Sg/RjF7aWvAOmP9h4y',
  'Audit Officer',
  'Lattice Audit Corp',
  'auditor'
) ON DUPLICATE KEY UPDATE id=id;

-- Insert sample decisions
INSERT INTO decisions
  (id, user_id, model_name, model_version, agent_name, decision_type,
   prompt, response, outcome, risk_level, confidence,
   latency_ms, tokens_input, tokens_output, cost_usd, tags, metadata)
VALUES
  ('a8b9c0d1-1111-4222-8333-a4a5a6a7a8a9', 'd9bbfda6-5c5e-44cb-8a45-5d9c3bd0175b', 'claude-opus', '4.7', 'support-router', 'ticket_classification',
   'Classify this support ticket into a category.', 'billing',
   'approved', 'low', 0.9400, 312, 412, 64, 0.002140,
   '["support", "billing"]', '{"channel": "email", "queue": "tier1"}'),
  ('a8b9c0d2-2222-4222-8333-b4b5b6b7b8b9', 'd9bbfda6-5c5e-44cb-8a45-5d9c3bd0175b', 'gpt-4', '2026-04-15', 'kyc-agent', 'identity_match',
   'Compare submitted ID to record on file.', 'partial-match: 0.71',
   'flagged', 'high', 0.7100, 980, 1820, 96, 0.009820,
   '["kyc", "finance"]', '{"region": "EU", "rule_set": "v2"}'),
  ('a8b9c0d3-3333-4222-8333-c4c5c6c7c8c9', 'd9bbfda6-5c5e-44cb-8a45-5d9c3bd0175b', 'llama-3.1-70b', NULL, 'mod-bot', 'content_moderation',
   'Decide whether this comment violates policy.', 'block',
   'approved', 'medium', 0.8800, 218, 240, 12, 0.000380,
   '["moderation"]', '{"forum_id": "forum_42"}'),
  ('a8b9c0d4-4444-4222-8333-d4d5d6d7d8d9', 'd9bbfda6-5c5e-44cb-8a45-5d9c3bd0175b', 'claude-haiku', '4.5', 'autoreply', 'auto_reply',
   'Generate an apology to a customer about a delayed shipment.',
   'Hi Jane, I\'m so sorry your order is late…',
   'rejected', 'medium', 0.6200, 410, 520, 130, 0.000850,
   '["support", "tone"]', '{"reason": "tone_too_casual"}'),
  ('a8b9c0d5-5555-4222-8333-e4e5e6e7e8e9', 'd9bbfda6-5c5e-44cb-8a45-5d9c3bd0175b', 'claude-opus', '4.7', 'risk-engine', 'loan_decision',
   'Approve or deny loan based on profile.', 'deny',
   'overridden', 'critical', 0.4900, 1240, 2400, 60, 0.011800,
   '["finance", "underwriting"]', '{"applicant_age": 29}');

-- Insert initial events for decisions
INSERT INTO decision_events (id, decision_id, actor_id, action, details)
VALUES
  ('b1c2d3e4-1111-4222-8333-f4f5f6f7f8f9', 'a8b9c0d1-1111-4222-8333-a4a5a6a7a8a9', 'd9bbfda6-5c5e-44cb-8a45-5d9c3bd0175b', 'decision.created', '{"outcome": "approved", "risk_level": "low", "model_name": "claude-opus"}'),
  ('b1c2d3e4-2222-4222-8333-f4f5f6f7f8f9', 'a8b9c0d2-2222-4222-8333-b4b5b6b7b8b9', 'd9bbfda6-5c5e-44cb-8a45-5d9c3bd0175b', 'decision.created', '{"outcome": "flagged", "risk_level": "high", "model_name": "gpt-4"}'),
  ('b1c2d3e4-3333-4222-8333-f4f5f6f7f8f9', 'a8b9c0d3-3333-4222-8333-c4c5c6c7c8c9', 'd9bbfda6-5c5e-44cb-8a45-5d9c3bd0175b', 'decision.created', '{"outcome": "approved", "risk_level": "medium", "model_name": "llama-3.1-70b"}'),
  ('b1c2d3e4-4444-4222-8333-f4f5f6f7f8f9', 'a8b9c0d4-4444-4222-8333-d4d5d6d7d8d9', 'd9bbfda6-5c5e-44cb-8a45-5d9c3bd0175b', 'decision.created', '{"outcome": "rejected", "risk_level": "medium", "model_name": "claude-haiku"}'),
  ('b1c2d3e4-5555-4222-8333-f4f5f6f7f8f9', 'a8b9c0d5-5555-4222-8333-e4e5e6e7e8e9', 'd9bbfda6-5c5e-44cb-8a45-5d9c3bd0175b', 'decision.created', '{"outcome": "overridden", "risk_level": "critical", "model_name": "claude-opus"}');
