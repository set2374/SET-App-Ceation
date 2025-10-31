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
function openPDFViewer(docId) {
  const overlay = document.getElementById('pdf-overlay');
  if (!overlay) return;
  
  // TODO: Load actual PDF
  const titleEl = document.getElementById('pdf-title');
  const batesEl = document.getElementById('pdf-bates');
  
  if (titleEl) titleEl.textContent = `Document ${docId}`;
  if (batesEl) batesEl.textContent = `VQ-${String(docId).padStart(6, '0')}`;
  
  overlay.classList.remove('hidden');
  
  // Close button
  const closeBtn = document.getElementById('close-pdf');
  if (closeBtn) {
    closeBtn.onclick = () => overlay.classList.add('hidden');
  }
  
  showNotification('PDF viewer integration coming soon', 'info');
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
    // TODO: Call actual Claude API
    // Simulate AI response
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Remove loading message
    removeChat Message(loadingId);
    
    // Mock AI response with Bates citations
    const mockResponse = generateMockAIResponse(message);
    addChatMessage('assistant', mockResponse);
    
  } catch (error) {
    console.error('Chat error:', error);
    removeChatMessage(loadingId);
    addChatMessage('assistant', 'Sorry, I encountered an error. Please try again.');
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
        // Bates citations
        messageEl.querySelectorAll('.bates-citation').forEach(citation => {
          citation.style.cssText = 'color: #2563eb; cursor: pointer; text-decoration: underline; font-weight: 600;';
          citation.addEventListener('click', () => {
            const bates = citation.dataset.bates;
            showNotification(`Opening ${bates}...`, 'info');
            // TODO: Open PDF to specific page
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
function generatePrivilegeLog() {
  showNotification('Generating privilege log with clickable Bates hyperlinks...', 'info');
  // TODO: Implement actual privilege log generation
  setTimeout(() => {
    showNotification('Privilege log generated! (Feature coming soon)', 'success');
  }, 1500);
}

// Generate timeline
function generateTimeline() {
  showNotification('Creating chronological timeline...', 'info');
  // TODO: Implement actual timeline generation
  setTimeout(() => {
    showNotification('Timeline generated! (Feature coming soon)', 'success');
  }, 1500);
}

// Generate hot document report
function generateHotDocReport() {
  showNotification('Compiling hot documents report...', 'info');
  // TODO: Implement actual hot doc report
  setTimeout(() => {
    showNotification('Hot documents report generated! (Feature coming soon)', 'success');
  }, 1500);
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      showNotification(`${file.name} uploaded successfully`, 'success');
    } catch (error) {
      console.error('Upload error:', error);
      showNotification(`Failed to upload ${file.name}`, 'error');
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
