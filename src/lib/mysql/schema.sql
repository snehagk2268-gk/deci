-- DeciTrace MySQL Schema

CREATE DATABASE IF NOT EXISTS railway;
USE railway;

CREATE TABLE IF NOT EXISTS profiles (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  organization VARCHAR(255),
  role ENUM('admin','auditor','viewer') NOT NULL DEFAULT 'auditor',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS decisions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
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
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at DESC),
  INDEX idx_outcome (outcome),
  INDEX idx_risk_level (risk_level),
  INDEX idx_model_name (model_name)
);

CREATE TABLE IF NOT EXISTS decision_events (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  decision_id VARCHAR(36) NOT NULL,
  actor_id VARCHAR(36),
  action VARCHAR(255) NOT NULL,
  details JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (decision_id) REFERENCES decisions(id) ON DELETE CASCADE,
  INDEX idx_decision_id (decision_id, created_at DESC)
);
