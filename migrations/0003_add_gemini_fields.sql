-- Migration: Add Gemini File Search integration fields
-- Version: 2.0.1
-- Date: 2025-11-12

-- Add Gemini File Search reference columns to documents table
ALTER TABLE documents ADD COLUMN gemini_document_name TEXT;
ALTER TABLE documents ADD COLUMN gemini_store_name TEXT;

-- Add matter-level Gemini store name
ALTER TABLE matters ADD COLUMN gemini_store_name TEXT;

-- Create chat_history table for AI conversation tracking
CREATE TABLE IF NOT EXISTS chat_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  matter_id INTEGER NOT NULL,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  bates_citations TEXT,
  model_used TEXT DEFAULT 'gemini-2.5-flash',
  tokens_used INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (matter_id) REFERENCES matters(id) ON DELETE CASCADE
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_chat_history_matter_id ON chat_history(matter_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON chat_history(created_at);
CREATE INDEX IF NOT EXISTS idx_documents_gemini_document ON documents(gemini_document_name);
