// TLS eDiscovery Platform - Frontend Application

// Global state
let currentMatter = 1;
let currentDocument = null;
let currentPage = 1;
let documents = [];
let classifications = [];

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
  console.log('TLS eDiscovery Platform initializing...');
  
  // Load initial data
  await loadClassifications();
  await loadDocuments();
  
  // Set up event listeners
  setupEventListeners();
  
  console.log('Application ready');
});

// Setup all event listeners
function setupEventListeners() {
  // File upload
  const fileInput = document.getElementById('file-upload');
  if (fileInput) {
    fileInput.addEventListener('change', handleFileUpload);
  }
  
  // Search input
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(handleSearch, 300));
  }
  
  // Filter tags
  document.querySelectorAll('.filter-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
      tag.classList.add('active');
      filterDocuments(tag.dataset.filter);
    });
  });
  
  // Tab switching
  document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
      switchTab(button.dataset.tab);
    });
  });
  
  // PDF navigation
  const prevBtn = document.getElementById('prev-page');
  const nextBtn = document.getElementById('next-page');
  if (prevBtn) prevBtn.addEventListener('click', () => navigatePage(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => navigatePage(1));
  
  // Add note button
  const addNoteBtn = document.getElementById('add-note-btn');
  if (addNoteBtn) {
    addNoteBtn.addEventListener('click', showNoteDialog);
  }
}

// Load classifications from API
async function loadClassifications() {
  try {
    const response = await fetch('/api/classifications');
    classifications = await response.json();
    console.log('Loaded classifications:', classifications);
  } catch (error) {
    console.error('Error loading classifications:', error);
    showNotification('Failed to load classifications', 'error');
  }
}

// Load documents from API
async function loadDocuments() {
  try {
    const response = await fetch(`/api/documents?matter_id=${currentMatter}`);
    documents = await response.json();
    console.log('Loaded documents:', documents);
    renderDocumentList(documents);
    updateFilterCounts();
  } catch (error) {
    console.error('Error loading documents:', error);
    showNotification('Failed to load documents', 'error');
  }
}

// Render document list
function renderDocumentList(docs) {
  const container = document.getElementById('document-list');
  if (!container) return;
  
  if (docs.length === 0) {
    container.innerHTML = `
      <div class="text-center text-gray-500 py-12">
        <svg class="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="mt-4 text-sm">No documents uploaded</p>
        <p class="text-xs text-gray-400 mt-1">Upload PDFs to begin review</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = docs.map(doc => {
    const tags = doc.classifications ? doc.classifications.split(',') : [];
    const tagHTML = tags.map(tag => {
      const className = tag.toLowerCase().replace(' ', '-');
      return `<span class="tag ${className}">${tag}</span>`;
    }).join('');
    
    return `
      <div class="document-card" data-id="${doc.id}" onclick="selectDocument(${doc.id})">
        <div class="filename">${escapeHtml(doc.filename)}</div>
        <div class="bates">${doc.bates_start}${doc.page_count > 1 ? ' - ' + doc.bates_end : ''}</div>
        <div class="meta">
          <span>${doc.page_count} page${doc.page_count > 1 ? 's' : ''}</span>
          <span>${formatDate(doc.upload_date)}</span>
        </div>
        ${tagHTML ? `<div class="tags">${tagHTML}</div>` : ''}
      </div>
    `;
  }).join('');
}

// Select document
async function selectDocument(docId) {
  const doc = documents.find(d => d.id === docId);
  if (!doc) return;
  
  currentDocument = doc;
  currentPage = 1;
  
  // Update UI
  document.querySelectorAll('.document-card').forEach(card => {
    card.classList.toggle('active', card.dataset.id == docId);
  });
  
  // Load document content
  await loadDocumentContent(doc);
  
  // Load AI analysis
  await loadAIAnalysis(doc);
  
  // Load notes
  await loadNotes(doc);
  
  // Load classifications
  renderClassificationOptions(doc);
}

// Load document content (PDF viewer)
async function loadDocumentContent(doc) {
  const viewer = document.getElementById('pdf-viewer');
  if (!viewer) return;
  
  viewer.innerHTML = `
    <div class="text-center">
      <div class="spinner"></div>
      <p class="mt-4 text-sm text-gray-600">Loading PDF...</p>
    </div>
  `;
  
  // TODO: Implement actual PDF.js integration
  // For now, show placeholder
  setTimeout(() => {
    viewer.innerHTML = `
      <div class="text-center">
        <div class="bg-white p-8 rounded-lg shadow-lg max-w-2xl">
          <svg class="mx-auto h-24 w-24 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="mt-4 text-lg font-semibold text-gray-900">${escapeHtml(doc.filename)}</h3>
          <p class="mt-2 text-sm text-gray-600">Bates: ${doc.bates_start} - ${doc.bates_end}</p>
          <p class="mt-1 text-sm text-gray-600">${doc.page_count} pages</p>
          <p class="mt-4 text-xs text-gray-500">PDF viewer integration coming soon</p>
        </div>
      </div>
    `;
    updatePageInfo();
  }, 500);
}

// Load AI analysis
async function loadAIAnalysis(doc) {
  const container = document.getElementById('analysis-tab');
  if (!container) return;
  
  container.innerHTML = `
    <div class="p-4">
      <div class="text-center py-8">
        <div class="spinner"></div>
        <p class="mt-4 text-sm text-gray-600">Analyzing document with Claude Sonnet 4.5...</p>
      </div>
    </div>
  `;
  
  // TODO: Call actual AI analysis API
  // For now, show mock analysis
  setTimeout(() => {
    const mockAnalysis = {
      privilege: {
        determination: 'Likely Privileged',
        confidence: 'high',
        reasoning: 'This email communication appears to be between attorney and client regarding legal strategy. The subject line contains "Confidential Legal Advice" and the sender domain is turmanlegalsolutions.com.'
      },
      hotDoc: {
        determination: 'Not Hot Document',
        confidence: 'medium',
        reasoning: 'Document contains routine correspondence without litigation-significant facts or admissions.'
      },
      summary: 'Email exchange discussing case strategy and settlement options. Client seeks legal advice regarding potential settlement amounts and litigation risks.',
      entities: {
        people: ['Stephen Turman', 'John Smith'],
        dates: ['2024-10-15'],
        amounts: ['$250,000']
      }
    };
    
    container.innerHTML = `
      <div class="p-4">
        <div class="analysis-card">
          <div class="title">
            <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Privilege Analysis
            <span class="confidence-badge ${mockAnalysis.privilege.confidence}">${mockAnalysis.privilege.determination}</span>
          </div>
          <div class="content">${mockAnalysis.privilege.reasoning}</div>
          <button class="mt-3 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700">
            Accept & Add to Privilege Log
          </button>
        </div>
        
        <div class="analysis-card">
          <div class="title">
            <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            </svg>
            Hot Document Assessment
            <span class="confidence-badge ${mockAnalysis.hotDoc.confidence}">${mockAnalysis.hotDoc.determination}</span>
          </div>
          <div class="content">${mockAnalysis.hotDoc.reasoning}</div>
        </div>
        
        <div class="analysis-card">
          <div class="title">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Document Summary
          </div>
          <div class="content">${mockAnalysis.summary}</div>
        </div>
        
        <div class="analysis-card">
          <div class="title">
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Key Entities
          </div>
          <div class="content">
            <div class="mt-2">
              <strong>People:</strong> ${mockAnalysis.entities.people.join(', ')}
            </div>
            <div class="mt-1">
              <strong>Dates:</strong> ${mockAnalysis.entities.dates.join(', ')}
            </div>
            <div class="mt-1">
              <strong>Amounts:</strong> ${mockAnalysis.entities.amounts.join(', ')}
            </div>
          </div>
        </div>
      </div>
    `;
  }, 1500);
}

// Load notes
async function loadNotes(doc) {
  const container = document.getElementById('notes-list');
  if (!container) return;
  
  // TODO: Load actual notes from API
  container.innerHTML = `
    <div class="text-center text-gray-500 py-8">
      <p class="text-sm">No notes yet</p>
      <p class="text-xs text-gray-400 mt-1">Click "Add Note" to create one</p>
    </div>
  `;
}

// Render classification options
function renderClassificationOptions(doc) {
  const container = document.getElementById('classification-list');
  if (!container) return;
  
  container.innerHTML = classifications.map(cls => {
    const icon = getClassificationIcon(cls.name);
    return `
      <div class="classification-item" onclick="toggleClassification(${doc.id}, ${cls.id})">
        <input type="checkbox" id="cls-${cls.id}" />
        <div class="classification-info">
          <div class="classification-name">
            ${icon} ${cls.name}
          </div>
          <div class="classification-desc">${cls.description}</div>
        </div>
      </div>
    `;
  }).join('');
}

// Get classification icon
function getClassificationIcon(name) {
  const icons = {
    'Hot Document': '🔥',
    'Privileged': '🛡️',
    'Bad Document': '⚠️',
    'Key Witness': '👤',
    'Exhibit': '📄',
    'Needs Review': '👁️'
  };
  return icons[name] || '🏷️';
}

// Toggle classification
async function toggleClassification(docId, classificationId) {
  const checkbox = document.getElementById(`cls-${classificationId}`);
  if (checkbox) {
    checkbox.checked = !checkbox.checked;
    // TODO: Save to API
    console.log(`Toggle classification ${classificationId} for document ${docId}: ${checkbox.checked}`);
    showNotification('Classification updated', 'success');
  }
}

// Handle file upload
async function handleFileUpload(event) {
  const files = event.target.files;
  if (!files || files.length === 0) return;
  
  showNotification(`Uploading ${files.length} file(s)...`, 'info');
  
  for (const file of files) {
    if (file.type !== 'application/pdf') {
      showNotification(`${file.name} is not a PDF file`, 'error');
      continue;
    }
    
    try {
      // TODO: Implement actual upload to R2
      console.log('Uploading file:', file.name);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate upload
      showNotification(`${file.name} uploaded successfully`, 'success');
    } catch (error) {
      console.error('Upload error:', error);
      showNotification(`Failed to upload ${file.name}`, 'error');
    }
  }
  
  // Reload documents
  await loadDocuments();
  
  // Reset input
  event.target.value = '';
}

// Handle search
function handleSearch(event) {
  const query = event.target.value.toLowerCase().trim();
  if (!query) {
    renderDocumentList(documents);
    return;
  }
  
  const filtered = documents.filter(doc => 
    doc.filename.toLowerCase().includes(query) ||
    doc.bates_start.toLowerCase().includes(query) ||
    (doc.extracted_text && doc.extracted_text.toLowerCase().includes(query))
  );
  
  renderDocumentList(filtered);
}

// Filter documents by classification
function filterDocuments(filter) {
  if (filter === 'all') {
    renderDocumentList(documents);
    return;
  }
  
  const filterMap = {
    'hot': 'Hot Document',
    'privileged': 'Privileged',
    'bad': 'Bad Document'
  };
  
  const classification = filterMap[filter];
  const filtered = documents.filter(doc => 
    doc.classifications && doc.classifications.includes(classification)
  );
  
  renderDocumentList(filtered);
}

// Update filter counts
function updateFilterCounts() {
  const counts = {
    all: documents.length,
    hot: documents.filter(d => d.classifications && d.classifications.includes('Hot Document')).length,
    privileged: documents.filter(d => d.classifications && d.classifications.includes('Privileged')).length,
    bad: documents.filter(d => d.classifications && d.classifications.includes('Bad Document')).length
  };
  
  document.querySelectorAll('.filter-tag').forEach(tag => {
    const filter = tag.dataset.filter;
    const countEl = tag.querySelector('.count');
    if (countEl && counts[filter] !== undefined) {
      countEl.textContent = counts[filter];
    }
  });
}

// Switch tab
function switchTab(tabName) {
  // Update buttons
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  
  // Update content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.toggle('active', content.id === `${tabName}-tab`);
  });
}

// Navigate PDF pages
function navigatePage(delta) {
  if (!currentDocument) return;
  
  currentPage = Math.max(1, Math.min(currentDocument.page_count, currentPage + delta));
  updatePageInfo();
  
  // TODO: Update PDF viewer to show new page
}

// Update page info
function updatePageInfo() {
  const pageInfo = document.getElementById('page-info');
  const batesInfo = document.getElementById('bates-info');
  const prevBtn = document.getElementById('prev-page');
  const nextBtn = document.getElementById('next-page');
  
  if (currentDocument && pageInfo && batesInfo) {
    pageInfo.textContent = `Page ${currentPage} of ${currentDocument.page_count}`;
    // TODO: Calculate actual Bates number for current page
    batesInfo.textContent = currentDocument.bates_start;
    
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === currentDocument.page_count;
  }
}

// Show note dialog
function showNoteDialog() {
  if (!currentDocument) {
    showNotification('Please select a document first', 'warning');
    return;
  }
  
  const noteText = prompt('Enter your note:');
  if (noteText && noteText.trim()) {
    // TODO: Save note via API
    console.log('Adding note:', noteText);
    showNotification('Note added', 'success');
    loadNotes(currentDocument);
  }
}

// Utility: Show notification
function showNotification(message, type = 'info') {
  console.log(`[${type.toUpperCase()}] ${message}`);
  // TODO: Implement actual toast notification UI
}

// Utility: Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Utility: Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Utility: Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Make functions globally accessible
window.selectDocument = selectDocument;
window.toggleClassification = toggleClassification;
