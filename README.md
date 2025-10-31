# TLS eDiscovery Platform

**Turman Legal Solutions PLLC - Legal Document Review & Privilege Analysis Platform**

## Project Overview

The TLS eDiscovery Platform is an AI-powered document review application designed for legal professionals to efficiently analyze documents, identify privileged materials, flag hot documents, and generate court-compliant privilege logs. Built with a NotebookLM-inspired three-panel interface for streamlined workflow.

### Key Features

- **Three-Panel NotebookLM Interface**: Document library, PDF viewer, and AI analysis panels
- **AI-Powered Document Analysis**: Claude Sonnet 4.5 integration for privilege detection and hot document identification
- **Configurable Bates Numbering**: Per-matter Bates number formats with automatic assignment
- **Classification System**: Hot Document, Privileged, Bad Document, Key Witness, Exhibit, Needs Review
- **Note-Taking System**: Document-level and page-level annotations with rich text support
- **Privilege Log Automation**: Auto-populated privilege logs with Excel export and clickable Bates number hyperlinks
- **Search Functionality**: Full-text search across documents and notes
- **Multi-Matter Support**: Separate matters with independent Bates numbering schemes

## URLs

- **Local Development**: http://localhost:3000
- **Sandbox**: https://3000-iv0z4oopp52b5y23h8w7n-ad490db5.sandbox.novita.ai
- **Production** (when deployed): Will be at https://tls-ediscovery.pages.dev

## Technology Stack

- **Backend**: Hono (v4.10.4) - Lightweight web framework for Cloudflare Workers
- **Runtime**: Cloudflare Workers/Pages - Edge computing platform
- **Database**: Cloudflare D1 (SQLite) - Serverless SQL database
- **Storage**: Cloudflare R2 - Object storage for PDF documents
- **AI Model**: Anthropic Claude Sonnet 4.5 - Document analysis and privilege detection
- **Frontend**: TailwindCSS + Vanilla JavaScript
- **Deployment**: Wrangler CLI

## Data Architecture

### Database Schema

**Matters Table**
- Matter management with configurable Bates numbering formats
- Fields: id, name, description, bates_prefix, bates_format, next_bates_number

**Documents Table**
- PDF metadata and storage references
- Fields: id, matter_id, filename, bates_start, bates_end, page_count, file_size, storage_path, extracted_text, review_status

**Document Pages Table**
- Individual page tracking with Bates numbers
- Fields: id, document_id, page_number, bates_number, page_text

**Classifications Table**
- Document classification categories
- Pre-loaded: Hot Document, Privileged, Bad Document, Key Witness, Exhibit, Needs Review

**Document Classifications Table**
- Many-to-many relationship between documents and classifications
- Fields: id, document_id, classification_id, confidence_score, ai_suggested, attorney_confirmed, justification

**Notes Table**
- Document and page-level annotations
- Fields: id, document_id, page_number, bates_number, note_text, note_type, ai_generated, created_by

**Privilege Log Entries Table**
- Court-compliant privilege log data
- Fields: id, document_id, bates_number, document_date, author, recipients, subject, privilege_type, description

**AI Analysis Table**
- AI model results and metadata
- Fields: id, document_id, analysis_type, ai_model, result_data, confidence_score, tokens_used, analysis_cost

**Audit Log Table**
- Complete audit trail for litigation compliance
- Fields: id, user_name, action, entity_type, entity_id, details, ip_address, created_at

### Storage Services

- **Cloudflare R2**: PDF document storage with CDN delivery
- **Cloudflare D1**: Relational database for metadata, notes, classifications
- **Local Development**: Uses `.wrangler/state/v3/d1/` for local SQLite database

## Current Status

### ✅ Completed Features

1. **Project Foundation**
   - Hono + Cloudflare Pages architecture
   - PM2 process management for development
   - Git repository with version control
   - Comprehensive database schema with migrations

2. **Three-Panel Interface**
   - Left Panel: Document library with upload area, search, and filters
   - Center Panel: PDF viewer placeholder with navigation controls
   - Right Panel: Tabbed interface for AI Analysis, Notes, and Classifications
   - Responsive design with TailwindCSS styling

3. **Database Implementation**
   - D1 database with complete schema
   - API endpoints for matters, documents, classifications
   - Database initialization endpoint (`/api/init-db`)
   - VitaQuest test matter pre-configured

4. **Classification System**
   - Six pre-defined classification categories with icons and colors
   - Classification API endpoint functional
   - UI for selecting and displaying classifications

### 🚧 In Progress

5. **Document Upload System**
   - File upload UI implemented
   - Backend integration with R2 storage pending
   - Bates number assignment logic pending
   - OCR text extraction integration pending

### ⏳ Pending Features

6. **PDF Viewer Integration**
   - PDF.js library integration
   - Page navigation with Bates number display
   - Zoom controls and page rendering

7. **Claude Sonnet 4.5 AI Integration**
   - Anthropic API key configuration
   - Privilege detection analysis endpoint
   - Hot document identification logic
   - Document summarization
   - Entity extraction (people, dates, amounts)

8. **Note System**
   - Note creation, editing, deletion
   - Page-specific annotation coordinates
   - AI-generated notes with accept/reject workflow
   - Cross-document note references

9. **Privilege Log Automation**
   - Privilege log data structure completion
   - Excel export with hyperlinked Bates numbers
   - Court-compliant formatting
   - Batch privilege tagging

10. **Search Functionality**
    - Full-text search across extracted document text
    - Note content search
    - Bates number lookup
    - Advanced filtering by classification, date range, matter

11. **Deployment**
    - Cloudflare Pages production deployment
    - Environment variable configuration
    - Custom domain setup
    - Production D1 database creation

## Development Guide

### Prerequisites

- Node.js 18+
- npm
- PM2 (pre-installed in sandbox)
- Wrangler CLI (included in devDependencies)

### Local Setup

```bash
# Navigate to project directory
cd /home/user/webapp

# Install dependencies (already done)
npm install

# Initialize database
curl http://localhost:3000/api/init-db

# Build application
npm run build

# Start development server with PM2
pm2 start ecosystem.config.cjs

# View logs
pm2 logs tls-ediscovery --nostream

# Restart after changes
npm run build && pm2 restart tls-ediscovery
```

### Available Scripts

```bash
npm run dev              # Vite development server (local machine)
npm run dev:sandbox      # Wrangler pages dev for sandbox
npm run build            # Build production bundle
npm run preview          # Preview production build
npm run deploy           # Deploy to Cloudflare Pages
npm run deploy:prod      # Deploy with project name
npm run db:migrate:local # Apply D1 migrations locally
npm run db:migrate:prod  # Apply D1 migrations to production
npm run clean-port       # Kill processes on port 3000
```

### PM2 Management

```bash
pm2 list                           # List all processes
pm2 logs tls-ediscovery --nostream # View logs without streaming
pm2 restart tls-ediscovery         # Restart application
pm2 stop tls-ediscovery            # Stop application
pm2 delete tls-ediscovery          # Remove from PM2
```

### API Endpoints

- `GET /` - Main dashboard interface
- `GET /api/init-db` - Initialize database schema (run once)
- `GET /api/matters` - List all matters
- `GET /api/documents?matter_id=1` - List documents for matter
- `GET /api/classifications` - List classification categories
- `POST /api/documents` - Upload document (pending)
- `POST /api/notes` - Create note (pending)
- `POST /api/analyze` - AI analysis (pending)

## Configuration

### Bates Numbering

Configure Bates number format per matter in the `matters` table:

```sql
-- Example formats:
-- VQ-000001, VQ-000002, etc. (format: "VQ-SEQUENCE")
-- TURMAN-SMITH-000001 (format: "TURMAN-MATTER-SEQUENCE")
-- TLS-2024-VITAQUEST-000001 (format: "TLS-YEAR-MATTER-SEQUENCE")
```

### AI Model Configuration

Set `ANTHROPIC_API_KEY` environment variable for Claude Sonnet 4.5 integration:

```bash
# Local development (.dev.vars file)
ANTHROPIC_API_KEY=sk-ant-...

# Production (wrangler secret)
npx wrangler pages secret put ANTHROPIC_API_KEY --project-name tls-ediscovery
```

### Cloud Storage

- **R2 Bucket**: `tls-ediscovery-documents` (configured in wrangler.jsonc)
- **D1 Database**: `tls-ediscovery-production` (configured in wrangler.jsonc)

## User Guide

### Document Upload

1. Select matter from dropdown (currently: VitaQuest)
2. Click upload area or drag-and-drop PDF files
3. System automatically assigns Bates numbers based on matter configuration
4. Documents appear in left panel library

### Document Review

1. Click document in left panel to open in center viewer
2. Navigate pages using prev/next buttons or page number input
3. Current Bates number displays in blue badge
4. View AI analysis in right panel "AI Analysis" tab

### Classification

1. Select document to review
2. Switch to "Tags" tab in right panel
3. Check classification boxes (Hot Document, Privileged, Bad Document, etc.)
4. Add justification notes for each classification

### Notes

1. Open document for review
2. Switch to "Notes" tab in right panel
3. Click "Add Note" button
4. Enter note text and associate with specific page if needed
5. Notes display with author, timestamp, and Bates reference

### Privilege Log Export

1. Review and classify documents as Privileged
2. Navigate to export functionality
3. Generate Excel privilege log with clickable Bates number hyperlinks
4. Each hyperlink opens the platform to the specific document and page

## Next Development Steps

### Priority 1: Document Upload (Week 2)
- Implement R2 storage integration
- Build Bates number assignment logic
- Integrate cloud OCR API for text extraction
- Create upload progress tracking

### Priority 2: PDF Viewer (Week 2-3)
- Integrate PDF.js library
- Implement page rendering and navigation
- Add zoom controls
- Display Bates numbers per page

### Priority 3: AI Integration (Week 3-4)
- Configure Anthropic API connection
- Build privilege detection analysis
- Implement hot document identification
- Create document summarization
- Extract entities (people, dates, amounts)

### Priority 4: Note System (Week 4)
- Build note CRUD operations
- Implement page-specific annotations
- Create AI note suggestion workflow
- Add cross-document references

### Priority 5: Privilege Log & Export (Week 5)
- Complete privilege log data structure
- Build Excel export with hyperlinks
- Implement Bates number link resolution
- Add hot document report generation

### Priority 6: Search & Filters (Week 5-6)
- Full-text search across documents
- Note content search
- Bates number lookup
- Classification filters
- Date range filters

### Priority 7: Production Deployment (Week 6)
- Create production D1 database
- Configure Cloudflare Pages project
- Set up environment variables
- Deploy to production
- Configure custom domain

## Deployment Instructions

### Production Deployment to Cloudflare Pages

1. **Setup Cloudflare API Authentication**
```bash
# This tool configures CLOUDFLARE_API_TOKEN environment variable
# Follow prompts to Deploy tab if not configured
```

2. **Create Production D1 Database**
```bash
npx wrangler d1 create tls-ediscovery-production
# Copy database_id to wrangler.jsonc
```

3. **Apply Migrations to Production**
```bash
npx wrangler d1 migrations apply tls-ediscovery-production
```

4. **Create Cloudflare Pages Project**
```bash
npx wrangler pages project create tls-ediscovery \
  --production-branch main \
  --compatibility-date 2025-10-31
```

5. **Deploy Application**
```bash
npm run deploy:prod
```

6. **Initialize Production Database**
```bash
# Visit https://tls-ediscovery.pages.dev/api/init-db after deployment
```

7. **Configure Secrets**
```bash
npx wrangler pages secret put ANTHROPIC_API_KEY --project-name tls-ediscovery
```

## Security & Compliance

- **Attorney-Client Privilege**: All document content remains encrypted and private
- **Audit Trail**: Complete logging of all user actions and document access
- **Role-Based Access**: Matter-level document segregation (to be implemented)
- **Data Encryption**: Cloudflare R2 encryption at rest and in transit
- **API Security**: CORS enabled for API routes with authentication (to be implemented)

## Technical Notes

- **Local D1 Database**: Stored in `.wrangler/state/v3/d1/` directory
- **Hot Reload**: Wrangler dev server supports automatic reload for code changes
- **Build Output**: Compiled Worker bundle in `dist/_worker.js`
- **Static Files**: Public assets in `public/static/` directory served at `/static/*`

## Support & Documentation

For questions or issues:
- Review this README
- Check PM2 logs: `pm2 logs tls-ediscovery --nostream`
- Inspect browser console for frontend errors
- Review wrangler logs in `.wrangler/` directory

## License

Proprietary - Turman Legal Solutions PLLC  
For internal use only.

---

**Last Updated**: October 31, 2025  
**Version**: 0.1.0 (Alpha - MVP Development)  
**Status**: ✅ Foundation Complete | 🚧 Core Features In Progress
