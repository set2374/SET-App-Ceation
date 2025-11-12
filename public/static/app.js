// TLS eDiscovery Platform - NotebookLM-Style Interface

// Global state
let currentMatter = parseInt(localStorage.getItem('currentMatter')) || 1; // Persist matter selection
let selectedSources = [];
let notes = [];
let chatHistory = [];

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
  console.log('TLS eDiscovery Platform (NotebookLM style) initializing...');
  
  // Setup mobile/orientation optimizations
  setupMobileOptimizations();
  
  // Load initial data
  await loadMatters();
  await loadNotes();
  await loadDocuments();
  
  // Setup event listeners
  setupEventListeners();
  
  console.log('Application ready');
});

// Mobile and orientation optimizations
function setupMobileOptimizations() {
  // Detect if running on mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isTablet = /iPad|Android/i.test(navigator.userAgent) && window.innerWidth >= 768;
  
  if (isMobile || isTablet) {
    console.log('Mobile/tablet device detected');
    
    // Set initial orientation state
    handleOrientationChange();
    
    // Request landscape orientation on mobile (if supported)
    if (screen.orientation && screen.orientation.lock) {
      // Try to lock to landscape on mobile phones (not tablets)
      if (isMobile && !isTablet && window.innerWidth < 768) {
        screen.orientation.lock('landscape').catch(err => {
          console.log('Orientation lock not supported or denied:', err);
        });
      }
    }
    
    // Add mobile-specific class to body
    document.body.classList.add('mobile-device');
    if (isTablet) {
      document.body.classList.add('tablet-device');
    }
    
    // Show orientation suggestion on small mobile devices
    if (isMobile && !isTablet && window.innerWidth < 768) {
      showOrientationSuggestion();
    }
    
    // Listen for orientation changes (multiple events for compatibility)
    window.addEventListener('orientationchange', () => {
      setTimeout(handleOrientationChange, 100); // Delay to let browser update
    });
    window.addEventListener('resize', () => {
      setTimeout(handleOrientationChange, 100);
    });
    
    // Also listen to screen.orientation if available
    if (screen.orientation) {
      screen.orientation.addEventListener('change', () => {
        setTimeout(handleOrientationChange, 100);
      });
    }
  }
  
  // Prevent zoom on input focus (iOS)
  if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
      // Store original content
      const originalContent = viewportMeta.content;
      
      // Prevent zoom on focus
      document.addEventListener('focusin', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
          viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        }
      });
      
      // Restore original on blur
      document.addEventListener('focusout', () => {
        viewportMeta.content = originalContent;
      });
    }
  }
  
  // Add touch event handlers for better mobile UX
  document.addEventListener('touchstart', function() {}, {passive: true});
}

// Handle orientation changes
function handleOrientationChange() {
  // Use both window.orientation (deprecated but works on iOS) and screen.orientation
  let isLandscape = false;
  
  if (window.screen && window.screen.orientation) {
    // Modern API
    isLandscape = window.screen.orientation.type.includes('landscape');
  } else if (typeof window.orientation !== 'undefined') {
    // Legacy API (iOS)
    isLandscape = Math.abs(window.orientation) === 90;
  } else {
    // Fallback
    isLandscape = window.innerWidth > window.innerHeight;
  }
  
  console.log(`Orientation: ${isLandscape ? 'Landscape' : 'Portrait'}, Width: ${window.innerWidth}, Height: ${window.innerHeight}`);
  
  if (isLandscape) {
    // Landscape mode
    document.body.classList.add('landscape-mode');
    document.body.classList.remove('portrait-mode');
    document.body.setAttribute('data-orientation', 'landscape');
    hideOrientationSuggestion();
  } else {
    // Portrait mode
    document.body.classList.add('portrait-mode');
    document.body.classList.remove('landscape-mode');
    document.body.setAttribute('data-orientation', 'portrait');
    
    // Show suggestion again if on small mobile
    if (window.innerWidth < 768) {
      setTimeout(showOrientationSuggestion, 1000);
    }
  }
  
  // Force layout recalculation
  document.body.style.display = 'none';
  void document.body.offsetHeight; // Trigger reflow
  document.body.style.display = '';
}

// Handle window resize
function handleResize() {
  // Adjust layout based on new dimensions
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  console.log(`Window resized: ${width}x${height}`);
  
  // Update orientation-based classes
  if (width > height) {
    document.body.classList.add('landscape-mode');
    document.body.classList.remove('portrait-mode');
  } else {
    document.body.classList.add('portrait-mode');
    document.body.classList.remove('landscape-mode');
  }
}

// Show orientation suggestion banner (dismissable)
function showOrientationSuggestion() {
  // Don't show if already dismissed in this session
  if (sessionStorage.getItem('orientation-suggestion-dismissed')) {
    return;
  }
  
  // Only show in portrait on small screens
  if (window.innerWidth >= window.innerHeight || window.innerWidth >= 768) {
    return;
  }
  
  // Check if banner already exists
  if (document.getElementById('orientation-banner')) {
    return;
  }
  
  const banner = document.createElement('div');
  banner.id = 'orientation-banner';
  banner.className = 'fixed bottom-0 left-0 right-0 bg-blue-600 text-white p-3 shadow-lg z-50 flex items-center justify-between';
  banner.innerHTML = `
    <div class="flex items-center space-x-3">
      <svg class="w-6 h-6 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
      <div>
        <p class="text-sm font-semibold">Rotate your device for better experience</p>
        <p class="text-xs opacity-90">This app works best in landscape mode</p>
      </div>
    </div>
    <button onclick="hideOrientationSuggestion()" class="text-white hover:text-gray-200 p-2">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  `;
  
  document.body.appendChild(banner);
  
  // Auto-hide after 8 seconds
  setTimeout(() => {
    hideOrientationSuggestion();
  }, 8000);
}

// Hide orientation suggestion banner
function hideOrientationSuggestion() {
  const banner = document.getElementById('orientation-banner');
  if (banner) {
    banner.remove();
    sessionStorage.setItem('orientation-suggestion-dismissed', 'true');
  }
}

// Panel swipe navigation (mobile portrait mode)
let currentPanel = 0; // 0 = Sources, 1 = Chat, 2 = Notes
const totalPanels = 3;

function setupPanelSwipeNavigation() {
  // Only setup on mobile devices
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isPortrait = window.innerWidth < window.innerHeight;
  
  console.log(`setupPanelSwipeNavigation: isMobile=${isMobile}, isPortrait=${isPortrait}, width=${window.innerWidth}`);
  
  if (!isMobile) {
    console.log('Not a mobile device, skipping swipe navigation');
    return;
  }
  
  const panelContainer = document.querySelector('.flex-1.flex.overflow-hidden');
  if (!panelContainer) {
    console.error('Panel container not found!');
    return;
  }
  
  console.log('Panel container found:', panelContainer);
  console.log('Panel container children:', panelContainer.children.length);
  
  // Force the container styles for portrait mode
  if (isPortrait && window.innerWidth < 768) {
    console.log('Forcing portrait swipe styles');
    panelContainer.style.flexDirection = 'row';
    panelContainer.style.overflowX = 'scroll';
    panelContainer.style.scrollSnapType = 'x mandatory';
    panelContainer.style.webkitOverflowScrolling = 'touch';
    
    // Force each child panel to full width
    Array.from(panelContainer.children).forEach((child, index) => {
      child.style.width = '100vw';
      child.style.minWidth = '100vw';
      child.style.maxWidth = '100vw';
      child.style.flexShrink = '0';
      child.style.scrollSnapAlign = 'start';
      console.log(`Panel ${index} styled:`, child);
    });
  }
  
  // Create panel indicators
  createPanelIndicators();
  
  // Create navigation buttons
  createNavigationButtons();
  
  // Track scroll position to update indicators
  panelContainer.addEventListener('scroll', updatePanelIndicators, {passive: true});
  
  // Add touch event logging for debugging
  panelContainer.addEventListener('touchstart', (e) => {
    console.log('Touch start detected');
  }, {passive: true});
  
  panelContainer.addEventListener('touchmove', (e) => {
    console.log('Touch move detected');
  }, {passive: true});
  
  // Update initial state
  updatePanelIndicators();
  
  console.log('✅ Panel swipe navigation initialized successfully');
  console.log('Panel container scroll width:', panelContainer.scrollWidth);
  console.log('Panel container client width:', panelContainer.clientWidth);
}

function createPanelIndicators() {
  // Check if already exists
  if (document.getElementById('panel-indicators')) {
    console.log('Panel indicators already exist');
    return;
  }
  
  const indicatorsContainer = document.createElement('div');
  indicatorsContainer.id = 'panel-indicators';
  
  // Force visible on mobile portrait
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isPortrait = window.innerWidth < window.innerHeight;
  
  if (isMobile && isPortrait && window.innerWidth < 768) {
    indicatorsContainer.style.display = 'flex';
    console.log('Panel indicators forced visible');
  } else {
    indicatorsContainer.style.display = 'none';
  }
  
  for (let i = 0; i < totalPanels; i++) {
    const dot = document.createElement('div');
    dot.className = 'indicator-dot';
    dot.dataset.panel = i;
    dot.addEventListener('click', () => {
      console.log(`Indicator dot ${i} clicked`);
      navigateToPanel(i);
    });
    indicatorsContainer.appendChild(dot);
  }
  
  document.body.appendChild(indicatorsContainer);
  console.log('✅ Panel indicators created:', totalPanels, 'dots');
}

function createNavigationButtons() {
  // Check if already exists
  if (document.getElementById('prev-panel-btn')) {
    console.log('Navigation buttons already exist');
    return;
  }
  
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isPortrait = window.innerWidth < window.innerHeight;
  
  // Previous button
  const prevBtn = document.createElement('button');
  prevBtn.id = 'prev-panel-btn';
  prevBtn.className = 'panel-nav-button';
  
  // Force visible on mobile portrait
  if (isMobile && isPortrait && window.innerWidth < 768) {
    prevBtn.style.display = 'flex';
    console.log('Previous button forced visible');
  } else {
    prevBtn.style.display = 'none';
  }
  
  prevBtn.innerHTML = `
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
    </svg>
  `;
  prevBtn.addEventListener('click', () => {
    console.log('Previous button clicked');
    navigateToPanel(currentPanel - 1);
  });
  document.body.appendChild(prevBtn);
  
  // Next button
  const nextBtn = document.createElement('button');
  nextBtn.id = 'next-panel-btn';
  nextBtn.className = 'panel-nav-button';
  
  // Force visible on mobile portrait
  if (isMobile && isPortrait && window.innerWidth < 768) {
    nextBtn.style.display = 'flex';
    console.log('Next button forced visible');
  } else {
    nextBtn.style.display = 'none';
  }
  
  nextBtn.innerHTML = `
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
    </svg>
  `;
  nextBtn.addEventListener('click', () => {
    console.log('Next button clicked');
    navigateToPanel(currentPanel + 1);
  });
  document.body.appendChild(nextBtn);
  
  console.log('✅ Navigation buttons created');
}

function updatePanelIndicators() {
  const panelContainer = document.querySelector('.flex-1.flex.overflow-hidden');
  if (!panelContainer) return;
  
  // Calculate which panel is currently visible based on scroll position
  const scrollLeft = panelContainer.scrollLeft;
  const panelWidth = panelContainer.offsetWidth;
  const newPanel = Math.round(scrollLeft / panelWidth);
  
  if (newPanel !== currentPanel) {
    currentPanel = newPanel;
    console.log(`Switched to panel ${currentPanel}`);
  }
  
  // Update indicator dots
  const dots = document.querySelectorAll('.indicator-dot');
  dots.forEach((dot, index) => {
    if (index === currentPanel) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
  
  // Update navigation buttons state
  const prevBtn = document.getElementById('prev-panel-btn');
  const nextBtn = document.getElementById('next-panel-btn');
  
  if (prevBtn) {
    prevBtn.disabled = currentPanel === 0;
  }
  
  if (nextBtn) {
    nextBtn.disabled = currentPanel === totalPanels - 1;
  }
}

function navigateToPanel(panelIndex) {
  console.log(`navigateToPanel called: ${panelIndex} (current: ${currentPanel})`);
  
  if (panelIndex < 0 || panelIndex >= totalPanels) {
    console.log(`Panel index ${panelIndex} out of range [0-${totalPanels-1}]`);
    return;
  }
  
  const panelContainer = document.querySelector('.flex-1.flex.overflow-hidden');
  if (!panelContainer) {
    console.error('Panel container not found in navigateToPanel');
    return;
  }
  
  const panelWidth = panelContainer.offsetWidth;
  const targetScrollLeft = panelIndex * panelWidth;
  
  console.log(`Scrolling to panel ${panelIndex}: scrollLeft=${targetScrollLeft}, panelWidth=${panelWidth}`);
  
  panelContainer.scrollTo({
    left: targetScrollLeft,
    behavior: 'smooth'
  });
  
  currentPanel = panelIndex;
  
  // Force update indicators immediately
  setTimeout(() => {
    updatePanelIndicators();
  }, 100);
  
  console.log(`✅ Navigated to panel ${panelIndex}`);
}

// Setup all event listeners
function setupEventListeners() {
  // Setup panel swipe navigation for mobile portrait
  setupPanelSwipeNavigation();
  
  // Re-setup on orientation change
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      setupPanelSwipeNavigation();
      updatePanelIndicators();
    }, 200);
  });
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
  
  // Source search (text search in documents)
  const sourceSearch = document.getElementById('source-search');
  if (sourceSearch) {
    let searchTimeout;
    sourceSearch.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        const query = e.target.value.trim();
        if (query.length >= 3) {
          performDocumentSearch(query);
        } else if (query.length === 0) {
          loadDocuments(); // Reset to full list
        }
      }, 500); // Debounce 500ms
    });
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
      localStorage.setItem('currentMatter', currentMatter); // Persist selection
      await loadDocuments();
      await loadNotes(); // Reload notes for new matter
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
        <button 
          onclick="event.stopPropagation(); deleteDocument(${doc.id}, '${escapeHtml(doc.filename)}')"
          class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          title="Delete document"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
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

// Open PDF viewer (with optional page number)
async function openPDFViewer(docId, pageNumber = 1) {
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
        
        // Use iframe with page number anchor
        const pageAnchor = pageNumber > 1 ? `#page=${pageNumber}` : '';
        pdfContent.innerHTML = `
          <iframe 
            src="${pdfUrl}${pageAnchor}" 
            class="w-full h-full border-0"
            title="${escapeHtml(doc.filename)}"
          ></iframe>
        `;
        
        const pageInfo = pageNumber > 1 ? ` (Page ${pageNumber})` : '';
        showNotification(`PDF loaded successfully${pageInfo}`, 'success');
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
    
    // Check for hallucinations and add warning
    let formattedResponse = '';
    
    if (data.hallucination_detected && data.hallucinated_citations && data.hallucinated_citations.length > 0) {
      formattedResponse += `<div class="bg-red-50 border-2 border-red-500 rounded-lg p-4 mb-4">
        <div class="flex items-start space-x-3">
          <svg class="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h4 class="font-bold text-red-900 text-sm">⚠️ AI HALLUCINATION DETECTED</h4>
            <p class="text-red-800 text-xs mt-1">
              <strong>CRITICAL WARNING:</strong> The AI referenced non-existent document(s): 
              <strong>${data.hallucinated_citations.join(', ')}</strong>
            </p>
            <p class="text-red-700 text-xs mt-2">
              <strong>Do NOT rely on this response.</strong> Verify all Bates citations against actual uploaded documents before using this analysis.
            </p>
          </div>
        </div>
      </div>`;
    }
    
    formattedResponse += data.response;
    
    // Convert [BATES: VQ-000001] format to clickable links
    // Mark hallucinated citations in red, validated in blue
    formattedResponse = formattedResponse.replace(
      /\[BATES: ([^\]]+)\]/g,
      (match, bates) => {
        const isHallucinated = data.hallucinated_citations && data.hallucinated_citations.includes(bates);
        const color = isHallucinated ? 'text-red-600 bg-red-100 border-red-300' : 'text-blue-600 bg-blue-50 border-blue-200';
        const cursor = isHallucinated ? 'cursor-not-allowed' : 'cursor-pointer';
        return `<span class="bates-citation ${color} ${cursor} px-2 py-1 rounded border font-mono text-xs" data-bates="${bates}" data-hallucinated="${isHallucinated}">${bates}</span>`;
      }
    );
    
    // Add disclaimer for AI-generated content
    formattedResponse += `\n\n<div class="text-xs text-gray-500 italic mt-3 border-t pt-2">
      ⚖️ <strong>Legal Notice:</strong> AI-generated analysis requires attorney review before use in litigation or privilege assertions.
    </div>`;
    
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
      
      // Extract text from PDF immediately after upload
      await extractTextFromPDF(file, result.document.id, result.document.bates_start);
      
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

// Extract text from PDF using PDF.js
async function extractTextFromPDF(file, documentId, batesStart) {
  try {
    console.log(`[TEXT EXTRACTION] Starting extraction for: ${file.name}, Document ID: ${documentId}`);
    showNotification(`Extracting text from ${file.name}...`, 'info');
    
    // Check if PDF.js is loaded
    if (typeof pdfjsLib === 'undefined') {
      const errorMsg = 'PDF.js library not loaded. Check CDN connection.';
      console.error(`[TEXT EXTRACTION ERROR] ${errorMsg}`);
      throw new Error(errorMsg);
    }
    console.log('[TEXT EXTRACTION] PDF.js library loaded successfully');
    
    // Configure PDF.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    console.log('[TEXT EXTRACTION] PDF.js worker configured');
    
    // Read file as ArrayBuffer
    console.log(`[TEXT EXTRACTION] Reading file as ArrayBuffer (${file.size} bytes)...`);
    const arrayBuffer = await file.arrayBuffer();
    console.log(`[TEXT EXTRACTION] ArrayBuffer created: ${arrayBuffer.byteLength} bytes`);
    
    if (arrayBuffer.byteLength === 0) {
      throw new Error('PDF file is empty (0 bytes)');
    }
    
    // Load PDF document
    console.log('[TEXT EXTRACTION] Loading PDF document with PDF.js...');
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    console.log(`[TEXT EXTRACTION] PDF loaded successfully. Pages: ${pdf.numPages}`);
    
    const pageCount = pdf.numPages;
    if (pageCount === 0) {
      throw new Error('PDF has 0 pages');
    }
    
    const pages = [];
    let fullText = '';
    let totalTextLength = 0;
    
    // Extract text from each page
    console.log(`[TEXT EXTRACTION] Beginning page-by-page extraction (${pageCount} pages)...`);
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Concatenate text items with spaces
        const pageText = textContent.items
          .map(item => item.str)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        totalTextLength += pageText.length;
        
        pages.push({
          page_number: pageNum,
          text: pageText,
          confidence: 1.0  // PDF.js extraction has 100% confidence (native text)
        });
        
        fullText += pageText + '\n\n';
        
        // Log progress every 10 pages
        if (pageNum % 10 === 0 || pageNum === pageCount) {
          console.log(`[TEXT EXTRACTION] Progress: ${pageNum}/${pageCount} pages, ${totalTextLength} chars extracted`);
          showNotification(`Extracting: ${pageNum}/${pageCount} pages...`, 'info');
        }
      } catch (pageError) {
        console.error(`[TEXT EXTRACTION ERROR] Failed on page ${pageNum}:`, pageError);
        // Continue with next page, but record empty text for this page
        pages.push({
          page_number: pageNum,
          text: '',
          confidence: 0.0
        });
      }
    }
    
    console.log(`[TEXT EXTRACTION] Extraction complete. Total text length: ${totalTextLength} characters`);
    
    // Warning if no text was extracted (might be image-based PDF)
    if (totalTextLength === 0) {
      console.warn('[TEXT EXTRACTION WARNING] No text extracted - PDF may be image-based and require OCR');
      showNotification(`⚠ No text found in ${file.name} - may be scanned/image-based PDF`, 'warning');
    }
    
    // Send extracted text to backend
    console.log(`[TEXT EXTRACTION] Sending ${pages.length} pages to backend API...`);
    const response = await fetch(`/api/documents/${documentId}/extract-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        pages: pages,
        full_text: fullText.trim(),
        page_count: pageCount
      })
    });
    
    console.log(`[TEXT EXTRACTION] Backend response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg;
      try {
        const errorJson = JSON.parse(errorText);
        errorMsg = errorJson.error || 'Text extraction failed';
      } catch {
        errorMsg = `Backend error (${response.status}): ${errorText.substring(0, 200)}`;
      }
      console.error(`[TEXT EXTRACTION ERROR] Backend returned error: ${errorMsg}`);
      throw new Error(errorMsg);
    }
    
    const result = await response.json();
    console.log('[TEXT EXTRACTION SUCCESS] Backend confirmed:', result);
    showNotification(
      `✓ Extracted ${result.pages_extracted} pages from ${file.name} (${result.bates_range})`, 
      'success'
    );
    
    return result;
    
  } catch (error) {
    console.error('[TEXT EXTRACTION ERROR] Fatal error:', error);
    console.error('[TEXT EXTRACTION ERROR] Error stack:', error.stack);
    
    // Provide detailed error message to user
    let userMessage = `Cannot extract text from ${file.name}`;
    if (error.message.includes('PDF.js library not loaded')) {
      userMessage += ': PDF library failed to load. Check your internet connection.';
    } else if (error.message.includes('empty') || error.message.includes('0 bytes')) {
      userMessage += ': File is empty or corrupted.';
    } else if (error.message.includes('0 pages')) {
      userMessage += ': PDF has no pages.';
    } else if (error.message.includes('No text found')) {
      userMessage += ': This appears to be a scanned/image-based PDF that requires OCR.';
    } else if (error.message.includes('Backend error')) {
      userMessage += ': Server error - ' + error.message;
    } else {
      userMessage += ': ' + error.message;
    }
    
    showNotification(userMessage, 'error');
    
    // Don't throw - allow upload to succeed even if extraction fails
    // User can manually trigger extraction later or use OCR fallback
    return null;
  }
}

// Utility: Show notification
function showNotification(message, type = 'info') {
  console.log(`[${type.toUpperCase()}] ${message}`);
  
  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed top-4 right-4 z-50 space-y-2';
    document.body.appendChild(toastContainer);
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `
    max-w-sm p-4 rounded-lg shadow-lg border transform transition-all duration-300 ease-in-out
    ${type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : ''}
    ${type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : ''}
    ${type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : ''}
    ${type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800' : ''}
  `;
  
  // Icon based on type
  const icons = {
    error: '<svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>',
    success: '<svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>',
    warning: '<svg class="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>',
    info: '<svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>'
  };
  
  toast.innerHTML = `
    <div class="flex items-start space-x-3">
      <div class="flex-shrink-0">
        ${icons[type] || icons.info}
      </div>
      <div class="flex-1 text-sm font-medium">
        ${escapeHtml(message)}
      </div>
      <button class="flex-shrink-0 text-gray-400 hover:text-gray-600" onclick="this.parentElement.parentElement.remove()">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
        </svg>
      </button>
    </div>
  `;
  
  // Add to container with animation
  toast.style.opacity = '0';
  toast.style.transform = 'translateX(100%)';
  toastContainer.appendChild(toast);
  
  // Trigger animation
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0)';
  }, 10);
  
  // Auto-remove after delay (longer for errors)
  const duration = type === 'error' ? 10000 : type === 'warning' ? 7000 : 5000;
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
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
    
    // Restore saved matter selection from localStorage, or use first matter
    const savedMatterId = parseInt(localStorage.getItem('currentMatter'));
    const matterExists = matters.some(m => m.id === savedMatterId);
    
    if (matterExists) {
      currentMatter = savedMatterId;
      selector.value = savedMatterId;
    } else if (matters.length > 0) {
      currentMatter = matters[0].id;
      selector.value = matters[0].id;
      localStorage.setItem('currentMatter', matters[0].id);
    }
    
    console.log('Loaded matters:', matters, 'Current matter:', currentMatter);
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

// ============================================
// DOCUMENT TEXT SEARCH
// ============================================

// Perform full-text search in documents
async function performDocumentSearch(query) {
  try {
    showNotification(`Searching for "${query}"...`, 'info');
    
    const response = await fetch(`/api/documents/search?q=${encodeURIComponent(query)}&matter_id=${currentMatter}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Search failed');
    }
    
    const data = await response.json();
    console.log('Search results:', data);
    
    // Display search results
    displaySearchResults(data, query);
    
    showNotification(`Found ${data.total_results} result(s)`, 'success');
    
  } catch (error) {
    console.error('Search error:', error);
    showNotification(`Search failed: ${error.message}`, 'error');
  }
}

// Display search results in sources list
function displaySearchResults(data, query) {
  const sourcesList = document.getElementById('sources-list');
  if (!sourcesList) return;
  
  if (data.total_results === 0) {
    sourcesList.innerHTML = `
      <div class="text-center text-gray-500 py-12">
        <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p class="mt-3 text-sm">No results found</p>
        <p class="text-xs text-gray-400 mt-1">Try a different search term</p>
      </div>
    `;
    return;
  }
  
  let html = `
    <div class="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
      <div class="flex items-center space-x-2">
        <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span class="text-xs font-medium text-blue-900">Search: "${escapeHtml(query)}"</span>
      </div>
      <p class="text-xs text-blue-700 mt-1">${data.total_results} result(s) found</p>
    </div>
  `;
  
  // Group results by document
  const docMap = new Map();
  
  // Add document-level matches
  if (data.documents && data.documents.length > 0) {
    data.documents.forEach(doc => {
      docMap.set(doc.id, {
        ...doc,
        pages: []
      });
    });
  }
  
  // Add page-level matches
  if (data.pages && data.pages.length > 0) {
    data.pages.forEach(page => {
      if (!docMap.has(page.document_id)) {
        docMap.set(page.document_id, {
          id: page.document_id,
          filename: page.filename,
          bates_start: page.doc_bates_start,
          pages: []
        });
      }
      docMap.get(page.document_id).pages.push(page);
    });
  }
  
  // Render documents with matches
  docMap.forEach((doc, docId) => {
    const hasPageMatches = doc.pages && doc.pages.length > 0;
    
    html += `
      <div class="mb-3 border border-yellow-300 bg-yellow-50 rounded-lg overflow-hidden">
        <div class="p-3 bg-white border-b border-yellow-200">
          <div class="flex items-start space-x-2">
            <input 
              type="checkbox" 
              class="source-checkbox mt-1" 
              data-id="${doc.id}"
              ${selectedSources.includes(doc.id) ? 'checked' : ''}
            />
            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-2">
                <svg class="w-4 h-4 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm font-medium text-gray-900 truncate">${escapeHtml(doc.filename)}</span>
              </div>
              <div class="flex items-center space-x-2 mt-1">
                <span class="text-xs font-mono text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">${doc.bates_start}</span>
                ${hasPageMatches ? `<span class="text-xs text-yellow-700 font-medium">${doc.pages.length} page match(es)</span>` : ''}
              </div>
            </div>
            <button 
              onclick="openPDFViewer(${doc.id})"
              class="p-1.5 hover:bg-gray-100 rounded"
              title="View PDF"
            >
              <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        </div>
    `;
    
    // Show page-level matches
    if (hasPageMatches) {
      html += `<div class="p-2 space-y-1">`;
      doc.pages.slice(0, 5).forEach(page => {
        // Extract snippet around match
        const pageText = page.page_text || '';
        const matchIndex = pageText.toLowerCase().indexOf(query.toLowerCase());
        const snippetStart = Math.max(0, matchIndex - 50);
        const snippetEnd = Math.min(pageText.length, matchIndex + query.length + 50);
        let snippet = pageText.substring(snippetStart, snippetEnd);
        
        if (snippetStart > 0) snippet = '...' + snippet;
        if (snippetEnd < pageText.length) snippet = snippet + '...';
        
        // Highlight query in snippet
        const highlightedSnippet = snippet.replace(
          new RegExp(`(${escapeRegex(query)})`, 'gi'),
          '<mark class="bg-yellow-200 font-semibold">$1</mark>'
        );
        
        html += `
          <div class="text-xs p-2 bg-white rounded border border-yellow-200 hover:border-yellow-400 cursor-pointer"
               onclick="openPDFViewer(${doc.id}, ${page.page_number})">
            <div class="flex items-center justify-between mb-1">
              <span class="font-mono text-blue-600 font-medium">${page.bates_number}</span>
              <span class="text-gray-500">Page ${page.page_number}</span>
            </div>
            <p class="text-gray-700 leading-relaxed">${highlightedSnippet}</p>
          </div>
        `;
      });
      
      if (doc.pages.length > 5) {
        html += `
          <div class="text-xs text-center text-gray-500 py-1">
            + ${doc.pages.length - 5} more page(s)
          </div>
        `;
      }
      
      html += `</div>`;
    }
    
    html += `</div>`;
  });
  
  sourcesList.innerHTML = html;
  
  // Re-attach checkbox listeners
  document.querySelectorAll('.source-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', updateSelectedSources);
  });
}

// Helper: Escape regex special characters
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Delete document (with confirmation)
async function deleteDocument(docId, filename) {
  // Confirmation dialog
  const confirmed = confirm(
    `Are you sure you want to delete this document?\n\n` +
    `Filename: ${filename}\n` +
    `Document ID: ${docId}\n\n` +
    `This will permanently delete:\n` +
    `• The PDF file from storage\n` +
    `• All extracted text\n` +
    `• All classifications\n` +
    `• All notes\n\n` +
    `This action cannot be undone.`
  );
  
  if (!confirmed) {
    return;
  }
  
  try {
    showNotification(`Deleting ${filename}...`, 'info');
    
    const response = await fetch(`/api/documents/${docId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Delete failed');
    }
    
    const result = await response.json();
    console.log('Delete successful:', result);
    
    showNotification(`✓ Deleted ${filename}`, 'success');
    
    // Reload documents list
    await loadDocuments();
    
    // Clear selected sources if deleted document was selected
    updateSelectedSources();
    
  } catch (error) {
    console.error('Delete error:', error);
    showNotification(`Failed to delete ${filename}: ${error.message}`, 'error');
  }
}
