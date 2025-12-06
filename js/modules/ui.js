/**
 * UI Module - DOM Interactions & Event Handlers
 * 
 * Manages all UI interactions:
 * - Template carousel rendering
 * - File input and drag-drop
 * - Camera capture
 * - Control sliders
 * - Action buttons
 * - History panel
 * - Toast notifications
 */

import { Store } from './store.js';
import { Canvas } from './canvas.js';
import { DB } from './db.js';
import { Processor } from './processor.js';

// DOM Elements cache
let elements = {};

// Debounce timer for sliders
let sliderDebounceTimer = null;
const SLIDER_DEBOUNCE_MS = 16; // ~60fps

/**
 * Initialize UI
 */
function init() {
  cacheElements();
  setupEventListeners();
  renderTemplates();
  loadHistory();
  loadSavedApiKey();
  
  // Subscribe to store changes
  Store.subscribe(handleStateChange);
  
  console.log('UI initialized');
}

/**
 * Cache DOM elements for performance
 */
function cacheElements() {
  elements = {
    // Carousel
    carouselContainer: document.querySelector('.carousel-container'),
    
    // Upload
    uploadZone: document.querySelector('.upload-zone'),
    fileInput: document.getElementById('file-input'),
    cameraBtn: document.getElementById('camera-btn'),
    
    // Preview Section
    previewSection: document.getElementById('preview-section'),
    templatePreviewImg: document.getElementById('template-preview-img'),
    templatePreviewName: document.getElementById('template-preview-name'),
    userPreviewImg: document.getElementById('user-preview-img'),
    resultPlaceholder: document.getElementById('result-placeholder'),
    generateBtn: document.getElementById('generate-btn'),
    
    // Canvas
    canvas: document.getElementById('preview-canvas'),
    editorSection: document.getElementById('editor'),
    controlsContainer: document.querySelector('.controls'),
    
    // Actions
    downloadBtn: document.getElementById('download-btn'),
    shareBtn: document.getElementById('share-btn'),
    resetBtn: document.getElementById('reset-btn'),
    historyBtn: document.getElementById('history-btn'),
    
    // History
    historyPanel: document.getElementById('history-panel'),
    historyGrid: document.querySelector('.history-grid'),
    closeHistoryBtn: document.getElementById('close-history-btn'),
    
    // API Key Modal
    apiKeyBtn: document.getElementById('api-key-btn'),
    apiKeyModal: document.getElementById('api-key-modal'),
    apiKeyInput: document.getElementById('api-key-input'),
    saveApiKeyBtn: document.getElementById('save-api-key-btn'),
    closeApiModalBtn: document.getElementById('close-api-modal-btn'),
    apiStatus: document.getElementById('api-status'),
    
    // Custom Template Modal
    addTemplateBtn: document.getElementById('add-template-btn'),
    customTemplateModal: document.getElementById('custom-template-modal'),
    templateNameInput: document.getElementById('template-name-input'),
    celebrityNameInput: document.getElementById('celebrity-name-input'),
    templateImageInput: document.getElementById('template-image-input'),
    templateUploadZone: document.getElementById('template-upload-zone'),
    templatePreviewContainer: document.getElementById('template-preview-container'),
    saveTemplateBtn: document.getElementById('save-template-btn'),
    closeTemplateModalBtn: document.getElementById('close-template-modal-btn')
  };
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // File input
  elements.fileInput?.addEventListener('change', handleFileSelect);
  
  // Drag and drop
  elements.uploadZone?.addEventListener('dragover', handleDragOver);
  elements.uploadZone?.addEventListener('dragleave', handleDragLeave);
  elements.uploadZone?.addEventListener('drop', handleDrop);
  elements.uploadZone?.addEventListener('click', handleUploadClick);
  elements.uploadZone?.addEventListener('keydown', handleUploadKeydown);
  
  // Camera
  elements.cameraBtn?.addEventListener('click', handleCameraClick);
  
  // Generate button
  elements.generateBtn?.addEventListener('click', handleGenerate);
  
  // Actions
  elements.downloadBtn?.addEventListener('click', handleDownload);
  elements.shareBtn?.addEventListener('click', handleShare);
  elements.resetBtn?.addEventListener('click', handleReset);
  elements.historyBtn?.addEventListener('click', toggleHistoryPanel);
  elements.closeHistoryBtn?.addEventListener('click', toggleHistoryPanel);
  
  // API Key Modal
  elements.apiKeyBtn?.addEventListener('click', openApiKeyModal);
  elements.saveApiKeyBtn?.addEventListener('click', saveApiKey);
  elements.closeApiModalBtn?.addEventListener('click', closeApiKeyModal);
  elements.apiKeyModal?.addEventListener('click', handleModalBackdropClick);
  
  // Custom Template Modal
  elements.addTemplateBtn?.addEventListener('click', openCustomTemplateModal);
  elements.saveTemplateBtn?.addEventListener('click', saveCustomTemplate);
  elements.closeTemplateModalBtn?.addEventListener('click', closeCustomTemplateModal);
  elements.customTemplateModal?.addEventListener('click', handleModalBackdropClick);
  elements.templateUploadZone?.addEventListener('click', () => elements.templateImageInput?.click());
  elements.templateUploadZone?.addEventListener('dragover', handleTemplateDragOver);
  elements.templateUploadZone?.addEventListener('dragleave', handleTemplateDragLeave);
  elements.templateUploadZone?.addEventListener('drop', handleTemplateDrop);
  elements.templateImageInput?.addEventListener('change', handleTemplateImageSelect);
  elements.templateNameInput?.addEventListener('input', validateCustomTemplateForm);
  elements.celebrityNameInput?.addEventListener('input', validateCustomTemplateForm);
  
  // Initialize canvas
  if (elements.canvas) {
    Canvas.init(elements.canvas);
  }
  
  // Add control sliders
  renderControls();
}

/**
 * Handle state changes
 */
function handleStateChange(event, data, state) {
  switch (event) {
    case 'templateSelected':
      updateTemplateSelection(data.id);
      updateActionButtons();
      break;
    case 'userImageChanged':
      updateActionButtons();
      break;
    case 'stateReset':
      clearTemplateSelection();
      updateActionButtons();
      break;
    case 'customTemplateAdded':
    case 'customTemplateRemoved':
      renderTemplates();
      break;
  }
}

/**
 * Render template carousel - Scene-based templates with actual images
 */
function renderTemplates() {
  const templates = Store.getTemplates();
  const container = elements.carouselContainer;
  
  if (!container) return;
  
  container.innerHTML = templates.map(template => `
    <div class="template-card ${template.isCustom ? 'custom-template' : ''}" 
         data-id="${template.id}" 
         tabindex="0" 
         role="button"
         aria-label="Select ${template.name} with ${template.celebrity}">
      ${template.isCustom ? '<button class="delete-template-btn" aria-label="Delete template" data-id="' + template.id + '">✕</button>' : ''}
      <div class="scene-preview">
        <img src="${template.templateImage}" alt="${template.name}" loading="lazy" onerror="this.style.display='none'">
        <div class="scene-overlay"></div>
        <span class="scene-tag">${template.isCustom ? 'Custom' : template.scene}</span>
        <span class="celebrity-overlay">📸 ${template.celebrity}</span>
      </div>
      <div class="template-info">
        <div class="template-name">${template.name}</div>
        ${template.trendingRank <= 3 ? '<span class="trending-badge">🔥 Trending</span>' : ''}
      </div>
    </div>
  `).join('');
  
  // Add click listeners
  container.querySelectorAll('.template-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't select if clicking delete button
      if (e.target.classList.contains('delete-template-btn')) return;
      handleTemplateSelect(card.dataset.id);
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleTemplateSelect(card.dataset.id);
      }
    });
  });
  
  // Add delete button listeners for custom templates
  container.querySelectorAll('.delete-template-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleDeleteCustomTemplate(btn.dataset.id);
    });
  });
}

/**
 * Get gradient colors for scene
 */
function getSceneGradient(scene) {
  const gradients = {
    'beach': '#87CEEB, #F4A460',
    'red-carpet': '#8B0000, #4a0000',
    'stadium': '#228B22, #006400',
    'cafe': '#D2691E, #8B4513',
    'mountain': '#87CEEB, #708090',
    'film-set': '#2F4F4F, #1a1a1a',
    'concert': '#8B008B, #4B0082',
    'yacht': '#00CED1, #4169E1',
    'awards': '#FFD700, #B8860B',
    'street': '#FF6347, #FF4500',
    'gym': '#2F4F4F, #1a1a1a',
    'temple': '#FF8C00, #DAA520'
  };
  return gradients[scene] || '#666, #333';
}

/**
 * Handle template selection
 */
function handleTemplateSelect(templateId) {
  Store.setSelectedTemplate(templateId);
}

/**
 * Update template selection UI
 */
function updateTemplateSelection(selectedId) {
  elements.carouselContainer?.querySelectorAll('.template-card').forEach(card => {
    card.classList.toggle('selected', card.dataset.id === selectedId);
  });
}

/**
 * Clear template selection UI
 */
function clearTemplateSelection() {
  elements.carouselContainer?.querySelectorAll('.template-card').forEach(card => {
    card.classList.remove('selected');
  });
}

/**
 * Render control sliders
 */
function renderControls() {
  const container = elements.controlsContainer;
  if (!container) return;
  
  const params = Store.getEditParams();
  
  container.innerHTML = `
    <div class="control-group">
      <label for="scale-slider">
        <span>Scale</span>
        <span id="scale-value">${params.scale}%</span>
      </label>
      <input type="range" id="scale-slider" 
             min="50" max="200" value="${params.scale}" 
             aria-label="Adjust image scale">
    </div>
    <div class="control-group">
      <label for="rotation-slider">
        <span>Rotation</span>
        <span id="rotation-value">${params.rotation}°</span>
      </label>
      <input type="range" id="rotation-slider" 
             min="0" max="360" value="${params.rotation}" 
             aria-label="Adjust image rotation">
    </div>
    <div class="control-group">
      <label for="opacity-slider">
        <span>Opacity</span>
        <span id="opacity-value">${params.opacity}%</span>
      </label>
      <input type="range" id="opacity-slider" 
             min="0" max="100" value="${params.opacity}" 
             aria-label="Adjust image opacity">
    </div>
  `;
  
  // Add slider listeners
  container.querySelector('#scale-slider')?.addEventListener('input', handleSliderChange);
  container.querySelector('#rotation-slider')?.addEventListener('input', handleSliderChange);
  container.querySelector('#opacity-slider')?.addEventListener('input', handleSliderChange);
}

/**
 * Handle slider changes with debounce
 */
function handleSliderChange(e) {
  const slider = e.target;
  const value = parseInt(slider.value, 10);
  const param = slider.id.replace('-slider', '');
  
  // Update label immediately
  const valueLabel = document.getElementById(`${param}-value`);
  if (valueLabel) {
    valueLabel.textContent = param === 'rotation' ? `${value}°` : `${value}%`;
  }
  
  // Debounce store update
  clearTimeout(sliderDebounceTimer);
  sliderDebounceTimer = setTimeout(() => {
    Store.updateEditParams({ [param]: value });
  }, SLIDER_DEBOUNCE_MS);
}

/**
 * Handle file selection
 */
function handleFileSelect(e) {
  const file = e.target.files?.[0];
  if (file) processFile(file);
}

/**
 * Handle drag over
 */
function handleDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  elements.uploadZone?.classList.add('dragover');
}

/**
 * Handle drag leave
 */
function handleDragLeave(e) {
  e.preventDefault();
  e.stopPropagation();
  elements.uploadZone?.classList.remove('dragover');
}

/**
 * Handle drop
 */
function handleDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  elements.uploadZone?.classList.remove('dragover');
  
  const file = e.dataTransfer?.files?.[0];
  if (file) processFile(file);
}

/**
 * Handle upload zone click
 */
function handleUploadClick(e) {
  if (e.target === elements.cameraBtn || e.target.closest('.camera-btn')) return;
  if (e.target === elements.fileInput || e.target.closest('label[for="file-input"]')) return;
  elements.fileInput?.click();
}

/**
 * Handle upload zone keyboard
 */
function handleUploadKeydown(e) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    elements.fileInput?.click();
  }
}

// Store user's uploaded image temporarily
let pendingUserImage = null;

/**
 * Process uploaded file - show preview, don't generate yet
 */
async function processFile(file) {
  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    showToast('Please upload a JPG, PNG, or WebP image', 'error');
    return;
  }
  
  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    showToast('Image must be less than 5MB', 'error');
    return;
  }
  
  // Check if template is selected
  const template = Store.getSelectedTemplate();
  if (!template) {
    showToast('Please select a celebrity template first', 'warning');
    return;
  }
  
  try {
    // Read file as data URL
    const userImageData = await readFileAsDataURL(file);
    
    // Store for later generation
    pendingUserImage = userImageData;
    
    // Show the preview section with side-by-side images
    showPreviewSection(template, userImageData);
    
    showToast('Ready to generate! Click the Generate button.', 'success');
  } catch (error) {
    console.error('Error loading image:', error);
    showToast('Failed to load image', 'error');
  }
}

/**
 * Show the preview section with template and user images
 */
function showPreviewSection(template, userImageData) {
  // Hide editor section
  elements.editorSection?.classList.add('hidden');
  
  // Show preview section
  elements.previewSection?.classList.remove('hidden');
  
  // Set template preview
  if (elements.templatePreviewImg) {
    elements.templatePreviewImg.src = template.templateImage;
    elements.templatePreviewImg.alt = template.name;
  }
  if (elements.templatePreviewName) {
    elements.templatePreviewName.textContent = template.celebrity;
  }
  
  // Set user image preview
  if (elements.userPreviewImg) {
    elements.userPreviewImg.src = userImageData;
  }
  
  // Reset result placeholder
  if (elements.resultPlaceholder) {
    elements.resultPlaceholder.innerHTML = '<span>🎬</span><p>Click Generate!</p>';
  }
  
  // Enable generate button
  if (elements.generateBtn) {
    elements.generateBtn.disabled = false;
  }
}

/**
 * Handle Generate button click - call Gemini API
 */
async function handleGenerate() {
  const template = Store.getSelectedTemplate();
  if (!template || !pendingUserImage) {
    showToast('Please select a template and upload a photo first', 'warning');
    return;
  }
  
  // Check API key
  if (!Processor.isApiConfigured()) {
    showToast('Please configure your Gemini API key first (click 🔑)', 'warning');
    openApiKeyModal();
    return;
  }
  
  Store.setProcessing(true);
  
  // Update UI to show loading
  if (elements.generateBtn) {
    elements.generateBtn.disabled = true;
    elements.generateBtn.classList.add('loading');
  }
  if (elements.resultPlaceholder) {
    elements.resultPlaceholder.innerHTML = '<span>⏳</span><p>Generating...</p>';
  }
  
  showToast(`Generating selfie with ${template.celebrity}...`, 'info');
  
  try {
    // Generate selfie using Gemini API
    const generatedSelfie = await Processor.generateSelfiePull(pendingUserImage, template);
    
    // Update store with generated image
    Store.setUserImage(generatedSelfie);
    
    // Hide preview, show editor with result
    elements.previewSection?.classList.add('hidden');
    elements.editorSection?.classList.remove('hidden');
    
    showToast(`Selfie with ${template.celebrity} created!`, 'success');
    
    // Clear pending image
    pendingUserImage = null;
  } catch (error) {
    console.error('Error generating selfie:', error);
    showToast('Failed to generate selfie: ' + error.message, 'error');
    
    // Reset button
    if (elements.generateBtn) {
      elements.generateBtn.disabled = false;
    }
    if (elements.resultPlaceholder) {
      elements.resultPlaceholder.innerHTML = '<span>❌</span><p>Failed. Try again!</p>';
    }
  } finally {
    Store.setProcessing(false);
    if (elements.generateBtn) {
      elements.generateBtn.classList.remove('loading');
    }
  }
}

/**
 * Read file as data URL
 */
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Handle camera button click
 */
async function handleCameraClick(e) {
  e.stopPropagation();
  
  // Check for camera support
  if (!navigator.mediaDevices?.getUserMedia) {
    showToast('Camera not supported on this device', 'error');
    return;
  }
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'user' } 
    });
    
    showCameraModal(stream);
  } catch (error) {
    console.error('Camera error:', error);
    if (error.name === 'NotAllowedError') {
      showToast('Camera permission denied', 'error');
    } else {
      showToast('Could not access camera', 'error');
    }
  }
}

/**
 * Show camera modal
 */
function showCameraModal(stream) {
  const modal = document.createElement('div');
  modal.className = 'camera-modal';
  modal.innerHTML = `
    <video autoplay playsinline></video>
    <div class="camera-controls">
      <button class="action-btn capture-btn">📸 Capture</button>
      <button class="action-btn cancel-btn">✕ Cancel</button>
    </div>
  `;
  
  const video = modal.querySelector('video');
  video.srcObject = stream;
  
  // Capture button
  modal.querySelector('.capture-btn').addEventListener('click', () => {
    captureFrame(video);
    closeCamera(modal, stream);
  });
  
  // Cancel button
  modal.querySelector('.cancel-btn').addEventListener('click', () => {
    closeCamera(modal, stream);
  });
  
  // Close on escape
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closeCamera(modal, stream);
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
  
  document.body.appendChild(modal);
}

/**
 * Capture frame from video and generate selfie
 */
async function captureFrame(video) {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0);
  
  const userImageData = canvas.toDataURL('image/png');
  
  // Check if template is selected
  const template = Store.getSelectedTemplate();
  if (!template) {
    // Just store the captured image if no template selected
    Store.setUserImage(userImageData);
    showToast('Photo captured! Select a celebrity template to generate selfie.', 'info');
    return;
  }
  
  // Generate selfie with selected template
  Store.setProcessing(true);
  showToast(`Generating selfie with ${template.celebrity}...`, 'info');
  
  try {
    const generatedSelfie = await Processor.generateSelfiePull(userImageData, template);
    Store.setUserImage(generatedSelfie);
    showToast(`Selfie with ${template.celebrity} created!`, 'success');
  } catch (error) {
    console.error('Error generating selfie:', error);
    showToast('Failed to generate selfie', 'error');
    Store.setUserImage(userImageData);
  } finally {
    Store.setProcessing(false);
  }
}

/**
 * Close camera modal and stop stream
 */
function closeCamera(modal, stream) {
  stream.getTracks().forEach(track => track.stop());
  modal.remove();
}

/**
 * Handle download
 */
async function handleDownload() {
  if (!Canvas.isReadyForExport()) {
    showToast('Please select a template and upload an image first', 'error');
    return;
  }
  
  try {
    const dataUrl = Canvas.exportAsDataURL('image/png');
    const template = Store.getSelectedTemplate();
    const filename = `selfie-${template?.name?.toLowerCase().replace(/\s+/g, '-') || 'celebrity'}-${Date.now()}.png`;
    
    // Create download link
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.click();
    
    // Save to history
    await saveToHistory(dataUrl);
    
    showToast('Image downloaded!', 'success');
  } catch (error) {
    console.error('Download error:', error);
    showToast('Failed to download image', 'error');
  }
}

/**
 * Handle share
 */
async function handleShare() {
  if (!Canvas.isReadyForExport()) {
    showToast('Please select a template and upload an image first', 'error');
    return;
  }
  
  try {
    const blob = await Canvas.exportAsBlob('image/png');
    
    // Try Web Share API
    if (navigator.share && navigator.canShare) {
      const file = new File([blob], 'selfie.png', { type: 'image/png' });
      const shareData = { files: [file] };
      
      if (navigator.canShare(shareData)) {
        await navigator.share(shareData);
        await saveToHistory(Canvas.exportAsDataURL());
        showToast('Shared successfully!', 'success');
        return;
      }
    }
    
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      await saveToHistory(Canvas.exportAsDataURL());
      showToast('Image copied to clipboard!', 'success');
    } catch {
      // Final fallback: download
      handleDownload();
    }
  } catch (error) {
    console.error('Share error:', error);
    showToast('Failed to share image', 'error');
  }
}

/**
 * Handle reset
 */
function handleReset() {
  Store.resetState();
  renderControls();
  
  // Reset preview section
  pendingUserImage = null;
  elements.previewSection?.classList.add('hidden');
  elements.editorSection?.classList.add('hidden');
  
  // Reset file input
  if (elements.fileInput) {
    elements.fileInput.value = '';
  }
  
  showToast('Reset complete', 'success');
}

/**
 * Save to history
 */
async function saveToHistory(finalImage) {
  const template = Store.getSelectedTemplate();
  const userImage = Store.getUserImage();
  const editParams = Store.getEditParams();
  
  try {
    await DB.saveImage({
      templateId: template?.id,
      originalImage: userImage,
      editParams,
      finalImage
    });
    
    // Refresh history UI
    loadHistory();
  } catch (error) {
    console.error('Failed to save to history:', error);
  }
}

/**
 * Load history from IndexedDB
 */
async function loadHistory() {
  try {
    const images = await DB.getImages();
    renderHistory(images);
  } catch (error) {
    console.error('Failed to load history:', error);
  }
}

/**
 * Render history grid
 */
function renderHistory(images) {
  const grid = elements.historyGrid;
  if (!grid) return;
  
  if (images.length === 0) {
    grid.innerHTML = '<p style="color: var(--color-text-muted)">No recent creations</p>';
    return;
  }
  
  grid.innerHTML = images.map(img => `
    <div class="history-item" data-id="${img.id}" tabindex="0" role="button">
      <img src="${img.finalImage}" alt="Created ${new Date(img.timestamp).toLocaleDateString()}">
    </div>
  `).join('');
  
  // Add click listeners
  grid.querySelectorAll('.history-item').forEach(item => {
    item.addEventListener('click', () => handleHistoryItemClick(item.dataset.id));
  });
}

/**
 * Handle history item click
 */
async function handleHistoryItemClick(id) {
  try {
    const image = await DB.getImage(id);
    if (image?.finalImage) {
      // Download the image
      const link = document.createElement('a');
      link.href = image.finalImage;
      link.download = `selfie-${id}.png`;
      link.click();
    }
  } catch (error) {
    console.error('Failed to load history item:', error);
  }
}

/**
 * Toggle history panel
 */
function toggleHistoryPanel() {
  const panel = elements.historyPanel;
  if (panel) {
    panel.hidden = !panel.hidden;
  }
}

/**
 * Open API Key Modal
 */
function openApiKeyModal() {
  if (elements.apiKeyModal) {
    elements.apiKeyModal.classList.remove('hidden');
    elements.apiKeyInput?.focus();
    
    // Show current status
    updateApiStatus();
  }
}

/**
 * Close API Key Modal
 */
function closeApiKeyModal() {
  if (elements.apiKeyModal) {
    elements.apiKeyModal.classList.add('hidden');
    if (elements.apiKeyInput) {
      elements.apiKeyInput.value = '';
    }
  }
}

/**
 * Handle modal backdrop click
 */
function handleModalBackdropClick(e) {
  if (e.target === elements.apiKeyModal) {
    closeApiKeyModal();
  }
}

/**
 * Save API Key
 */
function saveApiKey() {
  const key = elements.apiKeyInput?.value?.trim();
  
  if (!key) {
    showApiStatus('Please enter an API key', 'error');
    return;
  }
  
  // Save to Processor
  Processor.setApiKey(key);
  
  // Also save to localStorage for persistence
  try {
    localStorage.setItem('gemini_nano_banana_api_key', key);
  } catch (e) {
    console.warn('Could not save API key to localStorage:', e);
  }
  
  // Update button state
  updateApiKeyButtonState();
  
  showApiStatus('API key saved successfully!', 'success');
  showToast('API key configured!', 'success');
  
  // Close modal after delay
  setTimeout(() => {
    closeApiKeyModal();
  }, 1500);
}

/**
 * Update API status message
 */
function updateApiStatus() {
  if (Processor.isApiConfigured()) {
    showApiStatus('✅ API key is configured', 'success');
  } else {
    showApiStatus('No API key configured', '');
  }
}

/**
 * Show API status message
 */
function showApiStatus(message, type) {
  if (elements.apiStatus) {
    elements.apiStatus.textContent = message;
    elements.apiStatus.className = `api-status ${type}`;
  }
}

/**
 * Update API key button state
 */
function updateApiKeyButtonState() {
  if (elements.apiKeyBtn) {
    if (Processor.isApiConfigured()) {
      elements.apiKeyBtn.classList.add('configured');
      elements.apiKeyBtn.title = 'API Key Configured';
    } else {
      elements.apiKeyBtn.classList.remove('configured');
      elements.apiKeyBtn.title = 'Configure API Key';
    }
  }
}

/**
 * Load saved API key from localStorage
 */
function loadSavedApiKey() {
  try {
    const savedKey = localStorage.getItem('gemini_nano_banana_api_key');
    if (savedKey) {
      Processor.setApiKey(savedKey);
      updateApiKeyButtonState();
      console.log('Loaded saved API key');
    }
  } catch (e) {
    console.warn('Could not load saved API key:', e);
  }
}

/**
 * Update action buttons state
 */
function updateActionButtons() {
  const isReady = Canvas.isReadyForExport();
  
  if (elements.downloadBtn) elements.downloadBtn.disabled = !isReady;
  if (elements.shareBtn) elements.shareBtn.disabled = !isReady;
  if (elements.resetBtn) elements.resetBtn.disabled = !Store.getSelectedTemplate() && !Store.getUserImage();
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
  // Remove existing toasts
  document.querySelectorAll('.toast').forEach(t => t.remove());
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toast.setAttribute('role', 'alert');
  
  document.body.appendChild(toast);
  
  // Auto-remove after 3 seconds
  setTimeout(() => toast.remove(), 3000);
}

// ============================================
// Custom Template Modal Functions
// ============================================

// Pending custom template image data
let pendingTemplateImage = null;

/**
 * Open custom template modal
 */
function openCustomTemplateModal() {
  elements.customTemplateModal?.classList.remove('hidden');
  elements.templateNameInput?.focus();
  resetCustomTemplateForm();
}

/**
 * Close custom template modal
 */
function closeCustomTemplateModal() {
  elements.customTemplateModal?.classList.add('hidden');
  resetCustomTemplateForm();
}

/**
 * Reset custom template form
 */
function resetCustomTemplateForm() {
  if (elements.templateNameInput) elements.templateNameInput.value = '';
  if (elements.celebrityNameInput) elements.celebrityNameInput.value = '';
  if (elements.templateImageInput) elements.templateImageInput.value = '';
  if (elements.saveTemplateBtn) elements.saveTemplateBtn.disabled = true;
  pendingTemplateImage = null;
  
  // Reset preview
  if (elements.templatePreviewContainer) {
    elements.templatePreviewContainer.innerHTML = `
      <span class="upload-icon">📷</span>
      <p>Click or drag to upload template image</p>
    `;
  }
}

/**
 * Handle template image file select
 */
function handleTemplateImageSelect(e) {
  const file = e.target.files?.[0];
  if (file) processTemplateImage(file);
}

/**
 * Handle template drag over
 */
function handleTemplateDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  elements.templateUploadZone?.classList.add('dragover');
}

/**
 * Handle template drag leave
 */
function handleTemplateDragLeave(e) {
  e.preventDefault();
  e.stopPropagation();
  elements.templateUploadZone?.classList.remove('dragover');
}

/**
 * Handle template drop
 */
function handleTemplateDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  elements.templateUploadZone?.classList.remove('dragover');
  
  const file = e.dataTransfer?.files?.[0];
  if (file) processTemplateImage(file);
}

/**
 * Process template image file
 */
async function processTemplateImage(file) {
  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    showToast('Please upload a JPG, PNG, or WebP image', 'error');
    return;
  }
  
  // Validate file size (10MB max for templates)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    showToast('Image must be less than 10MB', 'error');
    return;
  }
  
  try {
    const imageData = await readFileAsDataURL(file);
    pendingTemplateImage = imageData;
    
    // Show preview
    if (elements.templatePreviewContainer) {
      elements.templatePreviewContainer.innerHTML = `
        <img src="${imageData}" alt="Template preview" class="template-image-preview">
        <p class="preview-label">✓ Image ready</p>
      `;
    }
    
    validateCustomTemplateForm();
  } catch (error) {
    console.error('Error loading template image:', error);
    showToast('Failed to load image', 'error');
  }
}

/**
 * Validate custom template form
 */
function validateCustomTemplateForm() {
  const name = elements.templateNameInput?.value?.trim();
  const celebrity = elements.celebrityNameInput?.value?.trim();
  const hasImage = !!pendingTemplateImage;
  
  const isValid = name && celebrity && hasImage;
  
  if (elements.saveTemplateBtn) {
    elements.saveTemplateBtn.disabled = !isValid;
  }
}

/**
 * Save custom template
 */
function saveCustomTemplate() {
  const name = elements.templateNameInput?.value?.trim();
  const celebrity = elements.celebrityNameInput?.value?.trim();
  
  if (!name || !celebrity || !pendingTemplateImage) {
    showToast('Please fill all fields and upload an image', 'error');
    return;
  }
  
  const template = {
    name: name,
    celebrity: celebrity,
    scene: 'custom',
    description: `Custom selfie with ${celebrity}`,
    prompt: `Create an ultra-realistic image showing the person uploaded taking a selfie with ${celebrity}`,
    templateImage: pendingTemplateImage
  };
  
  Store.addCustomTemplate(template);
  showToast(`Template "${name}" saved!`, 'success');
  closeCustomTemplateModal();
}

/**
 * Handle delete custom template
 */
function handleDeleteCustomTemplate(templateId) {
  if (confirm('Are you sure you want to delete this custom template?')) {
    Store.removeCustomTemplate(templateId);
    showToast('Template deleted', 'success');
  }
}

// Export UI API
export const UI = {
  init,
  showToast,
  loadHistory
};
