/**
 * Store Module - State Management
 * 
 * Manages application state including:
 * - Current template selection (celebrity + scene)
 * - User uploaded image (face photo)
 * - Edit parameters (position, scale, rotation, opacity)
 * - History reference
 */

// Template data - Pre-made celebrity selfie scenes
// Each template has a preview image that shows the style/scene
// When generating, we send both the template image and user's face to NanoBanana API
const TEMPLATES = [
  { 
    id: 'scene-1', 
    name: 'Beach Day with SRK', 
    celebrity: 'Shah Rukh Khan',
    scene: 'beach',
    description: 'Beach selfie with King Khan',
    prompt: 'Create an ultra-realistic image showing the person uploaded taking a selfie with Shah Rukh Khan on a tropical beach, sunny day, ocean in background',
    templateImage: 'assets/templates/template -SRK -beach.png',
    trendingScore: 98, 
    trendingRank: 1 
  },
  { 
    id: 'scene-2', 
    name: 'Selfie with Virat Kohli', 
    celebrity: 'Virat Kohli',
    scene: 'outdoor',
    description: 'Selfie with cricket legend Virat Kohli',
    prompt: 'Create an ultra-realistic image showing the person uploaded taking a selfie with Virat Kohli, cricket star, dynamic sports atmosphere',
    templateImage: 'assets/templates/Template -Virat Kohli.png',
    trendingScore: 97, 
    trendingRank: 2 
  },
  { 
    id: 'scene-3', 
    name: 'Beach Walk with Emma Stone', 
    celebrity: 'Emma Stone',
    scene: 'beach',
    description: 'Beach selfie with Emma Stone',
    prompt: 'Create an ultra-realistic image showing the person uploaded taking a selfie with Emma Stone on a beautiful beach, sunset lighting, casual vacation vibe',
    templateImage: 'assets/templates/template-emma-stone-beach.png',
    trendingScore: 95, 
    trendingRank: 3 
  }
];

// Default edit parameters
const DEFAULT_EDIT_PARAMS = {
  posX: 0,
  posY: 0,
  scale: 100,
  rotation: 0,
  opacity: 100
};

// localStorage key for custom templates
const CUSTOM_TEMPLATES_KEY = 'selfie-pullai-custom-templates';

/**
 * Load custom templates from localStorage
 */
function loadCustomTemplates() {
  try {
    const stored = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load custom templates:', error);
  }
  return [];
}

/**
 * Save custom templates to localStorage
 */
function saveCustomTemplates(customTemplates) {
  try {
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(customTemplates));
  } catch (error) {
    console.error('Failed to save custom templates:', error);
  }
}

// Application state
let state = {
  templates: [...TEMPLATES, ...loadCustomTemplates()],
  customTemplates: loadCustomTemplates(),
  selectedTemplate: null,
  userImage: null,
  editParams: { ...DEFAULT_EDIT_PARAMS },
  history: [],
  isProcessing: false
};

// Subscribers for state changes
const subscribers = new Set();

/**
 * Get current state (immutable copy)
 */
function getState() {
  return { ...state };
}

/**
 * Get all templates
 */
function getTemplates() {
  return [...state.templates];
}

/**
 * Get selected template
 */
function getSelectedTemplate() {
  return state.selectedTemplate;
}

/**
 * Set selected template by ID
 */
function setSelectedTemplate(templateId) {
  const template = state.templates.find(t => t.id === templateId);
  if (template) {
    state.selectedTemplate = template;
    notifySubscribers('templateSelected', template);
  }
}

/**
 * Get user image
 */
function getUserImage() {
  return state.userImage;
}

/**
 * Set user image (base64 or blob URL)
 */
function setUserImage(imageData) {
  state.userImage = imageData;
  state.editParams = { ...DEFAULT_EDIT_PARAMS };
  notifySubscribers('userImageChanged', imageData);
}

/**
 * Get edit parameters
 */
function getEditParams() {
  return { ...state.editParams };
}

/**
 * Update edit parameters
 */
function updateEditParams(params) {
  state.editParams = { ...state.editParams, ...params };
  notifySubscribers('editParamsChanged', state.editParams);
}

/**
 * Reset edit parameters to default
 */
function resetEditParams() {
  state.editParams = { ...DEFAULT_EDIT_PARAMS };
  notifySubscribers('editParamsChanged', state.editParams);
}

/**
 * Reset entire state
 */
function resetState() {
  state.selectedTemplate = null;
  state.userImage = null;
  state.editParams = { ...DEFAULT_EDIT_PARAMS };
  state.isProcessing = false;
  notifySubscribers('stateReset', null);
}

/**
 * Set processing state
 */
function setProcessing(isProcessing) {
  state.isProcessing = isProcessing;
  notifySubscribers('processingChanged', isProcessing);
}

/**
 * Add a custom template
 */
function addCustomTemplate(template) {
  const customTemplate = {
    ...template,
    id: `custom-${Date.now()}`,
    isCustom: true,
    trendingScore: 0,
    trendingRank: 999
  };
  
  state.customTemplates.push(customTemplate);
  state.templates = [...TEMPLATES, ...state.customTemplates];
  saveCustomTemplates(state.customTemplates);
  notifySubscribers('customTemplateAdded', customTemplate);
  
  return customTemplate;
}

/**
 * Remove a custom template
 */
function removeCustomTemplate(templateId) {
  const index = state.customTemplates.findIndex(t => t.id === templateId);
  if (index !== -1) {
    const removed = state.customTemplates.splice(index, 1)[0];
    state.templates = [...TEMPLATES, ...state.customTemplates];
    saveCustomTemplates(state.customTemplates);
    
    // Clear selection if removed template was selected
    if (state.selectedTemplate?.id === templateId) {
      state.selectedTemplate = null;
    }
    
    notifySubscribers('customTemplateRemoved', removed);
    return true;
  }
  return false;
}

/**
 * Get custom templates only
 */
function getCustomTemplates() {
  return [...state.customTemplates];
}

/**
 * Subscribe to state changes
 */
function subscribe(callback) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

/**
 * Notify all subscribers of state change
 */
function notifySubscribers(event, data) {
  subscribers.forEach(callback => {
    try {
      callback(event, data, getState());
    } catch (error) {
      console.error('Subscriber error:', error);
    }
  });
}

// Export store API
export const Store = {
  getState,
  getTemplates,
  getSelectedTemplate,
  setSelectedTemplate,
  getUserImage,
  setUserImage,
  getEditParams,
  updateEditParams,
  resetEditParams,
  resetState,
  setProcessing,
  subscribe,
  addCustomTemplate,
  removeCustomTemplate,
  getCustomTemplates,
  DEFAULT_EDIT_PARAMS
};
