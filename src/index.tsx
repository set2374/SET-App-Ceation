import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { renderer } from './renderer'

type Bindings = {
  DB: D1Database
  DOCUMENTS: R2Bucket
  ANTHROPIC_API_KEY?: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// Use renderer middleware
app.use(renderer)

// Main dashboard route
app.get('/', (c) => {
  return c.render(
    <div class="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header class="bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg">
        <div class="px-6 py-4 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <h1 class="text-2xl font-bold">TLS eDiscovery Platform</h1>
              <p class="text-sm text-blue-200">Turman Legal Solutions PLLC</p>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <select id="matter-selector" class="bg-blue-800 text-white px-4 py-2 rounded-lg border border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="1">VitaQuest</option>
            </select>
            <div class="flex items-center space-x-2 bg-blue-800 px-4 py-2 rounded-lg">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
              </svg>
              <span class="font-medium">Stephen Turman</span>
            </div>
          </div>
        </div>
      </header>

      {/* Three-panel layout */}
      <div class="flex-1 flex overflow-hidden">
        {/* Left Panel - Document Library */}
        <div class="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div class="p-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-800 mb-3">Document Library</h2>
            
            {/* Upload Area */}
            <div class="mb-4">
              <label class="block w-full cursor-pointer">
                <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p class="mt-2 text-sm text-gray-600">Click to upload PDFs</p>
                  <p class="text-xs text-gray-500 mt-1">or drag and drop</p>
                </div>
                <input type="file" id="file-upload" class="hidden" accept=".pdf" multiple />
              </label>
            </div>

            {/* Search */}
            <div class="relative">
              <input 
                type="text" 
                id="search-input"
                placeholder="Search documents..." 
                class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Filter Tags */}
            <div class="mt-3 flex flex-wrap gap-2">
              <button class="filter-tag active" data-filter="all">
                All <span class="count">0</span>
              </button>
              <button class="filter-tag" data-filter="hot">
                🔥 Hot <span class="count">0</span>
              </button>
              <button class="filter-tag" data-filter="privileged">
                🛡️ Privileged <span class="count">0</span>
              </button>
              <button class="filter-tag" data-filter="bad">
                ⚠️ Bad <span class="count">0</span>
              </button>
            </div>
          </div>

          {/* Document List */}
          <div id="document-list" class="flex-1 overflow-y-auto p-4">
            <div class="text-center text-gray-500 py-12">
              <svg class="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p class="mt-4 text-sm">No documents uploaded</p>
              <p class="text-xs text-gray-400 mt-1">Upload PDFs to begin review</p>
            </div>
          </div>
        </div>

        {/* Center Panel - PDF Viewer */}
        <div class="flex-1 bg-gray-100 flex flex-col">
          <div class="bg-white border-b border-gray-200 p-3 flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <button id="prev-page" class="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button id="next-page" class="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <span id="page-info" class="text-sm text-gray-700">Page 1 of 1</span>
              <span id="bates-info" class="text-sm font-mono text-blue-700 bg-blue-50 px-3 py-1 rounded">-</span>
            </div>
            <div class="flex items-center space-x-2">
              <button id="zoom-out" class="p-2 rounded hover:bg-gray-100">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                </svg>
              </button>
              <button id="zoom-in" class="p-2 rounded hover:bg-gray-100">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </button>
            </div>
          </div>
          
          <div id="pdf-viewer" class="flex-1 overflow-auto p-6 flex items-center justify-center">
            <div class="text-center text-gray-500">
              <svg class="mx-auto h-24 w-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <p class="mt-4">Select a document to view</p>
            </div>
          </div>
        </div>

        {/* Right Panel - AI Analysis & Notes */}
        <div class="w-96 bg-white border-l border-gray-200 flex flex-col">
          <div class="border-b border-gray-200">
            <div class="flex">
              <button class="tab-button active" data-tab="analysis">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>AI Analysis</span>
              </button>
              <button class="tab-button" data-tab="notes">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Notes</span>
              </button>
              <button class="tab-button" data-tab="classifications">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span>Tags</span>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div class="flex-1 overflow-y-auto">
            {/* AI Analysis Tab */}
            <div id="analysis-tab" class="tab-content active p-4">
              <div class="text-center text-gray-500 py-12">
                <svg class="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <p class="mt-4 text-sm">Select a document for AI analysis</p>
                <p class="text-xs text-gray-400 mt-1">Powered by Claude Sonnet 4.5</p>
              </div>
            </div>

            {/* Notes Tab */}
            <div id="notes-tab" class="tab-content p-4 hidden">
              <button id="add-note-btn" class="w-full mb-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Note</span>
              </button>
              <div id="notes-list" class="space-y-3">
                <div class="text-center text-gray-500 py-8">
                  <p class="text-sm">No notes yet</p>
                </div>
              </div>
            </div>

            {/* Classifications Tab */}
            <div id="classifications-tab" class="tab-content p-4 hidden">
              <div class="space-y-3" id="classification-list">
                <div class="text-center text-gray-500 py-8">
                  <p class="text-sm">Select a document to add classifications</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

// Database initialization endpoint
app.get('/api/init-db', async (c) => {
  const { DB } = c.env
  
  try {
    // Check if tables exist
    const check = await DB.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='matters'
    `).first()
    
    if (check) {
      return c.json({ success: true, message: 'Database already initialized' })
    }
    
    // Initialize database with schema
    const schema = `
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
      
      CREATE TABLE IF NOT EXISTS classifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        color TEXT DEFAULT '#3b82f6',
        icon TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
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
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      INSERT INTO classifications (name, description, color, icon) VALUES
        ('Hot Document', 'Litigation-significant evidence critical to case strategy', '#ef4444', 'flame'),
        ('Privileged', 'Attorney-client privilege or work product protection', '#8b5cf6', 'shield'),
        ('Bad Document', 'Evidence potentially harmful to client position', '#f59e0b', 'alert-triangle'),
        ('Key Witness', 'Documents authored by or referencing critical witnesses', '#10b981', 'user'),
        ('Exhibit', 'Likely trial or deposition exhibit', '#3b82f6', 'file-text'),
        ('Needs Review', 'Requires senior attorney examination', '#6b7280', 'eye');
      
      INSERT INTO matters (name, description, bates_prefix, bates_format, next_bates_number) VALUES
        ('VitaQuest', 'VitaQuest litigation test matter', 'VQ', 'VQ-SEQUENCE', 1);
    `
    
    // Execute schema statements
    const statements = schema.split(';').filter(s => s.trim())
    for (const stmt of statements) {
      await DB.prepare(stmt).run()
    }
    
    return c.json({ success: true, message: 'Database initialized successfully' })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// API Routes
app.get('/api/matters', async (c) => {
  const { DB } = c.env
  try {
    const matters = await DB.prepare('SELECT * FROM matters ORDER BY created_at DESC').all()
    return c.json(matters.results || [])
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/api/documents', async (c) => {
  const { DB } = c.env
  const matterId = c.req.query('matter_id') || '1'
  
  try {
    const documents = await DB.prepare(`
      SELECT d.*
      FROM documents d
      WHERE d.matter_id = ?
      ORDER BY d.upload_date DESC
    `).bind(matterId).all()
    
    return c.json(documents.results || [])
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/api/classifications', async (c) => {
  const { DB } = c.env
  try {
    const classifications = await DB.prepare('SELECT * FROM classifications ORDER BY name').all()
    return c.json(classifications.results || [])
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

export default app
