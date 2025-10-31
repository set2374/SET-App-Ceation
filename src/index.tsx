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

// Main dashboard route - NotebookLM-style interface
app.get('/', (c) => {
  return c.render(
    <div class="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header class="bg-white border-b border-gray-200 shadow-sm">
        <div class="px-6 py-3 flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <img src="/static/turman-logo.png" alt="Turman Legal Solutions" class="h-12 w-auto" />
            <div class="border-l border-gray-300 pl-4">
              <h1 class="text-xl font-semibold text-gray-900">eDiscovery Platform</h1>
              <p class="text-xs text-gray-500">AI-Powered Document Review</p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <select id="matter-selector" class="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="1">VitaQuest Matter</option>
            </select>
            <button id="create-matter-btn" class="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>New Matter</span>
            </button>
            <div class="flex items-center space-x-2 text-sm text-gray-700">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
              </svg>
              <span>Stephen Turman</span>
            </div>
          </div>
        </div>
      </header>

      {/* Three-panel NotebookLM layout */}
      <div class="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL - Sources & PDF Viewer (~25%) */}
        <div class="w-1/4 bg-white border-r border-gray-200 flex flex-col min-w-[300px] max-w-[400px]">
          {/* Sources Header */}
          <div class="p-4 border-b border-gray-200">
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-sm font-semibold text-gray-900">Sources</h2>
              <button id="add-source-btn" class="text-sm text-blue-600 hover:text-blue-700 font-medium">
                + Add source
              </button>
            </div>
            
            {/* Upload Area (hidden by default, shown when Add source clicked) */}
            <div id="upload-area" class="hidden mb-3">
              <label class="block w-full cursor-pointer">
                <div class="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors">
                  <svg class="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p class="mt-1 text-xs text-gray-600">Upload PDFs</p>
                </div>
                <input type="file" id="file-upload" class="hidden" accept=".pdf" multiple />
              </label>
            </div>

            {/* Search sources */}
            <div class="relative">
              <input 
                type="text" 
                id="source-search"
                placeholder="Search sources..." 
                class="w-full text-sm px-3 py-2 pl-9 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg class="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Sources List with Checkboxes */}
          <div id="sources-list" class="flex-1 overflow-y-auto p-3">
            <div class="text-center text-gray-500 py-12">
              <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p class="mt-3 text-sm">No sources yet</p>
              <p class="text-xs text-gray-400 mt-1">Upload PDFs to get started</p>
            </div>
          </div>

          {/* PDF Viewer (expandable overlay) */}
          <div id="pdf-overlay" class="hidden absolute inset-0 bg-white z-10 flex flex-col">
            <div class="p-3 border-b border-gray-200 flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <button id="close-pdf" class="p-1 hover:bg-gray-100 rounded">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <span id="pdf-title" class="text-sm font-medium text-gray-900">Document</span>
              </div>
              <span id="pdf-bates" class="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">VQ-000001</span>
            </div>
            <div id="pdf-content" class="flex-1 overflow-auto bg-gray-100 p-4">
              {/* PDF.js will render here */}
            </div>
          </div>
        </div>

        {/* CENTER PANEL - AI Chat (~50%) */}
        <div class="flex-1 bg-white flex flex-col">
          {/* Chat Header */}
          <div class="p-4 border-b border-gray-200">
            <div class="flex items-center space-x-2 mb-2">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h2 class="text-base font-semibold text-gray-900">VitaQuest Matter</h2>
            </div>
            <p class="text-xs text-gray-500">Chat with your documents using AI • Powered by Claude Sonnet 4.5</p>
          </div>

          {/* Chat Messages */}
          <div id="chat-messages" class="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Welcome Message */}
            <div class="max-w-3xl mx-auto">
              <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-100">
                <h3 class="text-lg font-semibold text-gray-900 mb-3">Welcome to TLS eDiscovery</h3>
                <p class="text-sm text-gray-700 mb-4">
                  Upload your legal documents and ask questions to identify privileged materials, hot documents, and key evidence.
                </p>
                
                {/* Suggested Questions */}
                <div class="space-y-2">
                  <p class="text-xs font-medium text-gray-600 uppercase tracking-wide">Suggested questions:</p>
                  <button class="suggested-question w-full text-left px-4 py-3 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors">
                    <span class="text-sm text-gray-800">Which documents contain attorney-client privileged communications?</span>
                  </button>
                  <button class="suggested-question w-full text-left px-4 py-3 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors">
                    <span class="text-sm text-gray-800">Show me all emails mentioning settlement negotiations</span>
                  </button>
                  <button class="suggested-question w-full text-left px-4 py-3 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors">
                    <span class="text-sm text-gray-800">Identify hot documents with admissions against interest</span>
                  </button>
                  <button class="suggested-question w-full text-left px-4 py-3 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors">
                    <span class="text-sm text-gray-800">Generate a privilege log for all privileged documents</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div class="p-4 border-t border-gray-200 bg-gray-50">
            <div class="max-w-3xl mx-auto">
              <div class="flex space-x-2">
                <input 
                  type="text" 
                  id="chat-input"
                  placeholder="Ask about your documents..."
                  class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button id="send-chat" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Send
                </button>
              </div>
              
              {/* Quick Actions */}
              <div class="flex items-center space-x-2 mt-3">
                <button class="quick-action text-xs px-3 py-1.5 bg-white border border-gray-300 rounded-full hover:border-blue-400 hover:bg-blue-50 transition-colors">
                  📊 Generate Privilege Log
                </button>
                <button class="quick-action text-xs px-3 py-1.5 bg-white border border-gray-300 rounded-full hover:border-blue-400 hover:bg-blue-50 transition-colors">
                  📅 Create Timeline
                </button>
                <button class="quick-action text-xs px-3 py-1.5 bg-white border border-gray-300 rounded-full hover:border-blue-400 hover:bg-blue-50 transition-colors">
                  🔥 Hot Document Report
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - Notes & Reports (~25%) */}
        <div class="w-1/4 bg-white border-l border-gray-200 flex flex-col min-w-[300px] max-w-[400px]">
          {/* Panel Header with Tabs */}
          <div class="border-b border-gray-200">
            <div class="flex">
              <button class="notes-tab-button active px-4 py-3 text-sm font-medium border-b-2 border-blue-600 text-blue-600" data-tab="notes">
                Notes
              </button>
              <button class="notes-tab-button px-4 py-3 text-sm font-medium border-b-2 border-transparent text-gray-600 hover:text-gray-900" data-tab="reports">
                Reports
              </button>
            </div>
          </div>

          {/* Notes Tab Content */}
          <div id="notes-panel" class="flex-1 overflow-y-auto">
            <div class="p-4">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-semibold text-gray-900">Saved Insights</h3>
                <button id="add-manual-note" class="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  + Note
                </button>
              </div>

              {/* Notes List */}
              <div id="notes-list" class="space-y-3">
                <div class="text-center text-gray-500 py-12">
                  <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <p class="mt-3 text-sm">No notes yet</p>
                  <p class="text-xs text-gray-400 mt-1">Save insights from chat conversations</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reports Tab Content */}
          <div id="reports-panel" class="flex-1 overflow-y-auto hidden">
            <div class="p-4 space-y-3">
              <h3 class="text-sm font-semibold text-gray-900 mb-4">Generate Reports</h3>
              
              {/* Privilege Log */}
              <button class="report-button w-full text-left p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200 hover:border-purple-400 transition-colors">
                <div class="flex items-center space-x-3">
                  <div class="p-2 bg-purple-600 rounded-lg">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-semibold text-gray-900">Privilege Log</p>
                    <p class="text-xs text-gray-600 mt-0.5">Court-compliant privilege log with Bates hyperlinks</p>
                  </div>
                </div>
              </button>

              {/* Timeline */}
              <button class="report-button w-full text-left p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:border-blue-400 transition-colors">
                <div class="flex items-center space-x-3">
                  <div class="p-2 bg-blue-600 rounded-lg">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-semibold text-gray-900">Timeline</p>
                    <p class="text-xs text-gray-600 mt-0.5">Chronological timeline of key events and documents</p>
                  </div>
                </div>
              </button>

              {/* Hot Document Report */}
              <button class="report-button w-full text-left p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200 hover:border-red-400 transition-colors">
                <div class="flex items-center space-x-3">
                  <div class="p-2 bg-red-600 rounded-lg">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    </svg>
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-semibold text-gray-900">Hot Documents</p>
                    <p class="text-xs text-gray-600 mt-0.5">Critical litigation evidence and smoking guns</p>
                  </div>
                </div>
              </button>

              {/* Export Options */}
              <div class="pt-4 mt-4 border-t border-gray-200">
                <p class="text-xs font-medium text-gray-600 uppercase tracking-wide mb-3">Export</p>
                <button class="w-full px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  📥 Export All Notes (PDF)
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Create Matter Modal */}
      <div id="create-matter-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Create New Matter</h3>
          </div>
          <div class="px-6 py-4 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Matter Name *</label>
              <input 
                type="text" 
                id="new-matter-name" 
                placeholder="e.g., Smith v. Jones, Estate of Brown"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Bates Prefix * (2-6 letters)</label>
              <input 
                type="text" 
                id="new-matter-prefix" 
                placeholder="e.g., SJ, ABC, BROWN"
                maxlength="6"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
              />
              <p class="text-xs text-gray-500 mt-1">Documents will be numbered: PREFIX-000001, PREFIX-000002, etc.</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
              <textarea 
                id="new-matter-description" 
                rows="3"
                placeholder="Brief description of the matter..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
          </div>
          <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button id="cancel-create-matter" class="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button id="submit-create-matter" class="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              Create Matter
            </button>
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
    // Check if chat_history table exists
    const chatHistoryCheck = await DB.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='chat_history'
    `).first()
    
    if (!chatHistoryCheck) {
      // Add chat_history table
      await DB.prepare(`
        CREATE TABLE IF NOT EXISTS chat_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          matter_id INTEGER NOT NULL,
          user_message TEXT NOT NULL,
          ai_response TEXT NOT NULL,
          bates_citations TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `).run()
    }
    
    // Check if document_classifications table exists
    const docClassCheck = await DB.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='document_classifications'
    `).first()
    
    if (!docClassCheck) {
      // Add document_classifications table
      await DB.prepare(`
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
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `).run()
      
      await DB.prepare(`
        CREATE INDEX IF NOT EXISTS idx_doc_class_document ON document_classifications(document_id)
      `).run()
      
      return c.json({ success: true, message: 'Document classifications table added' })
    }
    
    // Check if notes table exists
    const notesCheck = await DB.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='notes'
    `).first()
    
    if (!notesCheck) {
      // Add notes table
      await DB.prepare(`
        CREATE TABLE IF NOT EXISTS notes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          note_text TEXT NOT NULL,
          bates_references TEXT,
          source TEXT DEFAULT 'manual',
          created_by TEXT DEFAULT 'Stephen Turman',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `).run()
      
      return c.json({ success: true, message: 'Notes table added' })
    }
    
    const check = await DB.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='matters'
    `).first()
    
    if (check) {
      return c.json({ success: true, message: 'Database already initialized' })
    }
    
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
      
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        note_text TEXT NOT NULL,
        bates_references TEXT,
        source TEXT DEFAULT 'manual',
        created_by TEXT DEFAULT 'Stephen Turman',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS chat_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        matter_id INTEGER NOT NULL,
        user_message TEXT NOT NULL,
        ai_response TEXT NOT NULL,
        bates_citations TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

app.post('/api/matters', async (c) => {
  const { DB } = c.env
  try {
    const { name, description, bates_prefix } = await c.req.json()
    
    // Validate required fields
    if (!name || !bates_prefix) {
      return c.json({ error: 'Matter name and Bates prefix are required' }, 400)
    }
    
    // Validate Bates prefix format (letters only, 2-6 characters)
    if (!/^[A-Z]{2,6}$/.test(bates_prefix)) {
      return c.json({ error: 'Bates prefix must be 2-6 uppercase letters (e.g., VQ, SJ, ABC)' }, 400)
    }
    
    // Check if Bates prefix already exists
    const existingPrefix = await DB.prepare(
      'SELECT id FROM matters WHERE bates_prefix = ?'
    ).bind(bates_prefix).first()
    
    if (existingPrefix) {
      return c.json({ error: `Bates prefix "${bates_prefix}" is already in use. Please choose a different prefix.` }, 400)
    }
    
    // Insert new matter
    const result = await DB.prepare(`
      INSERT INTO matters (name, description, bates_prefix, bates_format, next_bates_number)
      VALUES (?, ?, ?, ?, 1)
    `).bind(name, description || '', bates_prefix, `${bates_prefix}-SEQUENCE`).run()
    
    // Fetch the newly created matter
    const newMatter = await DB.prepare(
      'SELECT * FROM matters WHERE id = ?'
    ).bind(result.meta.last_row_id).first()
    
    return c.json({ success: true, matter: newMatter })
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

app.get('/api/notes', async (c) => {
  const { DB } = c.env
  try {
    const notes = await DB.prepare('SELECT * FROM notes ORDER BY created_at DESC').all()
    return c.json(notes.results || [])
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/api/notes', async (c) => {
  const { DB } = c.env
  try {
    const { note_text, bates_references, source } = await c.req.json()
    const result = await DB.prepare(`
      INSERT INTO notes (note_text, bates_references, source) VALUES (?, ?, ?)
    `).bind(note_text, bates_references || null, source || 'manual').run()
    
    return c.json({ success: true, id: result.meta.last_row_id })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Upload PDF document
app.post('/api/upload', async (c) => {
  const { DB, DOCUMENTS } = c.env
  
  try {
    const formData = await c.req.formData()
    const file = formData.get('file') as File
    const matterId = formData.get('matter_id') as string || '1'
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400)
    }
    
    if (file.type !== 'application/pdf') {
      return c.json({ error: 'File must be a PDF' }, 400)
    }
    
    // Get matter info for Bates numbering
    const matter = await DB.prepare('SELECT * FROM matters WHERE id = ?').bind(matterId).first() as any
    if (!matter) {
      return c.json({ error: 'Matter not found' }, 404)
    }
    
    // Calculate Bates numbers
    const startNumber = matter.next_bates_number
    const pageCount = 1 // TODO: Get actual page count from PDF
    const endNumber = startNumber + pageCount - 1
    
    const batesStart = `${matter.bates_prefix}-${String(startNumber).padStart(6, '0')}`
    const batesEnd = `${matter.bates_prefix}-${String(endNumber).padStart(6, '0')}`
    
    // Generate storage path
    const timestamp = Date.now()
    const storagePath = `${matterId}/${timestamp}-${file.name}`
    
    // Upload to R2
    const fileBuffer = await file.arrayBuffer()
    await DOCUMENTS.put(storagePath, fileBuffer, {
      httpMetadata: {
        contentType: 'application/pdf'
      }
    })
    
    // Insert document record
    const result = await DB.prepare(`
      INSERT INTO documents (
        matter_id, filename, bates_start, bates_end, page_count,
        file_size, storage_path, text_extracted, review_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, FALSE, 'pending')
    `).bind(
      matterId,
      file.name,
      batesStart,
      batesEnd,
      pageCount,
      file.size,
      storagePath
    ).run()
    
    // Update matter's next Bates number
    await DB.prepare(`
      UPDATE matters SET next_bates_number = ? WHERE id = ?
    `).bind(endNumber + 1, matterId).run()
    
    return c.json({
      success: true,
      document: {
        id: result.meta.last_row_id,
        filename: file.name,
        bates_start: batesStart,
        bates_end: batesEnd,
        page_count: pageCount,
        storage_path: storagePath
      }
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Get PDF from R2 storage
app.get('/api/document/:id', async (c) => {
  const { DB, DOCUMENTS } = c.env
  const docId = c.req.param('id')
  
  try {
    // Get document metadata
    const doc = await DB.prepare('SELECT * FROM documents WHERE id = ?').bind(docId).first() as any
    if (!doc) {
      return c.notFound()
    }
    
    // Retrieve from R2
    const object = await DOCUMENTS.get(doc.storage_path)
    if (!object) {
      return c.json({ error: 'Document not found in storage' }, 404)
    }
    
    // Return PDF
    return new Response(object.body, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${doc.filename}"`,
        'Cache-Control': 'public, max-age=3600'
      }
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Generate Privilege Log
app.post('/api/reports/privilege-log', async (c) => {
  const { DB } = c.env
  
  try {
    const { matter_id } = await c.req.json()
    const matterId = matter_id || 1
    
    // Get all documents classified as privileged
    const privilegedDocs = await DB.prepare(`
      SELECT d.*, dc.justification, dc.created_at as classification_date
      FROM documents d
      LEFT JOIN document_classifications dc ON d.id = dc.document_id
      LEFT JOIN classifications c ON dc.classification_id = c.id
      WHERE d.matter_id = ? AND c.name = 'Privileged'
      ORDER BY d.bates_start
    `).bind(matterId).all()
    
    if (!privilegedDocs.results || privilegedDocs.results.length === 0) {
      return c.json({ 
        success: false, 
        message: 'No privileged documents found',
        count: 0
      })
    }
    
    // Generate CSV format with hyperlinks
    const matter = await DB.prepare('SELECT * FROM matters WHERE id = ?').bind(matterId).first() as any
    const baseUrl = new URL(c.req.url).origin
    
    let csv = 'Bates Number,Date,From,To,Subject,Privilege Type,Description,Link\n'
    
    for (const doc of privilegedDocs.results as any[]) {
      const batesLink = `${baseUrl}/document/view?bates=${doc.bates_start}`
      csv += `"${doc.bates_start}","${doc.upload_date || 'N/A'}","N/A","N/A","${doc.filename}","Attorney-Client Privilege","${doc.justification || 'Privileged communication'}","${batesLink}"\n`
    }
    
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${matter?.name || 'Matter'}-Privilege-Log-${Date.now()}.csv"`
      }
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Generate Timeline
app.post('/api/reports/timeline', async (c) => {
  const { DB } = c.env
  
  try {
    const { matter_id } = await c.req.json()
    const matterId = matter_id || 1
    
    // Get all documents with dates, sorted chronologically
    const documents = await DB.prepare(`
      SELECT d.*, 
             GROUP_CONCAT(DISTINCT c.name) as classifications
      FROM documents d
      LEFT JOIN document_classifications dc ON d.id = dc.document_id
      LEFT JOIN classifications c ON dc.classification_id = c.id
      WHERE d.matter_id = ?
      GROUP BY d.id
      ORDER BY d.upload_date ASC
    `).bind(matterId).all()
    
    if (!documents.results || documents.results.length === 0) {
      return c.json({ 
        success: false, 
        message: 'No documents found for timeline',
        count: 0
      })
    }
    
    // Extract timeline events from chat history
    const chatEvents = await DB.prepare(`
      SELECT user_message, ai_response, bates_citations, created_at
      FROM chat_history
      WHERE matter_id = ? AND bates_citations IS NOT NULL
      ORDER BY created_at ASC
    `).bind(matterId).all()
    
    return c.json({
      success: true,
      timeline: {
        documents: documents.results,
        events: chatEvents.results || [],
        total_documents: documents.results.length
      }
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Generate Hot Documents Report
app.post('/api/reports/hot-documents', async (c) => {
  const { DB } = c.env
  
  try {
    const { matter_id } = await c.req.json()
    const matterId = matter_id || 1
    
    // Get all documents classified as Hot Document
    const hotDocs = await DB.prepare(`
      SELECT d.*, dc.justification, dc.confidence_score, dc.created_at as classification_date
      FROM documents d
      INNER JOIN document_classifications dc ON d.id = dc.document_id
      INNER JOIN classifications c ON dc.classification_id = c.id
      WHERE d.matter_id = ? AND c.name = 'Hot Document'
      ORDER BY dc.confidence_score DESC, d.bates_start ASC
    `).bind(matterId).all()
    
    // Get related notes
    const notes = await DB.prepare(`
      SELECT * FROM notes 
      WHERE bates_references IS NOT NULL
      ORDER BY created_at DESC
    `).all()
    
    if (!hotDocs.results || hotDocs.results.length === 0) {
      return c.json({ 
        success: false, 
        message: 'No hot documents identified yet',
        count: 0
      })
    }
    
    // Generate report data
    const matter = await DB.prepare('SELECT * FROM matters WHERE id = ?').bind(matterId).first() as any
    const baseUrl = new URL(c.req.url).origin
    
    return c.json({
      success: true,
      matter: matter?.name || 'Unknown Matter',
      hot_documents: hotDocs.results.map((doc: any) => ({
        bates_number: doc.bates_start,
        filename: doc.filename,
        justification: doc.justification,
        confidence: doc.confidence_score,
        link: `${baseUrl}/document/view?bates=${doc.bates_start}`,
        classification_date: doc.classification_date
      })),
      notes: notes.results || [],
      total_count: hotDocs.results.length,
      generated_at: new Date().toISOString()
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Chat with Claude Sonnet 4.5
app.post('/api/chat', async (c) => {
  const { DB, ANTHROPIC_API_KEY } = c.env
  
  try {
    const { message, matter_id, selected_sources } = await c.req.json()
    
    if (!message || !message.trim()) {
      return c.json({ error: 'Message is required' }, 400)
    }
    
    if (!ANTHROPIC_API_KEY) {
      return c.json({ error: 'Anthropic API key not configured' }, 500)
    }
    
    // Get selected documents
    let documentsContext = ''
    if (selected_sources && selected_sources.length > 0) {
      const placeholders = selected_sources.map(() => '?').join(',')
      const docs = await DB.prepare(`
        SELECT id, filename, bates_start, bates_end, extracted_text, page_count
        FROM documents
        WHERE id IN (${placeholders})
      `).bind(...selected_sources).all()
      
      documentsContext = docs.results?.map((doc: any) => {
        return `Document: ${doc.filename} (Bates: ${doc.bates_start}${doc.page_count > 1 ? ' - ' + doc.bates_end : ''})
${doc.extracted_text ? 'Content: ' + doc.extracted_text.substring(0, 2000) : '[Text not yet extracted]'}`
      }).join('\n\n---\n\n') || ''
    }
    
    // Build system prompt for legal document analysis
    const systemPrompt = `You are a legal AI assistant specializing in document review for litigation. Your role is to:

1. Analyze legal documents for attorney-client privilege, work product doctrine, and other privilege claims
2. Identify "hot documents" - evidence with significant litigation value such as:
   - Admissions against interest
   - Contradictory statements
   - Smoking gun evidence
   - Key witness communications
   - Documents showing knowledge, intent, or consciousness of guilt
3. Flag "bad documents" - evidence potentially harmful to the client's position
4. Extract key facts, dates, parties, and dollar amounts
5. Provide legal reasoning for your determinations

When referencing documents, ALWAYS use their Bates numbers in this format: [BATES: VQ-000001]

Be thorough but concise. Provide confidence levels (high/medium/low) for privilege determinations.

Available documents for this query:
${documentsContext || '[No documents selected - user may be asking a general question]'}`

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: message
          }
        ],
        system: systemPrompt
      })
    })
    
    if (!response.ok) {
      const error = await response.text()
      console.error('Claude API error:', error)
      return c.json({ error: 'Failed to get AI response', details: error }, 500)
    }
    
    const data = await response.json() as any
    const aiResponse = data.content[0].text
    
    // Extract Bates citations from response
    const batesCitations = aiResponse.match(/\[BATES: ([^\]]+)\]/g)?.map((match: string) => 
      match.replace('[BATES: ', '').replace(']', '')
    ) || []
    
    // Save to chat history
    await DB.prepare(`
      INSERT INTO chat_history (matter_id, user_message, ai_response, bates_citations)
      VALUES (?, ?, ?, ?)
    `).bind(
      matter_id || 1,
      message,
      aiResponse,
      batesCitations.join(', ') || null
    ).run()
    
    return c.json({
      response: aiResponse,
      bates_citations: batesCitations,
      model: 'claude-sonnet-4-20250514',
      tokens_used: data.usage?.input_tokens + data.usage?.output_tokens || 0
    })
  } catch (error: any) {
    console.error('Chat error:', error)
    return c.json({ error: error.message }, 500)
  }
})

export default app
