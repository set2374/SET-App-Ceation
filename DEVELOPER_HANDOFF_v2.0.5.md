# TLS eDiscovery Platform - Developer Handoff Document

**Version**: 2.0.5  
**Date**: November 10, 2025  
**Client**: Stephen Turman, Esq., Turman Legal Solutions PLLC  
**Project**: Legal Document Review & Privilege Analysis Platform

---

## 🎯 Executive Summary

The TLS eDiscovery Platform is an AI-powered legal document review application built with Hono (Cloudflare Workers), featuring a NotebookLM-inspired three-panel interface. The application enables attorneys to upload PDFs, extract text, perform full-text search, classify documents, and generate court-compliant privilege logs using Claude AI.

**Current Status**: Version 2.0.5 deployed to production with mobile portrait mode optimization.

**Recent Work**: Addressed critical mobile UX issues on iPhone 15 Pro Max:
- Chat text was too small to read (fixed: increased to 18px)
- Swipe navigation between panels not working (fixed: aggressive inline styling + debugging)

---

## 📍 Access Information

### Production Deployment URLs

| Version | URL | Status | Description |
|---------|-----|--------|-------------|
| **v2.0.5** | https://3448cfb6.tls-ediscovery.pages.dev | ✅ **CURRENT** | Aggressive portrait fixes |
| v2.0.4 | https://59f701f2.tls-ediscovery.pages.dev | ⚠️ Issues | Initial swipe attempt |
| v2.0.3 | https://d72bb3e5.tls-ediscovery.pages.dev | ✅ Works | iOS orientation fixes |
| v2.0.2 | https://de29053b.tls-ediscovery.pages.dev | ⚠️ Limited | Initial mobile responsive |
| v2.0.1 | https://16accbb3.tls-ediscovery.pages.dev | ✅ Works | Delete document feature |
| v2.0.0 | https://32acf0ba.tls-ediscovery.pages.dev | ✅ Stable | Text extraction & search |

### GitHub Repository

**Repository URL**: https://github.com/set2374/SET-App-Ceation  
**Branch**: `main`  
**Latest Commit**: `5a8112c`  
**Git Tags**: v1.0.0, v2.0.0, v2.0.1, v2.0.2, v2.0.3, v2.0.4, v2.0.5

### Development Sandbox

**Current Sandbox**: Not currently running (ephemeral environment)  
**To Start New Sandbox**: Use GenSpark AI platform with Node.js environment

### Cloudflare Resources

**Account Email**: Set2374@gmail.com

**Cloudflare Pages Project**: `tls-ediscovery`  
**Dashboard**: https://dash.cloudflare.com/ → Pages → tls-ediscovery

**D1 Database**:
- Name: `tls-ediscovery-production`
- Database ID: `ddfaefee-f71c-47c8-b729-de7c2ffedc65`
- Binding: `DB`

**R2 Bucket**:
- Name: `tlsediscoverydata`
- Binding: `DOCUMENTS`

---

## 🔑 API Keys and Credentials

### Required for Development

#### 1. Anthropic API Key (Claude AI)
**Purpose**: AI document analysis, privilege detection, chat functionality  
**Location**: Set as Cloudflare Pages secret  
**Format**: `sk-ant-...`

**To retrieve**: Contact Stephen Turman  
**To set locally**: Create `.dev.vars` file:
```bash
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**To set in production**:
```bash
npx wrangler pages secret put ANTHROPIC_API_KEY --project-name tls-ediscovery
```

#### 2. Cloudflare API Token
**Purpose**: Deploy to Cloudflare Pages, manage D1/R2  
**Location**: Configured in sandbox environment  
**To retrieve**: Cloudflare Dashboard → My Profile → API Tokens

**Required Permissions**:
- Pages: Edit
- D1: Edit
- R2: Edit

**To use in new environment**:
```bash
# Tool will configure this automatically
setup_cloudflare_api_key
```

#### 3. GitHub Personal Access Token
**Purpose**: Push code changes to repository  
**Location**: Configured in sandbox environment  
**Scope Required**: `repo` (full control of private repositories)

**To use in new environment**:
```bash
# Tool will configure this automatically
setup_github_environment
```

### Optional API Keys

None currently required. Future features may need:
- OCR API (for scanned document processing)
- Email service (for notification features)

---

## 🏗️ Architecture Overview

### Technology Stack

```
Frontend:
├── HTML/JSX (Hono JSX Renderer)
├── TailwindCSS (via CDN)
├── Vanilla JavaScript
└── PDF.js v3.11.174 (text extraction)

Backend:
├── Hono v4.x (web framework)
├── Cloudflare Workers (edge runtime)
├── Cloudflare D1 (SQLite database)
├── Cloudflare R2 (object storage)
└── Anthropic Claude API (AI model)

Build/Deploy:
├── Vite (build tool)
├── Wrangler CLI (Cloudflare deployment)
├── PM2 (process management for dev)
└── Git/GitHub (version control)
```

### Project Structure

```
/home/user/webapp/
├── src/
│   ├── index.tsx              # Main Hono app (API + HTML)
│   └── renderer.tsx           # HTML template wrapper
├── public/
│   └── static/
│       ├── app.js            # Frontend JavaScript (~2000 lines)
│       └── style.css         # Responsive CSS (~750 lines)
├── migrations/
│   ├── 0001_initial_schema.sql
│   └── 0002_add_document_pages.sql
├── dist/                      # Build output (generated)
│   ├── _worker.js            # Compiled Worker bundle
│   └── _routes.json          # Routing configuration
├── .wrangler/                 # Local development data
│   └── state/v3/d1/          # Local SQLite database
├── wrangler.jsonc            # Cloudflare configuration
├── package.json              # Dependencies and scripts
├── ecosystem.config.cjs      # PM2 configuration
├── vite.config.ts            # Vite build configuration
└── README.md                 # Project documentation
```

### Database Schema

**8 Main Tables**:
1. `matters` - Case management
2. `documents` - PDF metadata
3. `document_pages` - Page-level text with Bates numbers
4. `classifications` - Document categories (Hot, Privileged, etc.)
5. `document_classifications` - Many-to-many relationship
6. `notes` - Attorney annotations
7. `privilege_log_entries` - Court-compliant privilege log data
8. `chat_history` - AI conversation history

**Key Relationships**:
- `documents.matter_id` → `matters.id`
- `document_pages.document_id` → `documents.id`
- `document_classifications` → `documents` + `classifications`

---

## 🚀 Getting Started (New Developer)

### Step 1: Clone Repository

```bash
git clone https://github.com/set2374/SET-App-Ceation.git
cd SET-App-Ceation
```

### Step 2: Install Dependencies

```bash
npm install
```

**Key Dependencies**:
- `hono` ^4.0.0 - Web framework
- `@hono/vite-cloudflare-pages` - Vite integration
- `wrangler` ^3.78.0 - Cloudflare CLI
- `@cloudflare/workers-types` - TypeScript types

### Step 3: Configure Environment Variables

Create `.dev.vars` file in project root:

```bash
# .dev.vars (DO NOT COMMIT TO GIT)
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

**Note**: This file is in `.gitignore` to prevent accidental commits.

### Step 4: Initialize Local Database

```bash
# Apply migrations to local D1 database
npm run db:migrate:local

# Seed with test data (optional)
npm run db:seed
```

This creates `.wrangler/state/v3/d1/` directory with local SQLite database.

### Step 5: Build and Start Development Server

```bash
# Build the application
npm run build

# Start with PM2 (recommended)
pm2 start ecosystem.config.cjs

# View logs
pm2 logs tls-ediscovery --nostream

# Test locally
curl http://localhost:3000
```

**Alternative** (without PM2):
```bash
npm run dev:sandbox
```

### Step 6: Access Application

Open browser: http://localhost:3000

**Test Credentials**:
- Matter: VitaQuest (VITA) - pre-configured test matter
- No authentication required (local development)

---

## 🔧 Development Workflow

### Making Code Changes

#### 1. Frontend Changes (app.js, style.css)

```bash
# Edit files in public/static/
nano public/static/app.js
nano public/static/style.css

# Build
npm run build

# Restart PM2
pm2 restart tls-ediscovery

# Test
open http://localhost:3000
```

#### 2. Backend Changes (index.tsx)

```bash
# Edit Hono application
nano src/index.tsx

# Build
npm run build

# Restart PM2
pm2 restart tls-ediscovery

# Test API endpoint
curl http://localhost:3000/api/documents
```

#### 3. Database Schema Changes

```bash
# Create new migration
touch migrations/0003_your_migration_name.sql

# Edit migration file
nano migrations/0003_your_migration_name.sql

# Apply to local database
npm run db:migrate:local

# Apply to production (after testing)
npm run db:migrate:prod
```

### Testing Mobile Changes

#### Local Testing on iPhone

1. Get public URL for local server:
   ```bash
   # In GenSpark AI sandbox:
   GetServiceUrl(port=3000, service_name="TLS eDiscovery")
   ```

2. Open URL on iPhone Safari

3. Check browser console:
   - Safari → Develop → iPhone → localhost
   - Look for console.log messages

#### Testing Portrait Mode

**Key Things to Test**:
- [ ] Swipe left/right between panels
- [ ] Panel indicators visible at bottom
- [ ] Prev/Next buttons visible on edges
- [ ] Chat text readable (18px minimum)
- [ ] Panels snap cleanly (no mid-screen stops)

**Debugging Console Logs**:
```javascript
setupPanelSwipeNavigation: isMobile=true, isPortrait=true, width=430
Panel container found: <div>
Panel 0 styled: <div>
Panel 1 styled: <div>
Panel 2 styled: <div>
✅ Panel swipe navigation initialized successfully
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: your descriptive message"

# Push to GitHub
git push origin feature/your-feature-name

# Create pull request on GitHub
# (or push directly to main for urgent fixes)
```

### Deploying to Production

```bash
# Ensure you're on main branch
git checkout main
git pull origin main

# Build production bundle
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name tls-ediscovery

# Create git tag for version
git tag -a v2.0.X -m "Description of changes"
git push origin v2.0.X
```

**Deployment Checklist**:
- [ ] All tests passing locally
- [ ] Mobile tested on real device
- [ ] Console logs reviewed (no errors)
- [ ] Git committed and pushed
- [ ] Version number updated in documentation
- [ ] Deployment URL tested immediately after deploy

---

## 📝 Current Known Issues

### Critical (Must Fix)

1. **Mobile Portrait Swipe** (v2.0.5 addresses this)
   - User reported swipe not working on iPhone 15 Pro Max
   - v2.0.5 adds aggressive inline styling + debugging logs
   - Monitor console logs on next test

2. **Chat Text Readability** (v2.0.5 addresses this)
   - User reported text "virtually impossible to read"
   - v2.0.5 increases to 18px with better line-height
   - Verify on actual device

### Medium Priority

3. **Old Documents Missing Text**
   - 5 documents uploaded before v2.0.0 have no extracted text
   - Options: Re-upload OR batch extraction script
   - User has not decided on approach

### Low Priority

4. **No Authentication**
   - Currently single-user application
   - Future: Cloudflare Access or OAuth
   - Not blocking current usage

5. **No OCR for Scanned Documents**
   - PDF.js only extracts text-based PDFs
   - Scanned documents yield no searchable text
   - Planned: Claude Vision API integration (v2.1.0)

---

## 🐛 Debugging Guide

### Frontend Debugging

#### Browser Console (iPhone Safari)

**Enable Web Inspector**:
1. iPhone: Settings → Safari → Advanced → Web Inspector (ON)
2. Mac: Safari → Develop → iPhone Name → localhost

**Key Console Logs**:
```javascript
// Panel swipe initialization
setupPanelSwipeNavigation: isMobile=true, isPortrait=true

// Touch events
Touch start detected
Touch move detected

// Navigation
Navigating to panel 1
Panel container scroll width: 1290
Panel container client width: 430
```

#### Network Tab Issues

**PDF Upload Failing**:
- Check `/api/upload` response
- Verify R2 bucket permissions
- Check file size limits (none currently set)

**Chat Not Responding**:
- Check `/api/chat` response
- Verify `ANTHROPIC_API_KEY` is set
- Check rate limits (Anthropic API)

### Backend Debugging

#### PM2 Logs

```bash
# View all logs
pm2 logs tls-ediscovery

# View last 100 lines (non-streaming)
pm2 logs tls-ediscovery --nostream --lines 100

# View only errors
pm2 logs tls-ediscovery --err

# Clear logs
pm2 flush
```

#### Wrangler Logs (Production)

```bash
# Tail production logs
npx wrangler pages deployment tail --project-name tls-ediscovery

# View specific deployment logs
npx wrangler pages deployment tail <deployment-id>
```

#### Database Debugging

```bash
# Query local D1 database
npm run db:console:local

# Example queries:
sqlite> SELECT COUNT(*) FROM documents;
sqlite> SELECT * FROM document_pages LIMIT 5;
sqlite> SELECT filename, bates_start, text_extracted FROM documents;

# Query production D1 database
npm run db:console:prod
```

### Common Error Messages

#### "Panel container not found"
**Cause**: DOM not fully loaded before JavaScript executes  
**Fix**: Check `DOMContentLoaded` event listener in app.js

#### "Authentication failed for GitHub"
**Cause**: Git credentials expired in sandbox  
**Fix**: Run `setup_github_environment` tool

#### "Deployment failed: Invalid API token"
**Cause**: Cloudflare API token expired or missing  
**Fix**: Run `setup_cloudflare_api_key` tool

#### "AI chat returns 500 error"
**Cause**: Missing or invalid ANTHROPIC_API_KEY  
**Fix**: Check `.dev.vars` locally or Cloudflare secret in production

---

## 📱 Mobile Optimization (v2.0.5)

### Portrait Mode Architecture

**Problem Solved**:
User on iPhone 15 Pro Max reported:
1. Cannot swipe between panels in portrait mode
2. Chat text too small to read

**Solution Implemented** (v2.0.5):

#### CSS Strategy
```css
/* Aggressive specificity to override Tailwind */
body .flex-1.flex.overflow-hidden > div {
  width: 100vw !important;
  min-width: 100vw !important;
  max-width: 100vw !important;
  flex: 0 0 100vw !important;
  scroll-snap-align: start !important;
}
```

#### JavaScript Strategy
```javascript
// Force inline styles for maximum override
panelContainer.style.flexDirection = 'row';
panelContainer.style.overflowX = 'scroll';
panelContainer.style.scrollSnapType = 'x mandatory';

// Force each child panel
Array.from(panelContainer.children).forEach((child) => {
  child.style.width = '100vw';
  child.style.minWidth = '100vw';
  child.style.flexShrink = '0';
});
```

#### Text Size Strategy
```css
/* Chat messages - 18px minimum */
#chat-messages,
.chat-message,
#chat-messages p,
#chat-messages div {
  font-size: 18px !important;
  line-height: 1.8 !important;
  padding: 1.25rem !important;
}
```

### Testing on iPhone 15 Pro Max

**Device Specs**:
- Screen: 430 x 932 pixels (portrait)
- Browser: Safari (latest iOS)
- Expected Behavior:
  - 3 panels, each 430px wide
  - Total scroll width: 1290px (430 × 3)
  - Swipe left: Sources → Chat → Notes
  - Swipe right: Notes → Chat → Sources

**Console Checks**:
```javascript
// Should see:
Panel container scroll width: 1290
Panel container client width: 430
// Ratio should be exactly 3:1
```

---

## 🔄 Version History & Rollback

### Recent Versions

| Version | Date | Key Changes | Rollback Safe? |
|---------|------|-------------|----------------|
| **2.0.5** | Nov 10 | Aggressive portrait fixes | ⚠️ Test First |
| 2.0.4 | Nov 10 | Initial swipe implementation | ❌ Issues |
| 2.0.3 | Nov 10 | iOS orientation detection | ✅ Yes |
| 2.0.2 | Nov 10 | Mobile responsive CSS | ✅ Yes |
| 2.0.1 | Nov 10 | Delete document feature | ✅ Yes |
| 2.0.0 | Nov 1 | Text extraction & search | ✅ Yes |
| 1.0.0 | Oct 31 | Initial NotebookLM interface | ✅ Yes |

### Rollback Procedure

#### Option 1: Cloudflare Dashboard
1. Login to Cloudflare Dashboard
2. Navigate to Pages → tls-ediscovery
3. Click "Deployments" tab
4. Find stable deployment (e.g., v2.0.3)
5. Click "Rollback to this deployment"

#### Option 2: Git Tag Deployment
```bash
# Checkout specific version
git checkout v2.0.3

# Build and deploy
npm run build
npx wrangler pages deploy dist --project-name tls-ediscovery

# Return to main
git checkout main
```

#### Option 3: Direct URL
If new deployment has issues, users can access previous stable version:
```
Stable: https://d72bb3e5.tls-ediscovery.pages.dev (v2.0.3)
```

---

## 📚 Key Files Reference

### Backend Files

#### `src/index.tsx` (Main Application)
**Size**: ~1200 lines  
**Purpose**: Hono web application with all API endpoints

**Key Endpoints**:
```typescript
// Document management
POST /api/upload              // Upload PDF with Bates numbering
GET  /api/documents           // List documents for matter
DELETE /api/documents/:id     // Delete document (v2.0.1)
POST /api/documents/:id/extract-text  // Store extracted text
GET  /api/documents/search    // Full-text search (v2.0.0)

// AI chat
POST /api/chat                // Claude AI conversation

// Reports
POST /api/reports/privilege-log   // Generate CSV privilege log
POST /api/reports/timeline        // Chronological timeline
POST /api/reports/hot-documents   // Hot documents report

// Utility
GET  /api/init-db             // Initialize database tables
GET  /api/matters             // List matters
GET  /api/classifications     // List classification types
```

**Database Integration**:
```typescript
const { DB, DOCUMENTS } = c.env  // Cloudflare bindings
// DB = D1 database
// DOCUMENTS = R2 bucket
```

#### `src/renderer.tsx` (HTML Template)
**Size**: ~20 lines  
**Purpose**: JSX renderer for HTML shell

**Key Elements**:
- Viewport meta tags for mobile
- TailwindCSS CDN link
- PDF.js library (v3.11.174)
- Static asset links

### Frontend Files

#### `public/static/app.js` (Client JavaScript)
**Size**: ~2000 lines  
**Purpose**: All frontend interactivity

**Key Functions**:
```javascript
// Mobile optimization
setupMobileOptimizations()      // Detect device, orientation
handleOrientationChange()       // React to rotation
setupPanelSwipeNavigation()     // v2.0.5 swipe system
createPanelIndicators()         // Bottom dots UI
createNavigationButtons()       // Prev/next buttons
navigateToPanel(index)          // Programmatic navigation

// Document management
loadDocuments()                 // Fetch and display docs
handleFileUpload(e)            // PDF upload handler
deleteDocument(id, filename)    // Delete with confirmation
extractTextFromPDF(pdfUrl, docId)  // PDF.js extraction

// Chat
sendChatMessage()              // Send to Claude AI
displayChatMessage(msg, type)  // Render message

// Search
performDocumentSearch(query)   // Full-text search API call

// Reports
generatePrivilegeLog()         // CSV export
generateTimeline()             // Chronological report
generateHotDocuments()         // Hot docs report
```

**Global State**:
```javascript
let currentMatter = 1;         // Active matter ID
let selectedSources = [];      // Checked documents for AI context
let notes = [];                // Loaded notes
let chatHistory = [];          // Conversation history
let currentPanel = 0;          // Mobile swipe position (0-2)
```

#### `public/static/style.css` (Responsive Styles)
**Size**: ~750 lines  
**Purpose**: All styling including mobile responsive design

**Key Sections**:
```css
/* Base styles (lines 1-360) */
.tab-button, .filter-tag, .document-card, etc.

/* Mobile & Tablet Responsive (lines 361-728) */
@media (max-width: 768px) and (orientation: portrait)
@media (max-width: 1024px) and (orientation: landscape)
@media (min-width: 768px) and (max-width: 1024px) and (orientation: portrait)

/* Touch device optimizations */
@media (hover: none) and (pointer: coarse)

/* Accessibility */
@media (prefers-reduced-motion: reduce)
@media (prefers-color-scheme: dark)
```

**Critical Portrait Styles** (v2.0.5):
```css
/* Swipeable panels */
.flex-1.flex.overflow-hidden {
  flex-direction: row !important;
  overflow-x: scroll !important;
  scroll-snap-type: x mandatory !important;
}

/* 18px chat text */
#chat-messages, .chat-message {
  font-size: 18px !important;
  line-height: 1.8 !important;
}
```

### Configuration Files

#### `wrangler.jsonc` (Cloudflare Config)
```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "tls-ediscovery",
  "compatibility_date": "2025-10-31",
  "pages_build_output_dir": "./dist",
  "compatibility_flags": ["nodejs_compat"],
  
  "r2_buckets": [{
    "binding": "DOCUMENTS",
    "bucket_name": "tlsediscoverydata"
  }],
  
  "d1_databases": [{
    "binding": "DB",
    "database_name": "tls-ediscovery-production",
    "database_id": "ddfaefee-f71c-47c8-b729-de7c2ffedc65"
  }]
}
```

#### `package.json` (NPM Scripts)
```json
{
  "scripts": {
    "dev": "vite",
    "dev:sandbox": "wrangler pages dev dist --ip 0.0.0.0 --port 3000",
    "build": "vite build",
    "preview": "wrangler pages dev dist",
    "deploy": "npm run build && wrangler pages deploy dist",
    "deploy:prod": "npm run build && wrangler pages deploy dist --project-name tls-ediscovery",
    "db:migrate:local": "wrangler d1 migrations apply tls-ediscovery-production --local",
    "db:migrate:prod": "wrangler d1 migrations apply tls-ediscovery-production",
    "db:console:local": "wrangler d1 execute tls-ediscovery-production --local",
    "db:console:prod": "wrangler d1 execute tls-ediscovery-production",
    "clean-port": "fuser -k 3000/tcp 2>/dev/null || true"
  }
}
```

#### `ecosystem.config.cjs` (PM2 Config)
```javascript
module.exports = {
  apps: [{
    name: 'tls-ediscovery',
    script: 'npx',
    args: 'wrangler pages dev dist --ip 0.0.0.0 --port 3000',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    watch: false,
    instances: 1,
    exec_mode: 'fork'
  }]
}
```

---

## 🧪 Testing Guide

### Manual Testing Checklist

#### Desktop Testing (Chrome/Safari)
- [ ] PDF upload works
- [ ] Document list populates
- [ ] PDF viewer opens document
- [ ] Search finds text in documents
- [ ] Chat responds with AI analysis
- [ ] Privilege log generates CSV
- [ ] Timeline report displays
- [ ] Hot documents report shows results
- [ ] Delete document with confirmation

#### Mobile Landscape Testing (iPhone/iPad)
- [ ] All 3 panels visible side-by-side
- [ ] Sources panel ~20% width
- [ ] Chat panel takes center (flexible)
- [ ] Notes panel ~25% width
- [ ] Text readable, no overflow issues

#### Mobile Portrait Testing (iPhone)
- [ ] Only 1 panel visible at a time (100vw each)
- [ ] Swipe left: Sources → Chat → Notes
- [ ] Swipe right: Notes → Chat → Sources
- [ ] Panel indicators visible at bottom (3 dots)
- [ ] Active dot expands to pill shape
- [ ] Prev/Next buttons visible on edges
- [ ] Chat text 18px, easily readable
- [ ] Panel headers show swipe directions
- [ ] Smooth snap behavior (no mid-screen stops)

### Automated Testing

**Currently**: No automated tests  
**Future**: Consider adding:
- Unit tests for JavaScript functions
- Integration tests for API endpoints
- E2E tests with Playwright for mobile flows

---

## 🚨 Critical User Feedback (v2.0.5)

### Issues Reported by Stephen Turman

**Date**: November 10, 2025  
**Device**: iPhone 15 Pro Max  
**Screenshots Provided**: 3 images

#### Issue #1: Chat Window Too Small
**Quote**: "the chat window is so small it is virtually impossible to read"

**Evidence**: Screenshot shows tiny text in chat messages

**Fix Applied** (v2.0.5):
- Increased all chat text to 18px (from 16px)
- Increased line-height to 1.8 (from 1.6)
- Increased padding to 1.25rem
- Applied to all message elements with `!important`

**Testing Required**:
- Open v2.0.5 on iPhone 15 Pro Max
- Navigate to Chat panel
- Verify text is comfortable to read
- Check if further enlargement needed

#### Issue #2: Cannot Swipe Between Panels
**Quote**: "the slipe left and right between panels in portrait mode still does not work"

**Evidence**: 3 screenshots showing inability to access different panels

**Fix Applied** (v2.0.5):
- Added JavaScript inline style forcing for each panel
- Forced `flexDirection: 'row'` on container
- Forced `width: 100vw` on each child
- Added `flexShrink: 0` to prevent compression
- Added `scroll-snap-stop: always` for iOS
- Added extensive console logging for debugging

**Testing Required**:
- Open Safari Developer Tools (Mac → Develop → iPhone)
- Open v2.0.5 on iPhone 15 Pro Max in portrait
- Attempt to swipe left/right
- Check console for logs:
  ```
  setupPanelSwipeNavigation: isMobile=true
  Panel container scroll width: 1290
  Touch start detected
  Touch move detected
  ```
- Verify panel indicators update when swiping
- Verify panels snap cleanly to position

### Next Steps After v2.0.5 Test

**If Swipe Still Doesn't Work**:
1. Check console logs for JavaScript errors
2. Verify `scroll-snap-type: x mandatory` is applied
3. Test with `touch-action: pan-x` on container
4. Consider alternative swipe detection (touch events)

**If Text Still Too Small**:
1. Increase to 20px or larger
2. Add font-size-adjust for better rendering
3. Consider using system font stack
4. Add user-controlled text size setting

---

## 📖 Additional Documentation

### In Repository

- **README.md** - Project overview and user guide
- **VERSION.md** - Detailed version history
- **CHANGELOG.md** - Chronological change log
- **DEPLOYMENT_INSTRUCTIONS.md** - Step-by-step deployment
- **MOBILE_PORTRAIT_TESTING_v2.0.4.md** - Testing guide for v2.0.4
- **IMPLEMENTATION_SUMMARY.md** - Technical implementation details
- **TESTING_TEXT_EXTRACTION.md** - Text extraction testing guide

### External Resources

- **Hono Documentation**: https://hono.dev/
- **Cloudflare Workers Docs**: https://developers.cloudflare.com/workers/
- **Cloudflare D1 Docs**: https://developers.cloudflare.com/d1/
- **Cloudflare R2 Docs**: https://developers.cloudflare.com/r2/
- **Anthropic Claude API**: https://docs.anthropic.com/
- **PDF.js Documentation**: https://mozilla.github.io/pdf.js/

---

## 🎯 Immediate Next Actions

### For New Developer

1. **Setup Environment**
   ```bash
   git clone https://github.com/set2374/SET-App-Ceation.git
   cd SET-App-Ceation
   npm install
   ```

2. **Get API Keys**
   - Request `ANTHROPIC_API_KEY` from Stephen Turman
   - Create `.dev.vars` file with key

3. **Test Locally**
   ```bash
   npm run db:migrate:local
   npm run build
   pm2 start ecosystem.config.cjs
   curl http://localhost:3000
   ```

4. **Test v2.0.5 on iPhone 15 Pro Max**
   - Open https://3448cfb6.tls-ediscovery.pages.dev
   - Hold phone vertically (portrait)
   - Try swiping between panels
   - Check if chat text is readable
   - Open Safari Developer Tools for console logs

5. **Report Findings**
   - Does swipe work? (Yes/No + details)
   - Is chat text readable? (Yes/No + screenshot)
   - Any console errors? (Copy full error log)
   - Any visual issues? (Screenshots)

### For Code Review

**Focus Areas**:
1. **Mobile CSS** (`public/static/style.css` lines 389-550)
   - Are media queries correct?
   - Are selectors specific enough?
   - Any Tailwind conflicts?

2. **Swipe JavaScript** (`public/static/app.js` lines 217-400)
   - Is panel detection working?
   - Are inline styles being applied?
   - Is scroll-snap functioning?

3. **Text Sizing** (`public/static/style.css` lines 501-523)
   - Is 18px large enough?
   - Are all chat elements covered?
   - Any missing selectors?

### For Feature Development

**High Priority** (After v2.0.5 validated):
1. Batch text extraction for 5 old documents
2. OCR integration for scanned PDFs (v2.1.0)
3. User authentication (v2.2.0)

**Medium Priority**:
1. Advanced search (Boolean operators)
2. Bulk classification operations
3. Export all notes to Word/PDF

**Low Priority**:
1. Dark mode support
2. Custom Bates number formats
3. Multi-language support

---

## 🤝 Support Contacts

### Primary Contact
**Stephen Turman, Esq.**  
Turman Legal Solutions PLLC  
Email: [Contact through GenSpark AI]

### Technical Support
**AI Development Team**  
Platform: GenSpark AI  
Access: Through client account

### Emergency Rollback
If critical issue in production:
1. Use Cloudflare Dashboard to rollback
2. Notify Stephen Turman immediately
3. Document issue in GitHub Issues
4. Test fix thoroughly before redeploying

---

## 📄 License & Legal

**Proprietary Software**  
Copyright © 2025 Turman Legal Solutions PLLC  
All rights reserved.

**Confidentiality**: This codebase contains proprietary legal software. Do not share, distribute, or use outside of authorized development.

**Data Security**: Application handles attorney-client privileged information. Maintain strict confidentiality of all documents and communications.

---

## ✅ Pre-Deployment Checklist

Before deploying any version:

- [ ] Code compiles without errors (`npm run build`)
- [ ] Local testing completed successfully
- [ ] Mobile testing on real device (iPhone/iPad)
- [ ] Console logs reviewed (no critical errors)
- [ ] Git committed with descriptive message
- [ ] Version number updated in documentation
- [ ] CHANGELOG.md updated with changes
- [ ] API keys configured (production secrets)
- [ ] Database migrations applied (if needed)
- [ ] Rollback plan identified (previous stable version)
- [ ] Stakeholder notified of deployment

---

**Document Version**: 1.0  
**Last Updated**: November 10, 2025  
**Next Review**: After v2.0.5 user testing  
**Maintainer**: AI Development Team (GenSpark AI)

---

## 🔗 Quick Links Summary

| Resource | URL |
|----------|-----|
| **Production (Latest)** | https://3448cfb6.tls-ediscovery.pages.dev |
| **GitHub Repository** | https://github.com/set2374/SET-App-Ceation |
| **Cloudflare Dashboard** | https://dash.cloudflare.com/ |
| **Hono Documentation** | https://hono.dev/ |
| **Anthropic Claude API** | https://docs.anthropic.com/ |

---

**END OF DEVELOPER HANDOFF DOCUMENT**
