-- Migration: Add document_pages table for page-level text indexing
-- Version: 2.0.0
-- Date: 2025-11-01

-- Create document_pages table for storing page-level text with Bates numbers
CREATE TABLE IF NOT EXISTS document_pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id INTEGER NOT NULL,
  page_number INTEGER NOT NULL,
  bates_number TEXT NOT NULL,
  page_text TEXT,
  ocr_confidence REAL DEFAULT 1.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_document_pages_document_id ON document_pages(document_id);
CREATE INDEX IF NOT EXISTS idx_document_pages_bates_number ON document_pages(bates_number);
CREATE INDEX IF NOT EXISTS idx_document_pages_text_search ON document_pages(document_id, page_number);
