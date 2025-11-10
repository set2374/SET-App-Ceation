# TLS eDiscovery Platform - Version History

## Current Version: 2.0.4 (2025-11-10)

**Code Name**: "SearchMaster"  
**Status**: Ready for Deployment  
**Branch**: main

### Version 2.0.4 - Mobile Portrait Swipe Navigation
**Release Date**: 2025-11-10  
**Breaking Changes**: None (backward compatible)

#### New Features
1. **Mobile Portrait Mode Improvements**
   - Horizontal swipeable panels (full-screen width each)
   - iOS-native scroll snap behavior for smooth panel transitions
   - Visual panel indicators (3 dots at bottom showing current panel)
   - Previous/Next navigation buttons for manual panel switching
   - Panel headers showing "📚 Sources", "💬 Chat", "📝 Notes & Reports"
   - Enlarged chat text for better readability (16px minimum)

#### Technical Improvements
- CSS scroll-snap-type: x mandatory for iOS compatibility
- JavaScript scroll position tracking with debouncing
- Dynamic indicator updates based on scroll position
- Disabled navigation buttons at panel boundaries
- -webkit-overflow-scrolling: touch for momentum scrolling

#### User Experience Enhancements
- Chat window now readable in portrait mode
- Easy swiping between three full-screen panels
- Clear visual feedback showing current panel (1 of 3)
- Touch-optimized navigation buttons (44px minimum)

---

### Version 2.0.3 - iOS Orientation Fixes
**Release Date**: 2025-11-10  
**Breaking Changes**: None (backward compatible)

#### Bug Fixes
- Fixed iOS Safari not responding to orientation changes
- Fixed Tailwind CSS classes overriding responsive layouts
- Fixed single-column layout appearing on iPhone 15 Pro Max

#### Technical Solutions
- Override Tailwind with !important flags in responsive CSS
- Added data-orientation attribute for precise CSS targeting
- Triple orientation detection (screen.orientation API, window.orientation legacy, fallback)
- Force layout reflow on orientation change
- Multiple event listeners with 100ms delays for iOS timing issues

---

### Version 2.0.2 - Mobile Responsive Design
**Release Date**: 2025-11-10  
**Breaking Changes**: None (backward compatible)

#### New Features
- Viewport meta tags optimized for mobile devices
- Mobile device and tablet detection
- Orientation change handling
- Orientation suggestion banner for better UX
- Touch-optimized interface elements

---

### Version 2.0.1 - Delete Document Feature
**Release Date**: 2025-11-10  
**Breaking Changes**: None (backward compatible)

#### New Features
- Delete document endpoint: DELETE `/api/documents/:id`
- Cascading deletion (R2 file, database records, pages, classifications, notes)
- Confirmation dialog with document details
- Trash icon UI in document cards
- Success/error notifications

---

### Version 2.0.0 - Major Feature Release
**Release Date**: 2025-11-01  
**Breaking Changes**: None (backward compatible)

#### New Features
1. **PDF.js Text Extraction**
   - Automatic client-side text extraction
   - Page-level Bates indexing
   - Progress notifications during extraction

2. **Full-Text Search**
   - Search across all document content
   - Document-level and page-level results
   - Highlighted search terms
   - Direct PDF navigation to specific pages

3. **AI Hallucination Detection**
   - Validates all Bates citations against database
   - Visual warnings for hallucinated references
   - Color-coded citations (blue=valid, red=hallucinated)

4. **Enhanced Database Schema**
   - `document_pages` table with page-level text
   - `extracted_text` column in documents
   - `text_extracted` flag for search filtering

#### API Endpoints Added
- POST `/api/documents/:id/extract-text` - Store extracted page text
- GET `/api/documents/search` - Full-text search with highlighting

#### Bug Fixes
- Fixed Claude model identifier (now uses working Haiku model)
- Fixed Bates number calculation for multi-page documents
- Fixed matter next_bates_number updates after extraction

#### Performance Improvements
- Debounced search (500ms) reduces API calls
- Limited search results (50 docs, 100 pages) for speed
- Client-side extraction eliminates server CPU usage

---

## Previous Version: 1.0.0 (2025-10-31)

**Code Name**: "NotebookLM"  
**Status**: Stable (preserved in git tag v1.0.0)  
**Branch**: main (before text extraction)

### Version 1.0.0 - Initial Release
**Release Date**: 2025-10-31

#### Core Features
1. Three-Panel NotebookLM Interface
2. PDF Upload with Bates Numbering
3. Claude AI Integration
4. Privilege Log Generation
5. Timeline Reports
6. Hot Document Reports
7. Multi-Matter Management
8. Notes System
9. Classification System

#### Known Limitations (v1.0.0)
- No text extraction (PDFs not searchable)
- No full-text search capability
- Manual document review only
- No OCR for scanned documents

---

## Version Backup Strategy

### Git Tags for Rollback
```bash
# Current production (before v2.0.0 deployment)
git tag v1.0.0-production 51815ac

# New version (with text extraction)
git tag v2.0.0 92a0ea8

# To rollback to v1.0.0
git checkout v1.0.0-production
npm run build
npm run deploy:prod
```

### Production Deployment URLs
- **v1.0.0**: https://32acf0ba.tls-ediscovery.pages.dev (current production)
- **v2.0.0**: Will be deployed to same project, new deployment ID

### Rollback Plan
If v2.0.0 has critical issues:
1. Access Cloudflare Pages dashboard
2. Select tls-ediscovery project
3. Navigate to Deployments tab
4. Click "Rollback" on v1.0.0 deployment
5. Or use git tag to redeploy v1.0.0

---

## Version Comparison

| Feature | v1.0.0 | v2.0.0 |
|---------|--------|--------|
| PDF Upload | ✅ | ✅ |
| Bates Numbering | ✅ | ✅ |
| Claude AI Chat | ✅ | ✅ |
| Privilege Logs | ✅ | ✅ |
| Reports | ✅ | ✅ |
| Text Extraction | ❌ | ✅ |
| Full-Text Search | ❌ | ✅ |
| Page Navigation | ❌ | ✅ |
| Hallucination Detection | ❌ | ✅ |
| OCR (Scanned Docs) | ❌ | ❌ (planned v2.1.0) |

---

## Roadmap

### Version 2.1.0 (Planned)
**Target**: 2025-11-15  
**Focus**: OCR Integration

- Vision-based OCR using Claude 4.5 Sonnet
- PDF-to-image conversion
- Automatic fallback for scanned documents
- OCR confidence scoring
- Scanned document detection

### Version 2.2.0 (Planned)
**Target**: 2025-12-01  
**Focus**: Search Enhancements

- Boolean search operators (AND, OR, NOT)
- Phrase search with quotes
- Proximity search
- Regular expression support
- SQLite FTS5 full-text indexes

### Version 3.0.0 (Planned)
**Target**: 2026-Q1  
**Focus**: Enterprise Features

- User authentication (Cloudflare Access)
- Role-based access control
- Audit logging
- Multi-user collaboration
- Real-time updates
- Advanced reporting

---

## Deployment History

### 2025-11-01 - v2.0.0 Deployment
- **Commit**: 92a0ea8
- **Features**: Text extraction, search, hallucination detection
- **Status**: Pending deployment
- **Deployment Command**: `npm run deploy:prod`

### 2025-10-31 - v1.0.0 Production
- **Commit**: 51815ac
- **Features**: Core NotebookLM interface, AI integration, reports
- **Status**: Current production (stable)
- **URL**: https://32acf0ba.tls-ediscovery.pages.dev

### 2025-10-30 - Initial Development
- **Commit**: Multiple commits
- **Features**: Project foundation, database schema, UI
- **Status**: Development phase

---

## Support and Maintenance

### Current Maintainer
- **Name**: Claude Sonnet 4.5 (via GenSpark AI)
- **Client**: Stephen Turman, Esq.
- **Firm**: Turman Legal Solutions PLLC

### Documentation
- README.md - Project overview
- IMPLEMENTATION_SUMMARY.md - Technical details
- TESTING_TEXT_EXTRACTION.md - Testing guide
- DEPLOYMENT_SUMMARY.md - Deployment instructions
- GITHUB_SUMMARY.md - Repository guide

### Repository
- **URL**: https://github.com/set2374/SET-App-Ceation
- **Branch**: main
- **Latest Commit**: 92a0ea8

---

## Version Naming Convention

**Format**: MAJOR.MINOR.PATCH

- **MAJOR**: Breaking changes or major feature additions (1.x → 2.x)
- **MINOR**: New features, backward compatible (2.0 → 2.1)
- **PATCH**: Bug fixes, minor improvements (2.1.0 → 2.1.1)

**Code Names**: Each major version has a theme name
- v1.0.0: "NotebookLM" - Interface design focus
- v2.0.0: "SearchMaster" - Search and extraction focus
- v3.0.0: "Enterprise" (planned) - Multi-user features
