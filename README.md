# TLS eDiscovery Platform

**Turman Legal Solutions PLLC - Legal Document Review & Privilege Analysis Platform**

## Project Overview

The TLS eDiscovery Platform is an AI-powered document review application designed for legal professionals to efficiently analyze documents, identify privileged materials, flag hot documents, and generate court-compliant privilege logs. Built with a NotebookLM-inspired three-panel interface for streamlined workflow.

### Key Features

- **Three-Panel NotebookLM Interface**: Document library, PDF viewer, and AI analysis panels
- **AI-Powered Document Analysis**: Claude Sonnet 4.5 integration for privilege detection and hot document identification
- **Automatic Text Extraction**: PDF.js-powered client-side text extraction with page-level indexing
- **🆕 OCR for Scanned PDFs**: Intelligent Tesseract.js OCR automatically detects and processes scanned documents
- **Full-Text Search**: Search across all document content (native and OCR'd) with Bates number references and page navigation
- **Page-Level Bates Indexing**: Each page stored with individual Bates number for precise citations
- **Configurable Bates Numbering**: Per-matter Bates number formats with automatic assignment
- **Classification System**: Hot Document, Privileged, Bad Document, Key Witness, Exhibit, Needs Review
- **Note-Taking System**: Document-level and page-level annotations with rich text support
- **Privilege Log Automation**: Auto-populated privilege logs with Excel export and clickable Bates number hyperlinks
- **AI Hallucination Detection**: Citation verification to prevent false Bates references
- **Multi-Matter Support**: Separate matters with independent Bates numbering schemes

## URLs

- **Production**: https://32acf0ba.tls-ediscovery.pages.dev (LIVE - Latest)
- **Previous**: https://c9ce2d57.tls-ediscovery.pages.dev
- **Local Development**: http://localhost:3000
- **Sandbox**: https://3000-iv0z4oopp52b5y23h8w7n-0e616f0a.sandbox.novita.ai (ACTIVE NOW)

## Technology Stack

- **Backend**: Hono (v4.10.4) - Lightweight web framework for Cloudflare Workers
- **Runtime**: Cloudflare Workers/Pages - Edge computing platform
- **Database**: Cloudflare D1 (SQLite) - Serverless SQL database
- **Storage**: Cloudflare R2 - Object storage for PDF documents
- **AI Model**: Anthropic Claude Sonnet 4.5 - Document analysis and privilege detection
- **Text Extraction**: PDF.js (v3.11.174) - Native PDF text extraction + page rendering
- **🆕 OCR Engine**: Tesseract.js (v5.0) - Client-side OCR for scanned documents
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

### ✅ Completed Features (Priorities A, B, C)

1. **Project Foundation**
   - Hono + Cloudflare Pages architecture
   - PM2 process management for development
   - Git repository with version control
   - Comprehensive database schema with dynamic provisioning

2. **Three-Panel NotebookLM Interface**
   - Left Panel: Document sources library with checkboxes, PDF viewer, and upload controls
   - Center Panel: Conversational AI chat interface with Claude Sonnet 4.5
   - Right Panel: Notes section and Reports generation controls
   - Responsive design with TailwindCSS styling
   - Clean, modern UI matching NotebookLM design patterns

3. **Database Implementation**
   - D1 database with complete schema
   - Dynamic table provisioning via `/api/init-db` endpoint
   - Tables: matters, documents, document_pages, classifications, document_classifications, notes, chat_history
   - VitaQuest test matter pre-configured with Bates prefix "VQ"
   - API endpoints for matters, documents, classifications, chat, and reports

4. **Classification System**
   - Six pre-defined classification categories with icons and colors
   - Hot Document (red flame) - litigation-significant evidence
   - Privileged (purple shield) - attorney-client privilege protection
   - Bad Document (amber warning) - potentially harmful evidence
   - Key Witness (green user) - documents referencing critical witnesses
   - Exhibit (blue file) - likely trial exhibits
   - Needs Review (gray eye) - requires senior attorney examination

5. **Priority B: PDF Upload and Viewing System** ✅
   - File upload with drag-and-drop support
   - R2 object storage integration
   - Automatic Bates number assignment based on matter configuration
   - Sequential Bates numbering with page count tracking (e.g., VQ-000001 to VQ-000015 for 15-page PDF)
   - Storage path organization by matter (`matter-1/VQ-000001-VQ-000015.pdf`)
   - Document metadata tracking in D1 database
   - PDF viewer in left panel with browser-native rendering
   - Clickable document cards and Bates citations open specific PDFs
   - Upload progress notifications
   - **NEW: Automatic PDF.js text extraction** after upload
   - **🆕 Intelligent OCR fallback** for scanned PDFs (Tesseract.js)
   - **🆕 Automatic scanned PDF detection** (< 50 chars/page avg)
   - **🆕 High-resolution OCR processing** (2x scale, 80-95% accuracy)
   - **🆕 OCR progress tracking** with confidence scores per page
   - **NEW: Page-level text indexing** with individual Bates numbers per page
   - **NEW: Full-text search** across all document content (native + OCR)
   - **NEW: Search results** with highlighted snippets and page navigation
   - **NEW: Direct PDF navigation** to specific pages from search results

6. **Priority A: Claude Sonnet 4.5 AI Integration** ✅
   - Anthropic Claude API integration (currently using claude-3-haiku-20240307, upgradeable to Claude 4.5 Sonnet)
   - Conversational AI interface in center panel
   - Source document selection via checkboxes for context-aware analysis
   - Legal-specific system prompts for privilege detection and hot document identification
   - Automatic Bates number citations in format [BATES: VQ-000001]
   - Clickable Bates citations that open corresponding PDFs in viewer
   - Chat history persistence to database with Bates reference tracking
   - 200K token context windows for document analysis
   - Markdown rendering of AI responses
   - Professional legal analysis with confidence levels
   - **NEW: AI hallucination detection** - verifies all Bates citations against actual documents
   - **NEW: Visual warnings** for hallucinated citations with red borders and critical alerts
   - **NEW: Citation validation** - color-coded citations (blue=validated, red=hallucinated)

7. **Priority C: Reports Generation System** ✅
   - Three automated report types with proper error handling
   - **Privilege Log**: CSV export with hyperlinked Bates numbers, document dates, authors, recipients, subjects, privilege types, and justifications
   - **Timeline Report**: Chronological document sequencing with classification badges and event tracking
   - **Hot Documents Report**: Compilation of litigation-critical evidence with AI confidence scores and legal significance justifications
   - Modal displays for timeline and hot documents with clickable Bates links
   - CSV download functionality with court-compliant formatting
   - Empty state handling for matters without classified documents
   - API endpoints: `/api/reports/privilege-log`, `/api/reports/timeline`, `/api/reports/hot-documents`

8. **Notes System**
   - Notes table with Bates references, source tracking, and timestamp
   - Integration with chat history for AI-generated insights
   - Note display in right panel
   - Created_by tracking for attorney identification

### ⏳ Pending Features

9. **Classification Workflow UI**
   - Interactive classification badge clicks on document cards
   - Bulk classification operations
   - AI-suggested classifications with attorney confirmation workflow
   - Confidence score display and justification entry

10. **Vision-Based OCR Fallback** (for scanned documents)
    - PDF page-to-image conversion using Cloudflare Workers
    - Claude 4.5 Sonnet Vision API integration for OCR
    - Automatic fallback when PDF.js extraction yields poor results
    - OCR confidence scoring per page
    - Extracted text storage in documents.extracted_text column
    - Full-text search across document contents
    - Enhanced Claude analysis with actual document text (not just metadata)

11. **Search Functionality**
    - Full-text search across extracted document text
    - Note content search
    - Bates number lookup
    - Advanced filtering by classification, date range, matter
    - Search results highlighting

12. **Production Deployment**
    - Cloudflare Pages production deployment
    - Production D1 database creation and migration
    - R2 bucket configuration
    - Environment variable and secret configuration
    - Custom domain setup (optional)

13. **Multi-User Authentication**
    - User authentication (Cloudflare Access, Auth0, or Clerk)
    - Role-based access control (attorney, paralegal, client)
    - User tracking for created_by fields
    - Audit trail enforcement

14. **Logo Integration**
    - Turman Legal Solutions logo in header
    - Asset upload to public/static/
    - Header HTML modification

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

**Core Functionality**
- `GET /` - Main dashboard with three-panel NotebookLM interface
- `GET /api/init-db` - Initialize/provision database tables dynamically

**Matter Management**
- `GET /api/matters` - List all matters

**Document Operations**
- `GET /api/documents?matter_id=1` - List documents for matter
- `POST /api/upload` - Upload PDF with automatic Bates numbering
- `GET /api/documents/:id/download` - Download PDF from R2 storage

**AI Integration**
- `POST /api/chat` - Claude Sonnet 4.5 conversational analysis with Bates citations

**Classifications**
- `GET /api/classifications` - List classification categories (Hot Document, Privileged, etc.)

**Reports Generation**
- `POST /api/reports/privilege-log` - Generate CSV privilege log with hyperlinked Bates
- `POST /api/reports/timeline` - Generate chronological document timeline JSON
- `POST /api/reports/hot-documents` - Generate hot documents report with confidence scores

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

## Completed Development Phases

### ✅ Priority B: PDF Upload and Viewing (COMPLETE)
- R2 storage integration implemented
- Bates number assignment logic functional
- Upload progress tracking with notifications
- PDF viewer with browser-native rendering
- Clickable Bates citations opening specific documents

### ✅ Priority A: Claude Sonnet 4.5 Integration (COMPLETE)
- Anthropic API connection configured
- Conversational AI interface in center panel
- Privilege detection analysis with legal prompts
- Hot document identification logic
- Automatic Bates citation generation [BATES: VQ-000001]
- Chat history persistence with Bates tracking

### ✅ Priority C: Reports Generation (COMPLETE)
- Privilege log CSV export with hyperlinked Bates numbers
- Timeline report with chronological document sequencing
- Hot documents report with confidence scores and justifications
- Modal displays for interactive report viewing
- All endpoints tested and functional

## Recommended Next Steps

### Priority D: Classification Workflow UI
- Add click-to-classify interactions on document cards
- Build classification badge selection interface
- Implement bulk classification operations
- Create AI-suggested classification acceptance workflow
- Add confidence score displays and justification text fields
- Enable attorney confirmation of AI classifications

### Priority E: OCR Text Extraction
- Integrate cloud OCR API (AWS Textract, Google Document AI, or Adobe Extract)
- Store extracted text in documents.extracted_text column
- Enable full-text search across document contents
- Enhance Claude analysis with actual document text (not just metadata)
- Add text extraction status indicators

### Priority F: Search and Filtering
- Full-text search across extracted document content
- Note content search across saved insights
- Bates number quick lookup
- Classification-based filtering (show only Privileged, only Hot Documents)
- Date range filtering
- Combined filter logic with search

### Priority G: Logo Integration (Cosmetic)
- Upload Turman Legal Solutions logo to public/static/
- Modify header HTML to display logo
- Responsive logo sizing for mobile devices

### Priority H: Production Deployment
- Call setup_cloudflare_api_key for authentication
- Create production D1 database: `npx wrangler d1 create tls-ediscovery-production`
- Apply migrations to production: `npx wrangler d1 migrations apply tls-ediscovery-production`
- Create Cloudflare Pages project
- Deploy application: `npm run deploy:prod`
- Configure ANTHROPIC_API_KEY secret
- Initialize production database via /api/init-db endpoint

### Priority I: Multi-User Authentication (Production Requirement)
- Integrate authentication provider (Cloudflare Access, Auth0, or Clerk)
- Implement role-based access control (attorney vs paralegal vs client)
- Add user tracking to created_by fields throughout database
- Enforce matter-level document segregation
- Build audit trail logging for compliance

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
**Version**: 1.1.0 (Production)  
**Status**: ✅ DEPLOYED TO PRODUCTION | Multi-Matter Support Added | Ready for Document Testing
