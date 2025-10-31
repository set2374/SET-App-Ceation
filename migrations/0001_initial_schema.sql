-- TLS eDiscovery Platform Database Schema

-- Matters table: Litigation matters/cases
CREATE TABLE IF NOT EXISTS matters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  bates_prefix TEXT NOT NULL,
  bates_format TEXT NOT NULL DEFAULT 'PREFIX-SEQUENCE',
  next_bates_number INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Documents table: Uploaded PDFs and their metadata
CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  matter_id INTEGER NOT NULL,
  filename TEXT NOT NULL,
  bates_start TEXT NOT NULL,
  bates_end TEXT NOT NULL,
  page_count INTEGER NOT NULL DEFAULT 1,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  text_extracted BOOLEAN DEFAULT FALSE,
  extracted_text TEXT,
  upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  review_status TEXT DEFAULT 'pending',
  reviewer_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (matter_id) REFERENCES matters(id) ON DELETE CASCADE
);

-- Document pages table: Individual pages with Bates numbers
CREATE TABLE IF NOT EXISTS document_pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id INTEGER NOT NULL,
  page_number INTEGER NOT NULL,
  bates_number TEXT NOT NULL UNIQUE,
  page_text TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

-- Classifications table: Hot Doc, Privileged, Bad Doc, etc.
CREATE TABLE IF NOT EXISTS classifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3b82f6',
  icon TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Document classifications: Many-to-many relationship
CREATE TABLE IF NOT EXISTS document_classifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id INTEGER NOT NULL,
  classification_id INTEGER NOT NULL,
  confidence_score REAL,
  ai_suggested BOOLEAN DEFAULT FALSE,
  attorney_confirmed BOOLEAN DEFAULT FALSE,
  justification TEXT,
  created_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  FOREIGN KEY (classification_id) REFERENCES classifications(id) ON DELETE CASCADE,
  UNIQUE(document_id, classification_id)
);

-- Notes table: Document-level and page-level annotations
CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id INTEGER NOT NULL,
  page_number INTEGER,
  bates_number TEXT,
  note_text TEXT NOT NULL,
  note_type TEXT DEFAULT 'general',
  ai_generated BOOLEAN DEFAULT FALSE,
  created_by TEXT DEFAULT 'Stephen Turman',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

-- Privilege log entries table
CREATE TABLE IF NOT EXISTS privilege_log_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id INTEGER NOT NULL,
  bates_number TEXT NOT NULL,
  document_date DATE,
  author TEXT,
  recipients TEXT,
  subject TEXT,
  privilege_type TEXT NOT NULL,
  description TEXT NOT NULL,
  created_by TEXT DEFAULT 'Stephen Turman',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

-- AI analysis results table
CREATE TABLE IF NOT EXISTS ai_analysis (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id INTEGER NOT NULL,
  analysis_type TEXT NOT NULL,
  ai_model TEXT NOT NULL DEFAULT 'claude-sonnet-4.5',
  result_data TEXT NOT NULL,
  confidence_score REAL,
  tokens_used INTEGER,
  analysis_cost REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

-- Audit trail table
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  details TEXT,
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_matter_id ON documents(matter_id);
CREATE INDEX IF NOT EXISTS idx_documents_bates_start ON documents(bates_start);
CREATE INDEX IF NOT EXISTS idx_documents_review_status ON documents(review_status);
CREATE INDEX IF NOT EXISTS idx_document_pages_bates ON document_pages(bates_number);
CREATE INDEX IF NOT EXISTS idx_document_pages_document_id ON document_pages(document_id);
CREATE INDEX IF NOT EXISTS idx_notes_document_id ON notes(document_id);
CREATE INDEX IF NOT EXISTS idx_notes_bates_number ON notes(bates_number);
CREATE INDEX IF NOT EXISTS idx_classifications_document_id ON document_classifications(document_id);
CREATE INDEX IF NOT EXISTS idx_privilege_log_document_id ON privilege_log_entries(document_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_document_id ON ai_analysis(document_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);

-- Insert default classifications
INSERT INTO classifications (name, description, color, icon) VALUES
  ('Hot Document', 'Litigation-significant evidence critical to case strategy', '#ef4444', 'flame'),
  ('Privileged', 'Attorney-client privilege or work product protection', '#8b5cf6', 'shield'),
  ('Bad Document', 'Evidence potentially harmful to client position', '#f59e0b', 'alert-triangle'),
  ('Key Witness', 'Documents authored by or referencing critical witnesses', '#10b981', 'user'),
  ('Exhibit', 'Likely trial or deposition exhibit', '#3b82f6', 'file-text'),
  ('Needs Review', 'Requires senior attorney examination', '#6b7280', 'eye');

-- Insert VitaQuest test matter
INSERT INTO matters (name, description, bates_prefix, bates_format, next_bates_number) VALUES
  ('VitaQuest', 'VitaQuest litigation test matter', 'VQ', 'VQ-SEQUENCE', 1);
