-- ============================================================
-- Optional: seed sample decisions for the *currently signed-in user*.
-- Run this in the Supabase SQL editor while logged in as a normal user
-- in your app. (auth.uid() is set automatically when running through PostgREST;
-- in the SQL editor as a Supabase admin, replace auth.uid() with a specific
-- user UUID.)
-- ============================================================

insert into public.decisions
  (user_id, model_name, model_version, agent_name, decision_type,
   prompt, response, outcome, risk_level, confidence,
   latency_ms, tokens_input, tokens_output, cost_usd, tags, metadata)
values
  (auth.uid(), 'claude-opus', '4.7', 'support-router', 'ticket_classification',
   'Classify this support ticket into a category.', 'billing',
   'approved', 'low', 0.94, 312, 412, 64, 0.00214,
   array['support','billing'], '{"channel":"email","queue":"tier1"}'::jsonb),
  (auth.uid(), 'gpt-4', '2026-04-15', 'kyc-agent', 'identity_match',
   'Compare submitted ID to record on file.', 'partial-match: 0.71',
   'flagged', 'high', 0.71, 980, 1820, 96, 0.00982,
   array['kyc','finance'], '{"region":"EU","rule_set":"v2"}'::jsonb),
  (auth.uid(), 'llama-3.1-70b', null, 'mod-bot', 'content_moderation',
   'Decide whether this comment violates policy.', 'block',
   'approved', 'medium', 0.88, 218, 240, 12, 0.00038,
   array['moderation'], '{"forum_id":"forum_42"}'::jsonb),
  (auth.uid(), 'claude-haiku', '4.5', 'autoreply', 'auto_reply',
   'Generate an apology to a customer about a delayed shipment.',
   'Hi Jane, I''m so sorry your order is late…',
   'rejected', 'medium', 0.62, 410, 520, 130, 0.00085,
   array['support','tone'], '{"reason":"tone_too_casual"}'::jsonb),
  (auth.uid(), 'claude-opus', '4.7', 'risk-engine', 'loan_decision',
   'Approve or deny loan based on profile.', 'deny',
   'overridden', 'critical', 0.49, 1240, 2400, 60, 0.01180,
   array['finance','underwriting'], '{"applicant_age":29}'::jsonb);
