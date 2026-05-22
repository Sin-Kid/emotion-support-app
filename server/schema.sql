-- MindCare Platform Database Schema
-- Run: psql -U postgres -d mindcare_db -f schema.sql

-- Create database (run separately if needed)
-- CREATE DATABASE mindcare_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(10) NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Survey results table
CREATE TABLE IF NOT EXISTS survey_results (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  responses JSONB NOT NULL,
  analysis_data JSONB NOT NULL,
  identified_problems TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Daily mood check-ins table
CREATE TABLE IF NOT EXISTS daily_checkins (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mood INTEGER NOT NULL CHECK (mood BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_survey_results_user_id ON survey_results(user_id);
CREATE INDEX IF NOT EXISTS idx_survey_results_created_at ON survey_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_id ON daily_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_created_at ON daily_checkins(created_at DESC);

-- Insert default admin user (password: admin123)
-- bcrypt hash of 'admin123' with 10 rounds
INSERT INTO users (username, password_hash, role)
VALUES ('admin', '$2b$10$BrOxQuDcnp2xM/ashBPeEesY.omJvfIKeolJk57VXoDfZ9jva83Gy', 'admin')
ON CONFLICT (username) DO NOTHING;
