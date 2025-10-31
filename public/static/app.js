// TLS eDiscovery Platform - NotebookLM-Style Interface

// Global state
let currentMatter = 1;
let selectedSources = [];
let notes = [];
let chatHistory = [];

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
  console.log('TLS eDiscovery Platform (NotebookLM style) initializing...');
  
  // Load initial data
  await loadMatters();
  await loadNotes();
  await loadDocuments();
  
  // Setup event listeners
  setupEventListeners();
  
  console.log('Application ready');
});

// Setup all event listeners
function setupEventListeners() {
  // Add source button
  const addSourceBtn = document.getElementById('add-source-btn');
  if (addSourceBtn) {
    addSourceBtn.addEventListener('click', toggleUploadArea);
  }
  
  // File upload
  const fileInput = document.getElementById('file-upload');
  if (fileInput) {
    fileInput.addEventListener('change', handleFileUpload);
  }
  
  // Chat input
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.getElementById('send-chat');
  
  if (chatInput && sendBtn) {
    sendBtn.addEventListener('click', () => sendChatMessage());
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
      }
    });
  }
  
  // Suggested questions
  document.querySelectorAll('.suggested-question').forEach(button => {
    button.addEventListener('click', () => {
      const question = button.querySelector('span').textContent;
      document.getElementById('chat-input').value = question;
      sendChatMessage();
    });
  });
  
  // Quick actions
  document.querySelectorAll('.quick-action').forEach(button => {
    button.addEventListener('click', () => {
      const text = button.textContent.trim();
      if (text.includes('Privilege Log')) {
        generatePrivilegeLog();
      } else if (text.includes('Timeline')) {
        generateTimeline();
      } else if (text.includes('Hot Document')) {
        generateHotDocReport();
      }
    });
  });
  
  // Report buttons
  document.querySelectorAll('.report-button').forEach(button => {
    button.addEventListener('click', () => {
      const reportType = button.querySelector('.text-sm.font-semibold').textContent;
      if (reportType.includes('Privilege Log')) {
        generatePrivilegeLog();
      } else if (reportType.includes('Timeline')) {
        generateTimeline();
      } else if (reportType.includes('Hot Document')) {
        generateHotDocReport();
      }
    });
  });
  
  // Notes/Reports tab switching
  document.querySelectorAll('.notes-tab-button').forEach(button => {
    button.addEventListener('click', () => {
      const tab = button.dataset.tab;
      switchNotesTab(tab);
    });
  });
  
  // Add manual note button
  const addManualNoteBtn = document.getElementById('add-manual-note');
  if (addManualNoteBtn) {
    addManualNoteBtn.addEventListener('click', showAddNoteDialog);
  }
  
  // Create matter button
  const createMatterBtn = document.getElementById('create-matter-btn');
  if (createMatterBtn) {
    createMatterBtn.addEventListener('click', showCreateMatterModal);
  }
  
  // Create matter modal buttons
  const cancelCreateMatterBtn = document.getElementById('cancel-create-matter');
  const submitCreateMatterBtn = document.getElementById('submit-create-matter');
  
  if (cancelCreateMatterBtn) {
    cancelCreateMatterBtn.addEventListener('click', hideCreateMatterModal);
  }
  
  if (submitCreateMatterBtn) {
    submitCreateMatterBtn.addEventListener('click', submitCreateMatter);
  }
  
  // Matter selector change
  const matterSelector = document.getElementById('matter-selector');
  if (matterSelector) {
    matterSelector.addEventListener('change', async (e) => {
      currentMatter = parseInt(e.target.value);
      await loadDocuments();
      showNotification(`Switched to ${e.target.options[e.target.selectedIndex].text}`, 'success');
    });
  }
  
  // Auto-uppercase Bates prefix input
  const prefixInput = document.getElementById('new-matter-prefix');
  if (prefixInput) {
    prefixInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
    });
  }
}

// Toggle upload area visibility
function toggleUploadArea() {
  const uploadArea = document.getElementById('upload-area');
  if (uploadArea) {
    uploadArea.classList.toggle('hidden');
  }
}

// Load documents (sources)
async function loadDocuments() {
  try {
    const response = await fetch(`/api/documents?matter_id=${currentMatter}`);
    const documents = await response.json();
    console.log('Loaded documents:', documents);
    renderSourcesList(documents);
  } catch (error) {
    console.error('Error loading documents:', error);
    showNotification('Failed to load documents', 'error');
  }
}

// Render sources list with checkboxes
function renderSourcesList(docs) {
  const container = document.getElementById('sources-list');
  if (!container) return;
  
  if (docs.length === 0) {
    container.innerHTML = `
      <div class="text-center text-gray-500 py-12">
        <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="mt-3 text-sm">No sources yet</p>
        <p class="text-xs text-gray-400 mt-1">Upload PDFs to get started</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = docs.map(doc => `
    <div class="source-item p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-400 transition-colors mb-2">
      <div class="flex items-start space-x-3">
        <input 
          type="checkbox" 
          class="source-checkbox mt-1" 
          data-id="${doc.id}"
          checked
        />
        <div class="flex-1 min-w-0 cursor-pointer" onclick="openPDFViewer(${doc.id})">
          <p class="text-sm font-medium text-gray-900 truncate">${escapeHtml(doc.filename)}</p>
          <p class="text-xs text-blue-600 font-mono mt-0.5">${doc.bates_start}${doc.page_count > 1 ? ' - ' + doc.bates_end : ''}</p>
          <p class="text-xs text-gray-500 mt-1">${doc.page_count} page${doc.page_count > 1 ? 's' : ''}</p>
        </div>
      </div>
    </div>
  `).join('');
  
  // Add checkbox listeners
  container.querySelectorAll('.source-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', updateSelectedSources);
  });
  
  // Initialize selected sources
  updateSelectedSources();
}

// Update selected sources array
function updateSelectedSources() {
  selectedSources = Array.from(document.querySelectorAll('.source-checkbox:checked'))
    .map(cb => parseInt(cb.dataset.id));
  console.log('Selected sources:', selectedSources);
}

// Open PDF viewer
async function openPDFViewer(docId) {
  const overlay = document.getElementById('pdf-overlay');
  if (!overlay) return;
  
  try {
    // Find document in our list
    const response = await fetch(`/api/documents?matter_id=${currentMatter}`);
    const documents = await response.json();
    const doc = documents.find(d => d.id === docId);
    
    if (!doc) {
      showNotification('Document not found', 'error');
      return;
    }
    
    // Update overlay info
    const titleEl = document.getElementById('pdf-title');
    const batesEl = document.getElementById('pdf-bates');
    
    if (titleEl) titleEl.textContent = doc.filename;
    if (batesEl) batesEl.textContent = doc.bates_start;
    
    // Show overlay
    overlay.classList.remove('hidden');
    
    // Load PDF content
    const pdfContent = document.getElementById('pdf-content');
    if (pdfContent) {
      pdfContent.innerHTML = `
        <div class="flex items-center justify-center h-full">
          <div class="text-center">
            <div class="spinner mb-4"></div>
            <p class="text-sm text-gray-600">Loading PDF...</p>
          </div>
        </div>
      `;
      
      // Use PDF.js to render (we'll add this library via CDN)
      try {
        const pdfUrl = `/api/document/${docId}`;
        
        // For now, use iframe as fallback
        pdfContent.innerHTML = `
          <iframe 
            src="${pdfUrl}" 
            class="w-full h-full border-0"
            title="${escapeHtml(doc.filename)}"
          ></iframe>
        `;
        
        showNotification('PDF loaded successfully', 'success');
      } catch (error) {
        console.error('PDF rendering error:', error);
        pdfContent.innerHTML = `
          <div class="flex items-center justify-center h-full">
            <div class="text-center text-red-600">
              <svg class="mx-auto h-12 w-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-sm">Failed to load PDF</p>
              <p class="text-xs mt-1">${error.message}</p>
            </div>
          </div>
        `;
      }
    }
    
    // Close button
    const closeBtn = document.getElementById('close-pdf');
    if (closeBtn) {
      closeBtn.onclick = () => overlay.classList.add('hidden');
    }
  } catch (error) {
    console.error('Error opening PDF viewer:', error);
    showNotification('Failed to open PDF viewer', 'error');
  }
}

// Send chat message
async function sendChatMessage() {
  const input = document.getElementById('chat-input');
  if (!input) return;
  
  const message = input.value.trim();
  if (!message) return;
  
  // Clear input
  input.value = '';
  
  // Add user message to chat
  addChatMessage('user', message);
  
  // Show loading state
  const loadingId = addChatMessage('assistant', 'Analyzing documents with Claude Sonnet 4.5...', true);
  
  try {
    // Call Claude API
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message,
        matter_id: currentMatter,
        selected_sources: selectedSources
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get AI response');
    }
    
    const data = await response.json();
    
    // Remove loading message
    removeChatMessage(loadingId);
    
    // Format response with clickable Bates citations
    let formattedResponse = data.response;
    
    // Convert [BATES: VQ-000001] format to clickable links
    formattedResponse = formattedResponse.replace(
      /\[BATES: ([^\]]+)\]/g,
      '<span class="bates-citation" data-bates="$1">$1</span>'
    );
    
    // Add save to notes button
    formattedResponse += '\n\n<button class="save-to-notes-btn mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Save to Notes</button>';
    
    // Add AI response to chat
    addChatMessage('assistant', formattedResponse);
    
    console.log('AI response received:', {
      bates_citations: data.bates_citations,
      tokens_used: data.tokens_used,
      model: data.model
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    removeChatMessage(loadingId);
    addChatMessage('assistant', `Sorry, I encountered an error: ${error.message}. Please try again.`);
  }
}

// Generate mock AI response
function generateMockAIResponse(question) {
  const lowerQ = question.toLowerCase();
  
  if (lowerQ.includes('privilege') || lowerQ.includes('attorney-client')) {
    return `Based on my analysis of the selected documents, I found 3 documents that appear to contain attorney-client privileged communications:

1. <span class="bates-citation" data-bates="VQ-000012">VQ-000012</span> - Email from jane.doe@turmanlegalsolutions.com to client discussing litigation strategy
2. <span class="bates-citation" data-bates="VQ-000045">VQ-000045</span> - Memo marked "Confidential Legal Advice" regarding settlement options
3. <span class="bates-citation" data-bates="VQ-000087">VQ-000087</span> - Attorney work product analyzing case strengths and weaknesses

These documents contain communications between attorney and client for the purpose of obtaining legal advice, and should be withheld from production under the attorney-client privilege.

<button class="save-to-notes-btn mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Save to Notes</button>`;
  }
  
  if (lowerQ.includes('settlement') || lowerQ.includes('negotiate')) {
    return `I found 2 documents referencing settlement negotiations:

1. <span class="bates-citation" data-bates="VQ-000023">VQ-000023</span> - Email discussing potential settlement amount of $250,000
2. <span class="bates-citation" data-bates="VQ-000056">VQ-000056</span> - Meeting notes from settlement conference on March 15, 2024

These documents may be subject to settlement privilege protection depending on your jurisdiction's rules.

<button class="save-to-notes-btn mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Save to Notes</button>`;
  }
  
  if (lowerQ.includes('hot') || lowerQ.includes('admission')) {
    return `I identified 1 potential hot document with an admission against interest:

1. <span class="bates-citation" data-bates="VQ-000034">VQ-000034</span> - Email where defendant's CEO states "I knew about the defect but thought we could fix it before anyone got hurt"

This document contains a clear admission of prior knowledge of the defect, which contradicts defendant's sworn testimony that they had no knowledge of any safety issues. This is critical impeachment evidence.

<button class="save-to-notes-btn mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Save to Notes</button>`;
  }
  
  if (lowerQ.includes('privilege log') || lowerQ.includes('generate')) {
    return `I can help you generate a privilege log. Based on the privileged documents I've identified, I'll create a court-compliant privilege log with the following information:

- Bates numbers (with clickable hyperlinks)
- Document dates
- Authors and recipients
- Subject lines/descriptions
- Privilege type claimed (attorney-client, work product)
- Justification for privilege claim

Would you like me to proceed with generating the privilege log in Excel format?

<button class="generate-privilege-log-btn mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">Generate Privilege Log</button>`;
  }
  
  // Default response
  return `I've analyzed the selected documents regarding your question: "${question}"

To provide a more accurate answer, could you clarify:
- Are you looking for specific types of documents (emails, contracts, etc.)?
- Are you interested in documents from a particular time period?
- Should I focus on specific people or parties?

Alternatively, you can try one of these queries:
- "Which documents contain attorney-client privileged communications?"
- "Show me all emails mentioning settlement discussions"
- "Identify hot documents with admissions against interest"

<button class="save-to-notes-btn mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Save to Notes</button>`;
}

// Add message to chat
function addChatMessage(role, content, isLoading = false) {
  const container = document.getElementById('chat-messages');
  if (!container) return null;
  
  const messageId = `msg-${Date.now()}`;
  const messageClass = role === 'user' ? 'bg-blue-600 text-white ml-auto' : 'bg-gray-100 text-gray-900';
  const alignClass = role === 'user' ? 'justify-end' : 'justify-start';
  
  const messageHTML = `
    <div id="${messageId}" class="flex ${alignClass} max-w-3xl mx-auto">
      <div class="${messageClass} rounded-lg px-4 py-3 max-w-2xl">
        <div class="text-sm ${isLoading ? 'italic' : ''}">${content}</div>
      </div>
    </div>
  `;
  
  container.insertAdjacentHTML('beforeend', messageHTML);
  container.scrollTop = container.scrollHeight;
  
  // Add event listeners to Bates citations and buttons
  if (role === 'assistant' && !isLoading) {
    setTimeout(() => {
      const messageEl = document.getElementById(messageId);
      if (messageEl) {
        // Bates citations - make them clickable and open PDF viewer
        messageEl.querySelectorAll('.bates-citation').forEach(citation => {
          citation.style.cssText = 'color: #2563eb; cursor: pointer; text-decoration: underline; font-weight: 600; padding: 2px 6px; background: #eff6ff; rounded: 4px;';
          citation.addEventListener('click', async () => {
            const bates = citation.dataset.bates;
            showNotification(`Opening ${bates}...`, 'info');
            
            // Find document by Bates number
            try {
              const response = await fetch(`/api/documents?matter_id=${currentMatter}`);
              const documents = await response.json();
              const doc = documents.find(d => d.bates_start === bates || (d.bates_start <= bates && d.bates_end >= bates));
              
              if (doc) {
                openPDFViewer(doc.id);
              } else {
                showNotification(`Document with Bates ${bates} not found`, 'error');
              }
            } catch (error) {
              console.error('Error finding document:', error);
              showNotification('Failed to open document', 'error');
            }
          });
        });
        
        // Save to notes button
        messageEl.querySelectorAll('.save-to-notes-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const noteText = messageEl.querySelector('.text-sm').textContent;
            saveNoteFromChat(noteText);
          });
        });
        
        // Generate privilege log button
        messageEl.querySelectorAll('.generate-privilege-log-btn').forEach(btn => {
          btn.addEventListener('click', generatePrivilegeLog);
        });
      }
    }, 100);
  }
  
  return messageId;
}

// Remove chat message
function removeChatMessage(messageId) {
  const message = document.getElementById(messageId);
  if (message) message.remove();
}

// Save note from chat
async function saveNoteFromChat(text) {
  try {
    // Extract Bates references from text
    const batesMatches = text.match(/VQ-\d{6}/g);
    const batesRefs = batesMatches ? batesMatches.join(', ') : null;
    
    const response = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        note_text: text,
        bates_references: batesRefs,
        source: 'chat'
      })
    });
    
    if (response.ok) {
      showNotification('Saved to notes', 'success');
      await loadNotes();
    }
  } catch (error) {
    console.error('Error saving note:', error);
    showNotification('Failed to save note', 'error');
  }
}

// Load notes
async function loadNotes() {
  try {
    const response = await fetch('/api/notes');
    notes = await response.json();
    renderNotes();
  } catch (error) {
    console.error('Error loading notes:', error);
  }
}

// Render notes
function renderNotes() {
  const container = document.getElementById('notes-list');
  if (!container) return;
  
  if (notes.length === 0) {
    container.innerHTML = `
      <div class="text-center text-gray-500 py-12">
        <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <p class="mt-3 text-sm">No notes yet</p>
        <p class="text-xs text-gray-400 mt-1">Save insights from chat conversations</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = notes.map(note => `
    <div class="note-card bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
      <div class="flex items-start justify-between mb-2">
        <span class="text-xs font-medium text-yellow-800">${note.source === 'chat' ? '💬 From Chat' : '✍️ Manual'}</span>
        <span class="text-xs text-gray-500">${formatDate(note.created_at)}</span>
      </div>
      <p class="text-sm text-gray-800 mb-2">${escapeHtml(note.note_text.substring(0, 200))}${note.note_text.length > 200 ? '...' : ''}</p>
      ${note.bates_references ? `<div class="text-xs text-blue-600 font-mono">${note.bates_references}</div>` : ''}
    </div>
  `).join('');
}

// Switch notes/reports tab
function switchNotesTab(tab) {
  // Update button styles
  document.querySelectorAll('.notes-tab-button').forEach(btn => {
    if (btn.dataset.tab === tab) {
      btn.classList.add('active', 'border-blue-600', 'text-blue-600');
      btn.classList.remove('border-transparent', 'text-gray-600');
    } else {
      btn.classList.remove('active', 'border-blue-600', 'text-blue-600');
      btn.classList.add('border-transparent', 'text-gray-600');
    }
  });
  
  // Show/hide panels
  document.getElementById('notes-panel').classList.toggle('hidden', tab !== 'notes');
  document.getElementById('reports-panel').classList.toggle('hidden', tab !== 'reports');
}

// Show add note dialog
function showAddNoteDialog() {
  const noteText = prompt('Enter your note:');
  if (noteText && noteText.trim()) {
    saveNoteFromChat(noteText);
  }
}

// Generate privilege log
async function generatePrivilegeLog() {
  showNotification('Generating privilege log with clickable Bates hyperlinks...', 'info');
  
  try {
    const response = await fetch('/api/reports/privilege-log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        matter_id: currentMatter
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate privilege log');
    }
    
    // Check if it's a CSV file
    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.includes('text/csv')) {
      // Download CSV file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'privilege-log.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showNotification('Privilege log downloaded successfully! Open in Excel to see clickable Bates hyperlinks.', 'success');
    } else {
      const result = await response.json();
      if (!result.success) {
        showNotification(result.message || 'No privileged documents found', 'error');
      }
    }
  } catch (error) {
    console.error('Privilege log error:', error);
    showNotification('Failed to generate privilege log: ' + error.message, 'error');
  }
}

// Generate timeline
async function generateTimeline() {
  showNotification('Creating chronological timeline...', 'info');
  
  try {
    const response = await fetch('/api/reports/timeline', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        matter_id: currentMatter
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate timeline');
    }
    
    const data = await response.json();
    
    if (!data.success) {
      showNotification(data.message || 'No documents found for timeline', 'error');
      return;
    }
    
    // Display timeline in a modal or new view
    displayTimelineModal(data.timeline);
    showNotification(`Timeline created with ${data.timeline.total_documents} documents`, 'success');
  } catch (error) {
    console.error('Timeline error:', error);
    showNotification('Failed to generate timeline: ' + error.message, 'error');
  }
}

// Generate hot document report
async function generateHotDocReport() {
  showNotification('Compiling hot documents report...', 'info');
  
  try {
    const response = await fetch('/api/reports/hot-documents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        matter_id: currentMatter
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate hot documents report');
    }
    
    const data = await response.json();
    
    if (!data.success) {
      showNotification(data.message || 'No hot documents identified yet', 'error');
      return;
    }
    
    // Display hot documents report
    displayHotDocsModal(data);
    showNotification(`Hot documents report: ${data.total_count} critical documents identified`, 'success');
  } catch (error) {
    console.error('Hot docs report error:', error);
    showNotification('Failed to generate hot documents report: ' + error.message, 'error');
  }
}

// Display timeline modal
function displayTimelineModal(timeline) {
  const modalHTML = `
    <div id="timeline-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onclick="this.remove()">
      <div class="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-auto m-4" onclick="event.stopPropagation()">
        <div class="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 class="text-xl font-semibold text-gray-900">📅 Document Timeline</h2>
          <button onclick="document.getElementById('timeline-modal').remove()" class="text-gray-500 hover:text-gray-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            ${timeline.documents.map((doc, idx) => `
              <div class="flex">
                <div class="flex-shrink-0 w-24 text-right pr-4 text-sm text-gray-500">
                  ${formatDate(doc.upload_date)}
                </div>
                <div class="flex-shrink-0 w-2 relative">
                  <div class="h-full w-0.5 bg-blue-200 absolute left-1/2 transform -translate-x-1/2"></div>
                  <div class="w-2 h-2 bg-blue-600 rounded-full absolute left-1/2 top-2 transform -translate-x-1/2"></div>
                </div>
                <div class="flex-1 pl-4 pb-8">
                  <div class="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-colors cursor-pointer" onclick="openPDFViewer(${doc.id})">
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <p class="font-medium text-gray-900">${escapeHtml(doc.filename)}</p>
                        <p class="text-sm text-blue-600 font-mono mt-1">${doc.bates_start}</p>
                        ${doc.classifications ? `<div class="flex gap-2 mt-2">
                          ${doc.classifications.split(',').map(cls => `<span class="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">${cls}</span>`).join('')}
                        </div>` : ''}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Display hot documents modal
function displayHotDocsModal(data) {
  const modalHTML = `
    <div id="hotdocs-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onclick="this.remove()">
      <div class="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-auto m-4" onclick="event.stopPropagation()">
        <div class="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-red-50 to-orange-50">
          <div>
            <h2 class="text-xl font-semibold text-gray-900">🔥 Hot Documents Report</h2>
            <p class="text-sm text-gray-600 mt-1">${data.matter} - ${data.total_count} critical documents identified</p>
          </div>
          <button onclick="document.getElementById('hotdocs-modal').remove()" class="text-gray-500 hover:text-gray-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            ${data.hot_documents.map((doc, idx) => `
              <div class="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4">
                <div class="flex items-start justify-between mb-3">
                  <div class="flex items-center space-x-2">
                    <span class="text-2xl">🔥</span>
                    <div>
                      <p class="font-semibold text-gray-900">${doc.filename}</p>
                      <p class="text-sm text-blue-600 font-mono">Bates: ${doc.bates_number}</p>
                    </div>
                  </div>
                  ${doc.confidence ? `<span class="text-xs px-2 py-1 bg-red-600 text-white rounded font-medium">Confidence: ${Math.round(doc.confidence * 100)}%</span>` : ''}
                </div>
                <div class="bg-white rounded p-3 mb-3">
                  <p class="text-sm text-gray-700 font-medium mb-1">Legal Significance:</p>
                  <p class="text-sm text-gray-600">${doc.justification || 'Critical litigation evidence'}</p>
                </div>
                <div class="flex space-x-2">
                  <a href="${doc.link}" class="text-sm text-blue-600 hover:text-blue-700 font-medium">View Document →</a>
                  <button onclick="openPDFViewer(${idx + 1})" class="text-sm text-gray-600 hover:text-gray-700">Open in Viewer</button>
                </div>
              </div>
            `).join('')}
          </div>
          
          ${data.notes.length > 0 ? `
            <div class="mt-6 pt-6 border-t border-gray-200">
              <h3 class="text-sm font-semibold text-gray-900 mb-3">Related Notes</h3>
              <div class="space-y-2">
                ${data.notes.slice(0, 5).map(note => `
                  <div class="bg-yellow-50 border border-yellow-200 rounded p-3">
                    <p class="text-sm text-gray-800">${escapeHtml(note.note_text.substring(0, 150))}${note.note_text.length > 150 ? '...' : ''}</p>
                    ${note.bates_references ? `<p class="text-xs text-blue-600 font-mono mt-1">${note.bates_references}</p>` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
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
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('matter_id', currentMatter.toString());
      
      // Upload to server
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }
      
      const result = await response.json();
      console.log('Upload successful:', result);
      showNotification(`${file.name} uploaded - Bates: ${result.document.bates_start}`, 'success');
    } catch (error) {
      console.error('Upload error:', error);
      showNotification(`Failed to upload ${file.name}: ${error.message}`, 'error');
    }
  }
  
  // Reload documents
  await loadDocuments();
  
  // Hide upload area
  toggleUploadArea();
  
  // Reset input
  event.target.value = '';
}

// Utility: Show notification
function showNotification(message, type = 'info') {
  console.log(`[${type.toUpperCase()}] ${message}`);
  // TODO: Implement toast notification UI
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
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ============================================
// MATTER MANAGEMENT
// ============================================

// Load matters and populate selector
async function loadMatters() {
  try {
    const response = await fetch('/api/matters');
    const matters = await response.json();
    
    const selector = document.getElementById('matter-selector');
    if (!selector) return;
    
    selector.innerHTML = matters.map(matter => 
      `<option value="${matter.id}">${matter.name} (${matter.bates_prefix})</option>`
    ).join('');
    
    // Set current matter to first in list if exists
    if (matters.length > 0) {
      currentMatter = matters[0].id;
    }
    
    console.log('Loaded matters:', matters);
  } catch (error) {
    console.error('Error loading matters:', error);
    showNotification('Failed to load matters', 'error');
  }
}

// Show create matter modal
function showCreateMatterModal() {
  const modal = document.getElementById('create-matter-modal');
  if (modal) {
    modal.classList.remove('hidden');
    // Clear previous inputs
    document.getElementById('new-matter-name').value = '';
    document.getElementById('new-matter-prefix').value = '';
    document.getElementById('new-matter-description').value = '';
    // Focus on name input
    setTimeout(() => document.getElementById('new-matter-name').focus(), 100);
  }
}

// Hide create matter modal
function hideCreateMatterModal() {
  const modal = document.getElementById('create-matter-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

// Submit new matter
async function submitCreateMatter() {
  const name = document.getElementById('new-matter-name').value.trim();
  const prefix = document.getElementById('new-matter-prefix').value.trim().toUpperCase();
  const description = document.getElementById('new-matter-description').value.trim();
  
  // Validation
  if (!name) {
    showNotification('Please enter a matter name', 'error');
    return;
  }
  
  if (!prefix) {
    showNotification('Please enter a Bates prefix', 'error');
    return;
  }
  
  if (prefix.length < 2 || prefix.length > 6) {
    showNotification('Bates prefix must be 2-6 letters', 'error');
    return;
  }
  
  if (!/^[A-Z]+$/.test(prefix)) {
    showNotification('Bates prefix must contain only letters', 'error');
    return;
  }
  
  try {
    const response = await fetch('/api/matters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, bates_prefix: prefix, description })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      showNotification(data.error || 'Failed to create matter', 'error');
      return;
    }
    
    // Success
    showNotification(`Matter "${name}" created successfully!`, 'success');
    hideCreateMatterModal();
    
    // Reload matters and switch to new matter
    await loadMatters();
    currentMatter = data.matter.id;
    document.getElementById('matter-selector').value = data.matter.id;
    await loadDocuments();
    
  } catch (error) {
    console.error('Error creating matter:', error);
    showNotification('Failed to create matter', 'error');
  }
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
  const modal = document.getElementById('create-matter-modal');
  if (modal && e.target === modal) {
    hideCreateMatterModal();
  }
});
