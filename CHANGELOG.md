# Changelog - TLS eDiscovery Platform

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-11-01

### Added
- **PDF.js Text Extraction**: Automatic client-side text extraction after PDF upload
  - Extracts text from each page individually
  - Stores page-level text with individual Bates numbers
  - Shows progress notifications during extraction
  - Handles extraction errors gracefully without failing upload
  - Function: `extractTextFromPDF()` in `public/static/app.js`

- **Full-Text Search API**: New backend endpoint for searching document content
  - Endpoint: `GET /api/documents/search?q=query&matter_id=1`
  - Searches both document-level and page-level text
  - Returns results with Bates numbers, filenames, page numbers
  - Minimum 3 characters required for query
  - Limits: 50 documents, 100 pages per query

- **Search UI**: Interactive search interface in left panel
  - Uses existing "Search sources..." input field
  - Debounced input (500ms delay) to reduce API calls
  - Displays results with yellow highlighting
  - Shows page-level matches with context snippets
  - Search term highlighted in snippets
  - Clickable results open PDF to specific page
  - Shows match count per document

- **Page Navigation**: Enhanced PDF viewer with page jumping
  - Updated `openPDFViewer(docId, pageNumber)` function
  - Opens PDF to specific page from search results
  - Uses iframe with `#page=N` anchor
  - Shows page number in success notification

- **AI Hallucination Detection**: Validates Bates citations against database
  - Checks all cited Bates numbers exist in database
  - Returns separate lists: validated vs hallucinated citations
  - Visual warning with red border for hallucinations
  - Color-coded citations in UI (blue=valid, red=invalid)
  - Warning message: "⚠️ AI HALLUCINATION DETECTED"

- **Database Schema Enhancements**:
  - `documents.extracted_text` TEXT column for full document text
  - `documents.text_extracted` BOOLEAN flag for search filtering
  - `document_pages.page_text` TEXT column for page-level content
  - `document_pages.ocr_confidence` REAL column (default 1.0)

- **API Endpoint**: `POST /api/documents/:id/extract-text`
  - Accepts: `{ pages, full_text, page_count }`
  - Calculates individual Bates numbers per page
  - Updates document with correct page count and bates_end
  - Updates matter's next_bates_number if needed
  - Returns: `{ success, pages_extracted, bates_range, searchable }`

- **Documentation**: Three comprehensive guides
  - IMPLEMENTATION_SUMMARY.md - Technical implementation details
  - TESTING_TEXT_EXTRACTION.md - Complete testing guide
  - GITHUB_SUMMARY.md - Repository overview for AI review

### Changed
- **Claude Model Identifier**: Updated to working model name
  - Changed from: `claude-3-5-sonnet-latest` (invalid)
  - Changed to: `claude-3-haiku-20240307` (working)
  - Reason: API key only has access to Haiku tier models

- **File Upload Handler**: Enhanced to trigger text extraction
  - Modified `handleFileUpload()` function
  - Calls `extractTextFromPDF()` after successful upload
  - Shows extraction progress and completion notifications

- **PDF Viewer Function**: Added optional page parameter
  - Signature: `openPDFViewer(docId, pageNumber = 1)`
  - Supports direct navigation to specific pages
  - Backward compatible (defaults to page 1)

- **Search Input Behavior**: Repurposed existing search field
  - Now triggers full-text search (was just document filtering)
  - Minimum 3 characters required
  - Empty input resets to full document list
  - Debounced to prevent excessive API calls

- **README.md**: Updated with new features
  - Added text extraction to Key Features
  - Added search capabilities to Key Features
  - Updated Completed Features section
  - Updated sandbox URL

### Fixed
- **Bates Number Calculation**: Fixed for multi-page documents
  - Now correctly calculates bates_end based on actual page count
  - Updates after text extraction determines real page count
  - Previously allocated only 1 page per document

- **Matter Bates Number Tracking**: Fixed automatic updates
  - Updates matter.next_bates_number when document extends allocation
  - Prevents Bates number collisions
  - Maintains sequential numbering across documents

- **Claude API Authentication**: Fixed model not found errors
  - Root cause: Invalid model identifier string
  - Solution: Use valid Haiku model identifier
  - Note: API key still limited to Haiku tier

### Security
- **Citation Verification**: Prevents AI hallucinations
  - Validates all Bates citations before displaying to user
  - Prevents false legal citations in attorney work product
  - Critical for litigation compliance

- **Search Input Validation**: Prevents malicious queries
  - Minimum character requirement (3 chars)
  - Query length limits in SQL
  - Escapes special characters in search display

### Performance
- **Client-Side Extraction**: Eliminates server CPU usage
  - PDF processing happens in browser using PDF.js
  - No server memory or compute costs
  - Scales to large PDFs without server impact

- **Debounced Search**: Reduces unnecessary API calls
  - 500ms delay prevents search on every keystroke
  - Improves responsiveness
  - Reduces database query load

- **Search Result Limits**: Prevents slow queries
  - Maximum 50 documents per search
  - Maximum 100 pages per search
  - Results returned in <2 seconds typically

### Known Issues
- **OCR Not Implemented**: Scanned documents not searchable
  - Text extraction only works on native PDF text
  - Scanned images yield empty extraction
  - Planned for v2.1.0 using Claude Vision API

- **Simple Search**: No advanced query features
  - No boolean operators (AND, OR, NOT)
  - No phrase search with quotes
  - Case-insensitive only
  - Planned for v2.2.0

- **Browser Performance**: Large PDFs may slow extraction
  - 100+ page PDFs can take 30+ seconds
  - May cause browser memory issues
  - No progress cancellation option

## [1.0.0] - 2025-10-31

### Added
- **Three-Panel NotebookLM Interface**
  - Left panel: Document sources library with checkboxes
  - Center panel: AI chat interface
  - Right panel: Notes and reports
  - Responsive TailwindCSS design

- **PDF Upload System**
  - Drag-and-drop file upload
  - Cloudflare R2 object storage integration
  - Automatic Bates number assignment
  - Sequential numbering per matter
  - Upload progress notifications

- **Claude AI Integration**
  - Conversational chat interface
  - Anthropic Claude API integration
  - Legal-specific system prompts
  - Automatic Bates citations: [BATES: VQ-000001]
  - Clickable citations open corresponding PDFs
  - Chat history persistence

- **Privilege Log Generation**
  - CSV export with hyperlinked Bates numbers
  - Document dates, authors, recipients
  - Subject lines and privilege types
  - Justification text
  - Court-compliant formatting

- **Timeline Report**
  - Chronological document sequencing
  - Classification badges
  - Event tracking
  - Modal display with navigation

- **Hot Documents Report**
  - AI-identified critical evidence
  - Confidence scores
  - Legal significance justifications
  - Compilation for litigation review

- **Multi-Matter Management**
  - Unlimited matters with independent Bates schemes
  - Create new matter modal
  - Matter selector in header
  - Validation: 2-6 letter prefixes
  - Uniqueness checks

- **Classification System**
  - Six pre-defined categories:
    - Hot Document (red flame)
    - Privileged (purple shield)
    - Bad Document (amber warning)
    - Key Witness (green user)
    - Exhibit (blue file)
    - Needs Review (gray eye)

- **Notes System**
  - Document-level annotations
  - Page-level notes with Bates references
  - AI-generated insights
  - Created_by tracking

- **Database Schema**
  - Cloudflare D1 (SQLite) database
  - Tables: matters, documents, document_pages
  - Tables: classifications, document_classifications
  - Tables: notes, chat_history
  - Dynamic provisioning via `/api/init-db`

- **Logo Integration**
  - Turman Legal Solutions logo in header
  - Professional branding throughout

- **Documentation**
  - README.md - Project overview
  - DEPLOYMENT_SUMMARY.md - Deployment guide
  - Comprehensive API documentation

### Security
- **Git Ignore Configuration**
  - .env files excluded
  - .dev.vars excluded
  - API keys not committed
  - node_modules excluded

- **Environment Variables**
  - ANTHROPIC_API_KEY in production secrets
  - Local .dev.vars for development
  - Secure secret management via Wrangler

### Performance
- **Cloudflare Edge Deployment**
  - Global edge network distribution
  - Low latency worldwide
  - Automatic scaling
  - CDN integration

- **R2 Object Storage**
  - Fast PDF retrieval
  - S3-compatible API
  - No egress fees
  - Automatic replication

- **D1 Database**
  - Serverless SQLite
  - Automatic scaling
  - Read replicas
  - ACID compliance

## [Unreleased]

### Planned for v2.1.0
- Vision-based OCR using Claude 4.5 Sonnet
- PDF-to-image conversion for scanned documents
- Automatic OCR fallback detection
- OCR confidence scoring
- Scanned document indicator in UI

### Planned for v2.2.0
- Boolean search operators (AND, OR, NOT)
- Phrase search with quotes
- Proximity search (within N words)
- Regular expression support
- SQLite FTS5 full-text indexes
- Advanced search UI

### Planned for v3.0.0
- User authentication (Cloudflare Access)
- Role-based access control (RBAC)
- Multi-user collaboration
- Real-time updates
- Enhanced audit logging
- Activity feed
- Document sharing
- Annotation collaboration

---

## Version Format

**[MAJOR.MINOR.PATCH] - YYYY-MM-DD**

- **MAJOR**: Breaking changes or major feature additions
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, minor improvements

## Categories

- **Added**: New features
- **Changed**: Changes to existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements
- **Performance**: Performance improvements
- **Known Issues**: Documented limitations

---

**Repository**: https://github.com/set2374/SET-App-Ceation  
**Maintainer**: Claude Sonnet 4.5 (via GenSpark AI)  
**Client**: Stephen Turman, Esq. - Turman Legal Solutions PLLC
