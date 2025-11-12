// Batch migration script: Index existing documents to Gemini File Search
// This uploads all documents from R2 to Gemini and updates the database

import { uploadToGeminiFileSearch } from './src/gemini'

interface Document {
  id: number
  matter_id: number
  filename: string
  bates_start: string
  storage_path: string
  gemini_document_name: string | null
}

interface Matter {
  id: number
  name: string
  gemini_store_name: string | null
}

async function migrateDocumentsToGemini() {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY
  if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in environment')
    process.exit(1)
  }

  // Get D1 database connection (from wrangler dev environment)
  const D1_DATABASE_ID = 'ddfaefee-f71c-47c8-b729-de7c2ffedc65'
  
  console.log('🚀 Starting Gemini File Search migration...\n')
  
  // This script needs to be run via wrangler for D1 access
  console.log('⚠️  This script must be run manually via the API endpoint /api/migrate-to-gemini')
  console.log('⚠️  Use: curl -X POST http://localhost:3000/api/migrate-to-gemini\n')
  
  process.exit(0)
}

migrateDocumentsToGemini()
