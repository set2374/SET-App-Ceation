# Text Extraction & Search Testing Guide

**TLS eDiscovery Platform - PDF.js Integration**  
**Date**: 2025-11-01  
**Feature**: Automatic text extraction and full-text search

## Overview

The platform now automatically extracts text from uploaded PDFs using PDF.js (client-side) and indexes it with page-level Bates numbering. Users can search across all document content and navigate directly to specific pages.

## What Was Implemented

### 1. Automatic Text Extraction
- **When**: Immediately after PDF upload completes
- **How**: PDF.js library extracts text from each page
- **Storage**: 
  - Page-level text stored in `document_pages` table with individual Bates numbers
  - Full document text stored in `documents.extracted_text` column
- **Progress**: Shows extraction status (e.g., "Extracting: 10/50 pages...")
- **Confidence**: Native PDF text has 100% confidence (OCR would be lower)

### 2. Database Schema Updates

**`document_pages` table**:
```sql
CREATE TABLE document_pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id INTEGER NOT NULL,
  page_number INTEGER NOT NULL,
  bates_number TEXT NOT NULL,
  page_text TEXT,
  ocr_confidence REAL DEFAULT 1.0,
  FOREIGN KEY (document_id) REFERENCES documents(id)
);
```

**`documents` table additions**:
- `extracted_text` TEXT - full document searchable text
- `text_extracted` BOOLEAN - extraction completion flag

### 3. API Endpoints

**POST `/api/documents/:id/extract-text`**
- Accepts: `{ pages: [{page_number, text, confidence}], full_text, page_count }`
- Saves page-level text with calculated Bates numbers
- Updates document with full text and correct page count
- Updates matter's next_bates_number if needed
- Returns: `{ success, pages_extracted, bates_range, searchable }`

**GET `/api/documents/search?q=query&matter_id=1`**
- Accepts: query string (minimum 3 characters)
- Searches both document-level and page-level text
- Returns: `{ documents: [], pages: [], total_results }`
- Includes: Bates numbers, filenames, page numbers, snippets

### 4. Frontend Features

**Search Interface**:
- Uses existing "Search sources..." input field in left panel
- Debounced input (500ms) to avoid excessive API calls
- Minimum 3 characters required for search
- Shows search results with highlighted snippets
- Yellow highlighting for documents with matches
- Displays page-level results with context snippets

**Search Results Display**:
- Document-level matches with metadata
- Page-level matches with Bates numbers and page numbers
- Text snippets with search query highlighted in yellow
- Clickable results that open PDF to specific page
- Shows count of page matches per document
- Limits display to 5 pages per document (with "more" indicator)

**PDF Navigation**:
- Updated `openPDFViewer(docId, pageNumber)` function
- Supports direct navigation to specific pages
- Uses iframe with `#page=N` anchor for PDF navigation
- Shows page number in success notification

## Testing Instructions

### Prerequisites
1. Access the platform: https://3000-iv0z4oopp52b5y23h8w7n-0e616f0a.sandbox.novita.ai
2. Ensure you have one or more PDF documents to test with
3. Test PDFs should contain searchable text (not scanned images)

### Test Case 1: Upload and Automatic Extraction

**Steps**:
1. Click "+ Add source" button in left panel
2. Select a PDF file with text content (e.g., legal brief, contract, deposition)
3. Observe upload progress notification
4. Watch for extraction notification: "Extracting text from [filename]..."
5. See progress updates: "Extracting: 10/20 pages..."
6. Confirm success: "✓ Extracted N pages from [filename] (BATES-RANGE)"

**Expected Results**:
- Upload completes successfully with Bates number assignment
- Extraction starts automatically (no manual action required)
- Progress shown for longer documents
- Final notification shows page count and Bates range
- Document appears in sources list with checkable box

**Verification**:
```bash
# Check database for extracted text (backend only)
npx wrangler d1 execute tls-ediscovery-database --local \
  --command="SELECT id, filename, text_extracted, page_count FROM documents"

# Check page-level text
npx wrangler d1 execute tls-ediscovery-database --local \
  --command="SELECT page_number, bates_number, LENGTH(page_text) as text_length FROM document_pages WHERE document_id = 1"
```

### Test Case 2: Simple Text Search

**Steps**:
1. Upload a PDF containing specific searchable terms (e.g., "attorney-client privilege")
2. Wait for extraction to complete
3. Click in "Search sources..." input field
4. Type a search term that appears in the document (minimum 3 characters)
5. Wait 500ms for debounced search to trigger
6. Observe search results display

**Expected Results**:
- Search notification: "Searching for 'term'..."
- Results notification: "Found N result(s)"
- Documents containing term highlighted with yellow border
- Search info bar shows: "Search: 'term'" with result count
- Page matches listed with Bates numbers and snippets
- Search term highlighted in yellow within snippets
- Context shown (50 characters before/after match)

**Example Search Terms**:
- Legal terms: "privilege", "confidential", "attorney", "work product"
- Names: "Smith", "Johnson", "plaintiff", "defendant"
- Dates: "2024", "January", "settlement"
- Common words: "contract", "agreement", "evidence", "testimony"

### Test Case 3: Page-Level Navigation

**Steps**:
1. Perform a search that returns page-level matches
2. Click on a specific page result (shows page number and Bates)
3. Observe PDF viewer opening to that exact page

**Expected Results**:
- PDF viewer overlay opens instantly
- PDF loads at the specific page (not page 1)
- Notification: "PDF loaded successfully (Page N)"
- Document title and Bates number shown in viewer header
- User can manually navigate to other pages from there

### Test Case 4: Multiple Document Search

**Steps**:
1. Upload 3-5 different PDF documents with various content
2. Wait for all extractions to complete
3. Search for a term that appears in multiple documents
4. Review aggregated search results

**Expected Results**:
- All matching documents displayed in search results
- Documents sorted by upload date (newest first)
- Each document shows count of page matches
- Page matches grouped under their parent document
- Total results count accurate across all documents
- Limit of 5 pages shown per document (with overflow indicator)

### Test Case 5: Search Reset

**Steps**:
1. Perform a search with results
2. Clear the search input completely (backspace all text)
3. Wait 500ms

**Expected Results**:
- Search results cleared
- Full document list restored (all uploaded documents)
- Documents shown with normal display (no yellow highlighting)
- All checkboxes and document actions functional

### Test Case 6: Minimum Character Requirement

**Steps**:
1. Type only 1-2 characters in search box
2. Observe no search triggered
3. Type 3rd character
4. Observe search activation

**Expected Results**:
- Searches with <3 characters don't trigger API calls
- 3+ characters activate search after 500ms debounce
- Error message if backend receives <3 character query: "Search query must be at least 3 characters"

## API Testing (Backend)

### Test Extraction Endpoint

```bash
# After uploading a document (get document ID from response)
curl -X POST http://localhost:3000/api/documents/1/extract-text \
  -H "Content-Type: application/json" \
  -d '{
    "pages": [
      {"page_number": 1, "text": "This is page one content with legal terms.", "confidence": 1.0},
      {"page_number": 2, "text": "This is page two with attorney-client privilege mentioned.", "confidence": 1.0}
    ],
    "full_text": "This is page one content with legal terms.\n\nThis is page two with attorney-client privilege mentioned.",
    "page_count": 2
  }'

# Expected response:
{
  "success": true,
  "pages_extracted": 2,
  "bates_range": "VQ-000001 - VQ-000002",
  "searchable": true
}
```

### Test Search Endpoint

```bash
# Search for term across documents
curl "http://localhost:3000/api/documents/search?q=privilege&matter_id=1"

# Expected response:
{
  "success": true,
  "query": "privilege",
  "documents": [
    {
      "id": 1,
      "filename": "legal_brief.pdf",
      "bates_start": "VQ-000001",
      "bates_end": "VQ-000015",
      "page_count": 15,
      "upload_date": "2025-11-01T12:00:00Z"
    }
  ],
  "pages": [
    {
      "id": 5,
      "document_id": 1,
      "page_number": 5,
      "bates_number": "VQ-000005",
      "page_text": "...attorney-client privilege is protected under...",
      "filename": "legal_brief.pdf",
      "doc_bates_start": "VQ-000001"
    }
  ],
  "total_results": 3
}
```

## Known Limitations

### Current Implementation
1. **No OCR**: Only extracts native PDF text (won't work on scanned documents)
2. **Client-side processing**: Large PDFs (100+ pages) may take time to extract
3. **Simple search**: Uses SQL LIKE queries (not full-text search engine)
4. **No phrase search**: Searches for individual words only
5. **Case-insensitive**: All searches are case-insensitive
6. **No boolean operators**: Cannot use AND/OR/NOT in searches

### Browser Compatibility
- Requires modern browser with PDF.js support
- Works in Chrome, Firefox, Safari, Edge (latest versions)
- May not work in Internet Explorer

### Performance Considerations
- Large PDFs (50+ MB) may cause browser memory issues during extraction
- Search limited to 50 documents and 100 pages to prevent slow queries
- Debounce prevents excessive search API calls during typing

## Future Enhancements (Not Yet Implemented)

### Planned OCR Integration
- **Trigger**: When PDF.js extraction yields minimal text (<10 words per page)
- **Method**: Convert PDF page to PNG, send to Claude 4.5 Sonnet Vision API
- **Storage**: Store OCR results with confidence score <1.0
- **Cost**: ~$3 per 1000 pages (vision API pricing)

### Advanced Search Features
- Boolean operators (AND, OR, NOT)
- Phrase search with quotes ("attorney-client privilege")
- Proximity search (words within N words of each other)
- Regular expression support
- Search within date ranges
- Search within specific classifications

### Performance Optimizations
- Full-text search indexes (SQLite FTS5)
- Background extraction jobs for very large PDFs
- Progressive loading of search results
- Search result caching

## Troubleshooting

### Issue: "Text extraction failed"
**Possible Causes**:
- PDF is encrypted or password-protected
- PDF contains only images (scanned document)
- Browser PDF.js library failed to load
- Network timeout during extraction

**Solutions**:
- Verify PDF opens in browser normally
- Check browser console for JavaScript errors
- Try a different PDF file
- Ensure PDF.js CDN is accessible

### Issue: "Search returns no results"
**Possible Causes**:
- Text extraction not completed yet
- Document contains only images (OCR not implemented)
- Search term misspelled or doesn't exist in documents
- Query <3 characters

**Solutions**:
- Wait for extraction notification to complete
- Verify document contains searchable text (open PDF manually)
- Try different search terms
- Check database: `SELECT extracted_text FROM documents WHERE id = X`

### Issue: "PDF opens to page 1 instead of searched page"
**Possible Causes**:
- Browser doesn't support `#page=N` anchor in iframe
- PDF viewer override in browser settings
- JavaScript error preventing page anchor

**Solutions**:
- Try different browser
- Check browser console for errors
- Verify PDF URL includes page anchor in network tab

## Success Criteria

The text extraction and search features are working correctly if:

1. ✅ PDFs upload successfully and Bates numbers assigned
2. ✅ Text extraction starts automatically after upload
3. ✅ Extraction progress shown for longer documents
4. ✅ Success notification shows page count and Bates range
5. ✅ Search input accepts 3+ character queries
6. ✅ Search results display within 2 seconds
7. ✅ Search term highlighted in yellow in snippets
8. ✅ Clicking page result opens PDF to correct page
9. ✅ Search reset (empty input) restores full document list
10. ✅ Multiple documents searchable across entire matter

## Contact & Support

- **Developer**: Claude Sonnet 4.5 (via GenSpark AI)
- **Platform**: TLS eDiscovery - Turman Legal Solutions PLLC
- **Documentation**: See README.md and DEPLOYMENT_SUMMARY.md
- **Repository**: https://github.com/set2374/SET-App-Ceation
