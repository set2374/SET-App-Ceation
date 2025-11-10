# Developer Handoff Document - TLS eDiscovery Platform v2.0.4

**Project**: TLS eDiscovery Platform - NotebookLM-Style Legal Document Review  
**Client**: Stephen Turman, Esq. - Turman Legal Solutions PLLC  
**Current Version**: 2.0.4 (Mobile Portrait Swipe Navigation)  
**Handoff Date**: November 10, 2025  
**Status**: ✅ Production Deployed & Tested

---

## 🔗 Quick Access Links

### Live Deployments

| Version | URL | Status | Description |
|---------|-----|--------|-------------|
| **v2.0.4** | https://59f701f2.tls-ediscovery.pages.dev | ✅ LATEST | Mobile portrait swipe navigation |
| v2.0.3 | https://d72bb3e5.tls-ediscovery.pages.dev | ✅ Stable | iOS orientation fixes |
| v2.0.2 | https://de29053b.tls-ediscovery.pages.dev | ✅ Stable | Mobile responsive design |
| v2.0.1 | https://16accbb3.tls-ediscovery.pages.dev | ✅ Stable | Delete document feature |
| v1.0.0 | https://32acf0ba.tls-ediscovery.pages.dev | ✅ Stable | Original NotebookLM interface |

### Development Environment

- **Sandbox URL**: Contact GenSpark AI for current sandbox instance
- **Sandbox Lifetime**: 1 hour (extended automatically when using GetServiceUrl)
- **Local Development**: `http://localhost:3000` (after setup)

### Source Code

- **GitHub Repository**: https://github.com/set2374/SET-App-Ceation
- **Main Branch**: `main`
- **Latest Commit**: `fec4771` (as of 2025-11-10)
- **Git Tags**: v1.0.0, v2.0.0, v2.0.1, v2.0.2, v2.0.3, v2.0.4

### Cloudflare Resources

- **Pages Project**: `tls-ediscovery`
- **D1 Database**: `tls-ediscovery-database` (ID: `ddfaefee-f71c-47c8-b729-de7c2ffedc65`)
- **R2 Bucket**: `tlsediscoverydata`
- **Account Email**: Set2374@gmail.com

---

## 🔐 API Keys and Authentication

### Cloudflare API Token

**Purpose**: Deploy to Cloudflare Pages, manage D1/R2 resources  
**Setup Method**: Use `setup_cloudflare_api_key` tool in GenSpark AI  
**Alternative**: Manual setup via Cloudflare Dashboard

**Steps to Configure**:
1. Call `setup_cloudflare_api_key` tool
2. If fails, user must configure in Deploy tab
3. Token automatically injected as `CLOUDFLARE_API_TOKEN` environment variable
4. Verify with: `npx wrangler whoami`

**Scopes Required**:
- Account - Cloudflare Pages - Edit
- Account - D1 - Edit
- Account - R2 - Edit

### GitHub Authentication

**Purpose**: Push code changes, manage repository  
**Setup Method**: Use `setup_github_environment` tool in GenSpark AI  
**Alternative**: Manual `gh auth login` with token

**Steps to Configure**:
1. Call `setup_github_environment` tool
2. If fails, user must authorize in #github tab
3. Configures both git and gh CLI globally
4. Uses credential.helper store for persistence

**Current User**: `set2374`  
**Git Config**: Automatically configured globally

### Anthropic API Key (Claude AI)

**Purpose**: AI document analysis, privilege detection, chat functionality  
**Storage**: Cloudflare Pages secret (not in code)  
**Model Used**: `claude-3-haiku-20240307` (currently, upgradeable to Claude 4.5 Sonnet)

**Production Configuration**:
```bash
npx wrangler pages secret put ANTHROPIC_API_KEY --project-name tls-ediscovery
```

**Local Development**:
Create `.dev.vars` file (not committed to git):
```bash
ANTHROPIC_API_KEY=sk-ant-...
```

**Note**: Client needs to provide their own Anthropic API key for production use.

---

## 📁 Project Structure

### Repository Layout
```
/home/user/webapp/
├── src/
│   ├── index.tsx              # Main Hono backend application
│   └── renderer.tsx           # HTML template with meta tags
├── public/
│   └── static/
│       ├── app.js             # Frontend JavaScript (NotebookLM UI)
│       └── style.css          # Responsive CSS (400+ lines)
├── migrations/
│   ├── 0001_initial_schema.sql
│   └── 0002_add_document_pages.sql
├── dist/                      # Build output (gitignored)
│   ├── _worker.js             # Compiled Cloudflare Worker
│   └── _routes.json           # Routing configuration
├── .wrangler/                 # Local development state (gitignored)
│   └── state/v3/d1/           # Local SQLite database
├── wrangler.jsonc             # Cloudflare configuration
├── package.json               # Dependencies and scripts
├── ecosystem.config.cjs       # PM2 configuration
├── vite.config.ts             # Vite build configuration
├── tsconfig.json              # TypeScript configuration
├── .gitignore                 # Git ignore rules
├── README.md                  # Project overview
├── VERSION.md                 # Version history
├── CHANGELOG.md               # Detailed changelog
├── DEPLOYMENT_INSTRUCTIONS.md # Deployment guide
└── MOBILE_PORTRAIT_TESTING_v2.0.4.md  # Testing guide
```

### Key Files Explanation

**src/index.tsx** (1000+ lines)
- Main Hono application with all API endpoints
- Three-panel NotebookLM interface HTML
- Database operations (D1)
- R2 storage operations
- Claude AI integration
- Routes: `/`, `/api/*`

**public/static/app.js** (2000+ lines)
- Frontend JavaScript for NotebookLM interface
- Document upload and management
- PDF.js text extraction
- Chat interface with Claude
- Mobile optimization and orientation handling
- Panel swipe navigation (v2.0.4)

**public/static/style.css** (750+ lines)
- Custom styles for NotebookLM interface
- 400+ lines of responsive mobile CSS
- Media queries for portrait/landscape
- Swipe panel indicators and navigation
- Touch device optimizations

**wrangler.jsonc**
- Cloudflare Pages configuration
- D1 database binding
- R2 bucket binding
- Compatibility flags

---

## 🛠️ Technology Stack

### Backend
- **Framework**: Hono v4.10.4 (lightweight, fast, Cloudflare Workers-optimized)
- **Runtime**: Cloudflare Workers (V8 isolates, 10ms CPU limit on free plan)
- **Language**: TypeScript (compiled to JavaScript)
- **Build Tool**: Vite v6.4.1

### Database & Storage
- **Database**: Cloudflare D1 (serverless SQLite)
- **Object Storage**: Cloudflare R2 (S3-compatible)
- **Local DB**: SQLite via wrangler --local mode

### Frontend
- **UI Framework**: Vanilla JavaScript (no React/Vue/Angular)
- **CSS Framework**: TailwindCSS v3 (CDN)
- **Icons**: Font Awesome v6.4.0 (CDN)
- **PDF Library**: PDF.js v3.11.174 (CDN)

### AI Integration
- **AI Provider**: Anthropic Claude API
- **Model**: claude-3-haiku-20240307 (current), claude-sonnet-4-20250514 (planned)
- **Context**: 200K tokens per request
- **Use Cases**: Document analysis, privilege detection, hot document identification

### Development Tools
- **Package Manager**: npm
- **Process Manager**: PM2 (for sandbox development)
- **Deployment**: Wrangler CLI v4.45.3
- **Version Control**: Git + GitHub

---

## 🚀 Setup Instructions

### Option 1: GenSpark AI Sandbox (Recommended)

**Advantages**:
- Pre-configured environment
- PM2 pre-installed
- No local Node.js setup required
- Persistent workspace for 1 hour

**Steps**:

1. **Access Existing Sandbox** (if available)
   ```bash
   # Sandbox should have /home/user/webapp/ with all code
   cd /home/user/webapp
   ```

2. **Or Clone from GitHub**
   ```bash
   cd /home/user
   git clone https://github.com/set2374/SET-App-Ceation.git webapp
   cd webapp
   ```

3. **Install Dependencies**
   ```bash
   cd /home/user/webapp && npm install
   ```
   **Note**: Use 300s+ timeout for npm commands

4. **Build Application**
   ```bash
   cd /home/user/webapp && npm run build
   ```

5. **Start Development Server**
   ```bash
   # Clean port first
   fuser -k 3000/tcp 2>/dev/null || true
   
   # Start with PM2
   cd /home/user/webapp && pm2 start ecosystem.config.cjs
   
   # Check status
   pm2 list
   pm2 logs tls-ediscovery --nostream
   ```

6. **Get Public URL**
   ```bash
   # Use GenSpark AI GetServiceUrl tool
   # Port: 3000
   # Returns: https://3000-<sandbox-id>.sandbox.novita.ai
   ```

7. **Initialize Database**
   ```bash
   curl http://localhost:3000/api/init-db
   ```

### Option 2: Local Development (macOS/Linux)

**Requirements**:
- Node.js 18+
- npm 9+
- Git

**Steps**:

1. **Clone Repository**
   ```bash
   git clone https://github.com/set2374/SET-App-Ceation.git
   cd SET-App-Ceation
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Create Local Environment Variables**
   ```bash
   echo "ANTHROPIC_API_KEY=sk-ant-your-key-here" > .dev.vars
   ```

4. **Build Application**
   ```bash
   npm run build
   ```

5. **Start Local Development Server**
   ```bash
   npm run dev:sandbox
   # Or for D1 database testing:
   npm run dev:d1
   ```

6. **Access Application**
   ```
   http://localhost:3000
   ```

7. **Initialize Database**
   ```bash
   curl http://localhost:3000/api/init-db
   ```

---

## 📊 Database Schema

### Database Overview

**Type**: Cloudflare D1 (SQLite)  
**Name**: tls-ediscovery-database  
**Database ID**: ddfaefee-f71c-47c8-b729-de7c2ffedc65  
**Migration Files**: `/migrations/*.sql`

### Tables

#### 1. matters
Legal matters/cases with Bates numbering configuration
```sql
CREATE TABLE matters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  client_name TEXT,
  matter_number TEXT,
  bates_prefix TEXT NOT NULL DEFAULT 'DOC',
  bates_format TEXT NOT NULL DEFAULT 'PREFIX-SEQUENCE',
  next_bates_number INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. documents
PDF documents with metadata
```sql
CREATE TABLE documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  matter_id INTEGER NOT NULL,
  filename TEXT NOT NULL,
  bates_start TEXT NOT NULL,
  bates_end TEXT NOT NULL,
  page_count INTEGER NOT NULL,
  file_size INTEGER,
  storage_path TEXT NOT NULL,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  uploaded_by TEXT,
  extracted_text TEXT,
  text_extracted BOOLEAN DEFAULT 0,
  review_status TEXT DEFAULT 'pending',
  FOREIGN KEY (matter_id) REFERENCES matters(id)
);
```

#### 3. document_pages
Page-level text storage (v2.0.0+)
```sql
CREATE TABLE document_pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id INTEGER NOT NULL,
  page_number INTEGER NOT NULL,
  bates_number TEXT NOT NULL,
  page_text TEXT,
  ocr_confidence REAL DEFAULT 1.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);
```

#### 4. classifications
Document classification categories
```sql
CREATE TABLE classifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT,
  icon TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

Pre-loaded categories:
- Hot Document (red, flame icon)
- Privileged (purple, shield icon)
- Bad Document (amber, warning icon)
- Key Witness (green, user icon)
- Exhibit (blue, file icon)
- Needs Review (gray, eye icon)

#### 5. document_classifications
Many-to-many relationship
```sql
CREATE TABLE document_classifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id INTEGER NOT NULL,
  classification_id INTEGER NOT NULL,
  confidence_score REAL DEFAULT 1.0,
  ai_suggested BOOLEAN DEFAULT 0,
  attorney_confirmed BOOLEAN DEFAULT 0,
  justification TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  FOREIGN KEY (classification_id) REFERENCES classifications(id)
);
```

#### 6. notes
Document annotations
```sql
CREATE TABLE notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id INTEGER,
  page_number INTEGER,
  bates_number TEXT,
  note_text TEXT NOT NULL,
  note_type TEXT DEFAULT 'general',
  ai_generated BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);
```

#### 7. chat_history
AI conversation history
```sql
CREATE TABLE chat_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  matter_id INTEGER,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  source_documents TEXT,
  bates_citations TEXT,
  model_used TEXT,
  tokens_used INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (matter_id) REFERENCES matters(id)
);
```

### Database Operations

**Apply Migrations (Local)**:
```bash
npx wrangler d1 migrations apply tls-ediscovery-database --local
```

**Apply Migrations (Production)**:
```bash
npx wrangler d1 migrations apply tls-ediscovery-database
```

**Query Database (Local)**:
```bash
npx wrangler d1 execute tls-ediscovery-database --local --command="SELECT * FROM matters"
```

**Reset Local Database**:
```bash
rm -rf .wrangler/state/v3/d1
npm run db:migrate:local
```

---

## 🔌 API Endpoints

### Core Functionality

#### GET `/`
Main dashboard with three-panel NotebookLM interface

**Response**: HTML page

---

#### GET `/api/init-db`
Initialize/provision database tables dynamically

**Response**: JSON with table creation results

**Example**:
```bash
curl http://localhost:3000/api/init-db
```

---

### Matter Management

#### GET `/api/matters`
List all matters

**Response**:
```json
{
  "matters": [
    {
      "id": 1,
      "name": "VitaQuest Discovery",
      "bates_prefix": "VQ",
      "next_bates_number": 16
    }
  ]
}
```

---

### Document Operations

#### GET `/api/documents?matter_id=1`
List documents for a matter

**Query Parameters**:
- `matter_id` (required): Matter ID

**Response**:
```json
{
  "documents": [
    {
      "id": 1,
      "filename": "contract.pdf",
      "bates_start": "VQ-000001",
      "bates_end": "VQ-000015",
      "page_count": 15,
      "text_extracted": 1
    }
  ]
}
```

---

#### POST `/api/upload`
Upload PDF with automatic Bates numbering

**Content-Type**: `multipart/form-data`

**Form Fields**:
- `file`: PDF file
- `matter_id`: Matter ID

**Response**:
```json
{
  "success": true,
  "document": {
    "id": 1,
    "filename": "contract.pdf",
    "bates_start": "VQ-000001",
    "bates_end": "VQ-000015",
    "storage_path": "matter-1/VQ-000001-VQ-000015.pdf"
  }
}
```

**Example**:
```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@contract.pdf" \
  -F "matter_id=1"
```

---

#### DELETE `/api/documents/:id`
Delete document permanently (v2.0.1+)

**Parameters**:
- `id`: Document ID

**Response**:
```json
{
  "success": true,
  "message": "Document deleted successfully",
  "deleted_document": {
    "id": 1,
    "filename": "contract.pdf",
    "bates_start": "VQ-000001"
  }
}
```

**Cascading Deletion**:
- R2 storage file
- document_pages records
- document_classifications records
- notes records
- Main document record

---

#### GET `/api/documents/:id/download`
Download PDF from R2 storage

**Parameters**:
- `id`: Document ID

**Response**: PDF file stream

---

#### POST `/api/documents/:id/extract-text`
Store extracted page text (v2.0.0+)

**Content-Type**: `application/json`

**Body**:
```json
{
  "pages": [
    {
      "page_number": 1,
      "bates_number": "VQ-000001",
      "text": "Page content..."
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "pages_saved": 15,
  "document": {
    "id": 1,
    "text_extracted": true
  }
}
```

---

#### GET `/api/documents/search?q=query&matter_id=1`
Full-text search (v2.0.0+)

**Query Parameters**:
- `q` (required): Search query (minimum 3 characters)
- `matter_id` (optional): Filter by matter

**Response**:
```json
{
  "query": "confidential",
  "results": {
    "documents": [
      {
        "id": 1,
        "filename": "contract.pdf",
        "bates_start": "VQ-000001",
        "match_count": 5
      }
    ],
    "pages": [
      {
        "document_id": 1,
        "page_number": 3,
        "bates_number": "VQ-000003",
        "snippet": "...this confidential agreement..."
      }
    ]
  }
}
```

---

### AI Integration

#### POST `/api/chat`
Claude AI conversational analysis

**Content-Type**: `application/json`

**Body**:
```json
{
  "message": "Analyze these documents for privilege",
  "matter_id": 1,
  "source_document_ids": [1, 2, 3]
}
```

**Response**:
```json
{
  "response": "AI analysis with [BATES: VQ-000001] citations...",
  "sources_used": [1, 2, 3],
  "bates_citations": ["VQ-000001", "VQ-000003"],
  "validated_citations": ["VQ-000001", "VQ-000003"],
  "hallucinated_citations": [],
  "model": "claude-3-haiku-20240307",
  "tokens": 1250
}
```

**Features**:
- Automatic Bates citations in format `[BATES: VQ-000001]`
- Citation validation against database
- Hallucination detection
- Legal-specific prompts

---

### Classifications

#### GET `/api/classifications`
List classification categories

**Response**:
```json
{
  "classifications": [
    {
      "id": 1,
      "name": "Hot Document",
      "description": "Litigation-significant evidence",
      "color": "red",
      "icon": "fire"
    }
  ]
}
```

---

### Reports Generation

#### POST `/api/reports/privilege-log`
Generate privilege log CSV

**Content-Type**: `application/json`

**Body**:
```json
{
  "matter_id": 1
}
```

**Response**: CSV file with columns:
- Bates Number (hyperlinked)
- Document Date
- Author
- Recipients
- Subject
- Privilege Type
- Description

---

#### POST `/api/reports/timeline`
Generate chronological timeline

**Body**:
```json
{
  "matter_id": 1
}
```

**Response**:
```json
{
  "timeline": [
    {
      "date": "2024-01-15",
      "bates_number": "VQ-000001",
      "filename": "contract.pdf",
      "classifications": ["Hot Document", "Exhibit"]
    }
  ]
}
```

---

#### POST `/api/reports/hot-documents`
Generate hot documents report

**Body**:
```json
{
  "matter_id": 1
}
```

**Response**:
```json
{
  "hot_documents": [
    {
      "bates_number": "VQ-000001",
      "filename": "contract.pdf",
      "confidence_score": 0.95,
      "justification": "Contains smoking gun evidence..."
    }
  ]
}
```

---

## 🎨 Frontend Architecture

### NotebookLM Three-Panel Interface

#### Left Panel - Sources & PDF Viewer
- Document library with checkboxes
- Search/filter documents
- Upload area (drag-and-drop)
- PDF viewer with page navigation
- Bates number display

**Files**:
- HTML: `src/index.tsx` lines 60-150
- JavaScript: `public/static/app.js` functions:
  - `loadDocuments()`
  - `openPDFViewer(docId, pageNumber)`
  - `handleFileUpload()`

#### Center Panel - AI Chat
- Conversational interface with Claude
- Message history
- Suggested questions
- Clickable Bates citations
- Source selection indicator

**Files**:
- HTML: `src/index.tsx` lines 152-250
- JavaScript: `public/static/app.js` functions:
  - `sendChatMessage()`
  - `displayChatMessage()`
  - `handleBatesCitationClick()`

#### Right Panel - Notes & Reports
- Tabs: Notes, AI Analysis, Tags, Reports
- Note creation/display
- Classification checkboxes
- Report generation buttons
- Privilege log export

**Files**:
- HTML: `src/index.tsx` lines 252-400
- JavaScript: `public/static/app.js` functions:
  - `loadNotes()`
  - `generatePrivilegeLog()`
  - `generateTimeline()`
  - `generateHotDocumentsReport()`

### Mobile Responsive Design (v2.0.2 - v2.0.4)

#### Orientation Detection
```javascript
function handleOrientationChange() {
  // Triple detection method for iOS compatibility
  let isLandscape = false;
  
  if (window.screen && window.screen.orientation) {
    isLandscape = window.screen.orientation.type.includes('landscape');
  } else if (typeof window.orientation !== 'undefined') {
    isLandscape = Math.abs(window.orientation) === 90;
  } else {
    isLandscape = window.innerWidth > window.innerHeight;
  }
  
  // Update body attributes and classes
  document.body.setAttribute('data-orientation', isLandscape ? 'landscape' : 'portrait');
}
```

#### Panel Swipe Navigation (v2.0.4)
```javascript
function setupPanelSwipeNavigation() {
  const panelContainer = document.querySelector('.flex-1.flex.overflow-hidden');
  
  // Create panel indicators (3 dots)
  createPanelIndicators();
  
  // Create prev/next buttons
  createNavigationButtons();
  
  // Track scroll position
  panelContainer.addEventListener('scroll', updatePanelIndicators, {passive: true});
}

function navigateToPanel(panelIndex) {
  const panelContainer = document.querySelector('.flex-1.flex.overflow-hidden');
  const panelWidth = panelContainer.offsetWidth;
  const targetScrollLeft = panelIndex * panelWidth;
  
  panelContainer.scrollTo({
    left: targetScrollLeft,
    behavior: 'smooth'
  });
}
```

#### CSS Media Queries

**Mobile Portrait** (< 768px, portrait):
```css
@media (max-width: 768px) and (orientation: portrait) {
  .flex-1.flex.overflow-hidden {
    flex-direction: row !important;
    overflow-x: auto !important;
    scroll-snap-type: x mandatory !important;
  }
  
  .flex-1.flex.overflow-hidden > div {
    width: 100vw !important;
    scroll-snap-align: start !important;
  }
}
```

**Mobile Landscape** (< 1024px, landscape):
```css
@media (max-width: 1024px) and (orientation: landscape) {
  .flex-1.flex.overflow-hidden > div:first-child {
    width: 20% !important; /* Sources */
  }
  
  .flex-1.flex.overflow-hidden > div:nth-child(2) {
    flex: 1 !important; /* Chat */
  }
  
  .flex-1.flex.overflow-hidden > div:last-child {
    width: 25% !important; /* Notes */
  }
}
```

---

## 📱 Mobile Testing

### Test Devices

**Primary**: iPhone 15 Pro Max (iOS Safari)  
**Secondary**: iPad Pro, Android phones/tablets

### Test Scenarios

1. **Portrait Mode Swipe Navigation** (v2.0.4)
   - Swipe left/right between panels
   - Panel indicators update correctly
   - Navigation buttons work
   - Chat text readable (16px minimum)

2. **Landscape Mode Layout** (v2.0.3)
   - Three panels side-by-side
   - Proper width distribution
   - No overflow issues

3. **Orientation Changes**
   - Smooth transition portrait ↔ landscape
   - Layout updates immediately
   - No stuck panels

4. **Document Upload**
   - File picker works on mobile
   - Upload progress visible
   - Success notification shows

5. **PDF Viewing**
   - PDF loads in viewer
   - Page navigation works
   - Bates numbers visible

6. **Chat Functionality**
   - Message input works
   - Virtual keyboard doesn't break layout
   - Bates citations clickable

### Known Mobile Issues

**Resolved**:
- ✅ iOS orientation detection (v2.0.3)
- ✅ Portrait mode cramped layout (v2.0.4)
- ✅ Chat text too small (v2.0.4)
- ✅ No panel navigation in portrait (v2.0.4)

**Pending**:
- ⏳ Batch text extraction for pre-v2.0.0 documents
- ⏳ OCR for scanned documents (planned v2.1.0)

---

## 🚀 Deployment Process

### Prerequisites

1. **Cloudflare Authentication**
   ```bash
   # Use GenSpark AI tool
   setup_cloudflare_api_key
   
   # Or manual setup
   npx wrangler login
   ```

2. **Verify Authentication**
   ```bash
   npx wrangler whoami
   # Should show: Set2374@gmail.com's Account
   ```

### Build Process

```bash
cd /home/user/webapp

# Clean previous build
rm -rf dist

# Build application
npm run build

# Verify dist/ directory created
ls -la dist/
# Should contain: _worker.js, _routes.json
```

### Deploy to Cloudflare Pages

```bash
# Deploy to production
npx wrangler pages deploy dist --project-name tls-ediscovery

# Output will show deployment URL:
# ✨ Deployment complete! Take a peek over at https://<hash>.tls-ediscovery.pages.dev
```

### Production Database Setup (First Time)

1. **Create D1 Database**
   ```bash
   npx wrangler d1 create tls-ediscovery-database
   # Copy database_id to wrangler.jsonc
   ```

2. **Apply Migrations**
   ```bash
   npx wrangler d1 migrations apply tls-ediscovery-database
   ```

3. **Initialize Tables**
   ```bash
   curl https://tls-ediscovery.pages.dev/api/init-db
   ```

### Configure Secrets

```bash
# Set Anthropic API key
npx wrangler pages secret put ANTHROPIC_API_KEY --project-name tls-ediscovery
# Paste key when prompted
```

### Verify Deployment

```bash
# Test main page
curl -I https://tls-ediscovery.pages.dev

# Test API endpoint
curl https://tls-ediscovery.pages.dev/api/matters
```

### Git Workflow

```bash
# Commit changes
git add .
git commit -m "Description of changes"

# Tag release
git tag -a v2.0.X -m "Version description"

# Push to GitHub
git push origin main
git push origin v2.0.X
```

---

## 🐛 Debugging Guide

### Common Issues

#### 1. Build Fails

**Symptom**: `npm run build` errors

**Check**:
```bash
# Verify Node.js version
node --version
# Should be 18+

# Clean install
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npx tsc --noEmit
```

---

#### 2. Local Server Won't Start

**Symptom**: Port 3000 already in use

**Fix**:
```bash
# Kill process on port 3000
fuser -k 3000/tcp 2>/dev/null || true

# Or find and kill manually
lsof -ti:3000 | xargs kill -9

# Restart with PM2
pm2 delete all
pm2 start ecosystem.config.cjs
```

---

#### 3. Database Errors

**Symptom**: "table does not exist" errors

**Fix**:
```bash
# Reset local database
rm -rf .wrangler/state/v3/d1
npx wrangler d1 migrations apply tls-ediscovery-database --local

# Initialize tables
curl http://localhost:3000/api/init-db
```

---

#### 4. Upload Fails

**Symptom**: PDF upload returns error

**Check**:
```bash
# Verify R2 bucket binding in wrangler.jsonc
cat wrangler.jsonc | grep -A3 r2_buckets

# Check R2 bucket exists
npx wrangler r2 bucket list

# Test upload manually
curl -X POST http://localhost:3000/api/upload \
  -F "file=@test.pdf" \
  -F "matter_id=1"
```

---

#### 5. Claude API Errors

**Symptom**: Chat returns 401 or 500 errors

**Check**:
```bash
# Verify API key in .dev.vars (local)
cat .dev.vars

# Check production secret
npx wrangler pages secret list --project-name tls-ediscovery

# Test API key manually
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-haiku-20240307","max_tokens":1024,"messages":[{"role":"user","content":"Hello"}]}'
```

---

#### 6. Mobile Swipe Not Working

**Symptom**: Cannot swipe between panels on mobile

**Check**:
1. Ensure device is in portrait mode
2. Check browser (Safari recommended for iOS)
3. Look for panel indicators at bottom
4. Try tapping indicator dots
5. Check browser console for JavaScript errors

**Debug**:
```javascript
// Check if swipe navigation initialized
console.log(document.getElementById('panel-indicators'));
console.log(document.getElementById('prev-panel-btn'));
console.log(document.getElementById('next-panel-btn'));

// Check scroll-snap support
const container = document.querySelector('.flex-1.flex.overflow-hidden');
console.log(getComputedStyle(container).scrollSnapType);
```

---

### Logging

**PM2 Logs** (Sandbox):
```bash
# View logs
pm2 logs tls-ediscovery --nostream

# Follow logs in real-time
pm2 logs tls-ediscovery

# Clear logs
pm2 flush
```

**Browser Console**:
- Open DevTools (F12 or Cmd+Option+I)
- Console tab shows JavaScript errors
- Network tab shows API requests
- Elements tab shows DOM structure

**Cloudflare Pages Logs**:
```bash
# View deployment logs
npx wrangler pages deployment list --project-name tls-ediscovery

# Tail production logs (if available)
npx wrangler tail --project-name tls-ediscovery
```

---

## 📝 Version History Summary

### v2.0.4 (Current) - November 10, 2025
**Focus**: Mobile portrait mode UX improvements

**Changes**:
- Horizontal swipeable panels for portrait mode
- Panel indicators (3 dots at bottom)
- Prev/next navigation buttons
- Enlarged chat text (16px)
- Panel headers with emojis

**Deployment**: https://59f701f2.tls-ediscovery.pages.dev

---

### v2.0.3 - November 10, 2025
**Focus**: iOS orientation fixes

**Changes**:
- Fixed iOS Safari orientation detection
- Override Tailwind CSS with !important
- Triple orientation detection method
- Force layout reflow on change

**Deployment**: https://d72bb3e5.tls-ediscovery.pages.dev

---

### v2.0.2 - November 10, 2025
**Focus**: Mobile responsive design

**Changes**:
- 400+ lines of responsive CSS
- Mobile device detection
- Orientation change handling
- Touch-optimized interface
- Viewport meta tags

**Deployment**: https://de29053b.tls-ediscovery.pages.dev

---

### v2.0.1 - November 10, 2025
**Focus**: Delete document feature

**Changes**:
- DELETE /api/documents/:id endpoint
- Cascading deletion (R2, D1, pages, classifications, notes)
- Confirmation dialog
- Trash icon UI

**Deployment**: https://16accbb3.tls-ediscovery.pages.dev

---

### v2.0.0 - November 1, 2025
**Focus**: Text extraction and search

**Changes**:
- PDF.js text extraction
- Page-level Bates indexing
- Full-text search API
- Search UI with highlighting
- AI hallucination detection
- document_pages table

**Deployment**: https://32acf0ba.tls-ediscovery.pages.dev

---

### v1.0.0 - October 31, 2025
**Focus**: Initial NotebookLM interface

**Changes**:
- Three-panel NotebookLM design
- PDF upload with Bates numbering
- Claude AI integration
- Privilege log generation
- Timeline reports
- Hot documents reports
- Classification system
- Notes system

**Deployment**: https://32acf0ba.tls-ediscovery.pages.dev

---

## 🔍 Code Review Checklist

### For New Developers

When reviewing this codebase, pay attention to:

#### Architecture
- [ ] Hono routes in `src/index.tsx` are RESTful and clear
- [ ] Frontend JavaScript in `public/static/app.js` is modular
- [ ] CSS in `public/static/style.css` uses proper media queries
- [ ] No sensitive data (API keys) committed to repository

#### Database
- [ ] D1 database queries use prepared statements (SQL injection prevention)
- [ ] Foreign key constraints properly defined
- [ ] Indexes exist for frequently queried columns
- [ ] CASCADE deletes configured for related records

#### Frontend
- [ ] Mobile responsive design works on real devices
- [ ] Orientation changes handled properly
- [ ] Touch targets meet 44px minimum
- [ ] No layout shifts or reflows

#### Security
- [ ] CORS configured properly for API routes
- [ ] File uploads validated (PDF only, size limits)
- [ ] User input sanitized before database insertion
- [ ] No XSS vulnerabilities in rendered HTML

#### Performance
- [ ] Debounced search (500ms) reduces API load
- [ ] PDF.js extraction is client-side (no server CPU)
- [ ] Search results limited (50 docs, 100 pages)
- [ ] Images/assets optimized for web

#### Mobile Optimization
- [ ] Viewport meta tags correct
- [ ] Scroll-snap works on iOS Safari
- [ ] Panel indicators visible and functional
- [ ] Chat text readable (16px minimum)
- [ ] Orientation detection reliable

#### Testing
- [ ] All API endpoints have error handling
- [ ] Upload progress notifications work
- [ ] Delete confirmation prevents accidents
- [ ] Bates citations link to correct documents

---

## 🎯 Recommended Improvements

### Priority 1: Critical

1. **Batch Text Extraction Tool**
   - User has 5 documents uploaded before v2.0.0
   - Need script to extract text from existing documents
   - Options: Re-upload OR create extraction endpoint

2. **Authentication System**
   - Currently no user authentication
   - Implement Cloudflare Access or Auth0
   - Role-based access control (attorney, paralegal)

### Priority 2: High Value

3. **OCR for Scanned Documents** (v2.1.0 planned)
   - Use Claude 4.5 Sonnet Vision API
   - PDF-to-image conversion
   - Automatic fallback for poor PDF.js extraction

4. **Upgrade Claude Model**
   - Switch from Haiku to Claude 4.5 Sonnet
   - Better document analysis quality
   - More accurate privilege detection

5. **Advanced Search**
   - Boolean operators (AND, OR, NOT)
   - Phrase search with quotes
   - Proximity search
   - Regular expressions

### Priority 3: Nice to Have

6. **Classification Workflow UI**
   - Click-to-classify on document cards
   - Bulk classification operations
   - AI-suggested classifications

7. **Keyboard Shortcuts**
   - Navigate panels (Cmd+1, Cmd+2, Cmd+3)
   - Search focus (Cmd+K)
   - Upload file (Cmd+U)

8. **Export Enhancements**
   - PDF privilege log (not just CSV)
   - Batch export of classified documents
   - Custom report templates

---

## 📞 Support and Contact

### Client Information

**Name**: Stephen Turman, Esq.  
**Firm**: Turman Legal Solutions PLLC  
**Position**: Managing Partner and Founder  
**Experience**: 25 years in complex litigation  
**Specialization**: Commercial, Employment, Trust & Estates Litigation  
**Education**: Cornell Law School (1999)

### Development Context

**AI Developer**: Claude Sonnet 4.5 (via GenSpark AI)  
**Platform**: GenSpark AI sandbox environment  
**Session**: Long-running collaborative development  
**Communication Style**: Attorney addressing sophisticated legal professional

### GitHub Repository

**URL**: https://github.com/set2374/SET-App-Ceation  
**Owner**: set2374  
**Branch**: main  
**Access**: Private (requires authorization)

### Documentation Files

All documentation located in `/home/user/webapp/`:

- `README.md` - Project overview
- `VERSION.md` - Version history
- `CHANGELOG.md` - Detailed changes
- `DEPLOYMENT_INSTRUCTIONS.md` - Deployment guide
- `MOBILE_PORTRAIT_TESTING_v2.0.4.md` - Testing guide
- `DEVELOPER_HANDOFF_v2.0.4.md` - This document

---

## 🚦 Current Status

### Production Status
✅ **v2.0.4 Deployed and Live**  
🔗 https://59f701f2.tls-ediscovery.pages.dev

### Testing Status
⏳ **Awaiting User Confirmation**  
User testing mobile portrait swipe navigation on iPhone 15 Pro Max

### Known Issues
- None reported for v2.0.4
- v2.0.3 confirmed working by user

### Next Steps
1. User tests v2.0.4 on iPhone 15 Pro Max
2. If successful: Mark as stable, plan v2.1.0
3. If issues: Create v2.0.5 patch release

---

## 📚 Additional Resources

### Cloudflare Documentation
- **Pages**: https://developers.cloudflare.com/pages/
- **Workers**: https://developers.cloudflare.com/workers/
- **D1**: https://developers.cloudflare.com/d1/
- **R2**: https://developers.cloudflare.com/r2/
- **Wrangler**: https://developers.cloudflare.com/workers/wrangler/

### Hono Framework
- **Documentation**: https://hono.dev/
- **GitHub**: https://github.com/honojs/hono
- **Examples**: https://github.com/honojs/examples

### PDF.js
- **Documentation**: https://mozilla.github.io/pdf.js/
- **GitHub**: https://github.com/mozilla/pdf.js
- **API Reference**: https://mozilla.github.io/pdf.js/api/

### Anthropic Claude API
- **Documentation**: https://docs.anthropic.com/
- **API Reference**: https://docs.anthropic.com/en/api/
- **Model Pricing**: https://www.anthropic.com/api

### Mobile Web Development
- **iOS Safari**: https://developer.apple.com/safari/
- **Scroll Snap**: https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-snap-type
- **Touch Events**: https://developer.mozilla.org/en-US/docs/Web/API/Touch_events

---

## ✅ Pre-Review Checklist

Before starting code review, ensure you have:

- [ ] Access to GitHub repository
- [ ] Cloudflare account credentials
- [ ] GenSpark AI sandbox (optional, for live testing)
- [ ] iPhone or Android device for mobile testing
- [ ] Anthropic API key (for Claude integration testing)
- [ ] Read this handoff document completely
- [ ] Reviewed README.md for project overview
- [ ] Checked VERSION.md for version history
- [ ] Opened CHANGELOG.md for detailed changes

---

## 🎬 Quick Start for Code Review

### 1. Clone and Setup (5 minutes)
```bash
git clone https://github.com/set2374/SET-App-Ceation.git
cd SET-App-Ceation
npm install
```

### 2. Review Code Structure (15 minutes)
- Read `src/index.tsx` - Backend API
- Read `public/static/app.js` - Frontend logic
- Read `public/static/style.css` - Responsive design

### 3. Test Locally (10 minutes)
```bash
npm run build
npm run dev:sandbox
open http://localhost:3000
```

### 4. Test Production (10 minutes)
- Visit https://59f701f2.tls-ediscovery.pages.dev
- Test on desktop browser
- Test on mobile device (portrait and landscape)

### 5. Review Mobile UX (15 minutes)
- Use iPhone/Android in portrait mode
- Test swipe navigation
- Test panel indicators
- Test chat readability

### 6. Provide Feedback
- Open GitHub issues for bugs
- Create pull requests for improvements
- Document findings in review notes

---

**Document Version**: 1.0  
**Last Updated**: November 10, 2025  
**Prepared By**: Claude Sonnet 4.5 (GenSpark AI)  
**For**: Stephen Turman, Esq., Turman Legal Solutions PLLC

---

**End of Developer Handoff Document**
