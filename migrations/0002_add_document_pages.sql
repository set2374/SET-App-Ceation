-- Migration: Add ocr_confidence column to document_pages table
-- Version: 2.0.0
-- Date: 2025-11-01

-- The document_pages table already exists from migration 0001
-- This migration adds the ocr_confidence column

-- Add ocr_confidence column to existing document_pages table
ALTER TABLE document_pages ADD COLUMN ocr_confidence REAL DEFAULT 1.0;
