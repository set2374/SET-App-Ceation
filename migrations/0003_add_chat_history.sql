-- Migration: Add chat_history table for AI conversation tracking
-- Version: 2.0.1
-- Date: 2025-11-12

-- Create chat_history table for storing AI chat conversations
CREATE TABLE IF NOT EXISTS chat_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  matter_id INTEGER NOT NULL,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  bates_citations TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (matter_id) REFERENCES matters(id) ON DELETE CASCADE
);

-- Create index for fast matter-based queries
CREATE INDEX IF NOT EXISTS idx_chat_history_matter_id ON chat_history(matter_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON chat_history(created_at);
