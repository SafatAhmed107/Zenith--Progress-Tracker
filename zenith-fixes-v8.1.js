/**
 * Zenith V8.1 - Critical Bug Fixes
 * This file contains all the missing utility functions and fixes
 * for the V8 beta version
 */

// ══════════════════════════════════════════════════════════════
// CRITICAL FIX #1: Missing Utility Functions
// ══════════════════════════════════════════════════════════════

/**
 * Format date to YYYY-MM-DD
 * @param {Date} date 
 * @returns {string}
 */
function fmtDate(date) {
  if (!date || !(date instanceof Date) || isNaN(date)) {
    console.error('Invalid date passed to fmtDate:', date);
    return new Date().toISOString().split('T')[0];
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse YYYY-MM-DD string to Date object
 * @param {string} dateStr 
 * @returns {Date}
 */
function parseDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') {
    console.error('Invalid date string passed to parseDate:', dateStr);
    return new Date();
  }
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) {
    console.error('Invalid date format:', dateStr);
    return new Date();
  }
  return new Date(year, month - 1, day);
}

/**
 * Generate unique ID
 * @returns {string}
 */
function genId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Capitalize first letter
 * @param {string} s 
 * @returns {string}
 */
function capFirst(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

/**
 * Clamp value between min and max
 * @param {number} v 
 * @param {number} min 
 * @param {number} max 
 * @returns {number}
 */
function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max);
}

/**
 * Safe parseInt with fallback
 * @param {*} val 
 * @param {number} fallback 
 * @returns {number}
 */
function safeParseInt(val, fallback = 0) {
  const parsed = parseInt(val);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Sanitize HTML to prevent XSS
 * @param {string} str 
 * @returns {string}
 */
function sanitizeHTML(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Escape HTML attributes
 * @param {string} str 
 * @returns {string}
 */
function escapeAttr(str) {
  if (!str) return '';
  return String(str)
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Safe JSON parse with fallback
 * @param {string} key 
 * @param {*} fallback 
 * @returns {*}
 */
function safeJSONParse(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch (e) {
    console.error(`Failed to parse localStorage key "${key}":`, e);
    return fallback;
  }
}

// ══════════════════════════════════════════════════════════════
// CRITICAL FIX #2: Toast Notification System
// ══════════════════════════════════════════════════════════════

let toastContainer = null;

/**
 * Initialize toast container
 */
function initToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
}

/**
 * Show toast notification
 * @param {string} message 
 * @param {string} type - 'success', 'error', 'info', 'warning'
 * @param {number} duration - milliseconds
 */
function showToast(message, type = 'info', duration = 3000) {
  initToastContainer();
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠'
  };
  
  toast.innerHTML = `
    <span style="font-size: 18px;">${icons[type] || icons.info}</span>
    <span style="flex: 1;">${sanitizeHTML(message)}</span>
  `;
  
  toastContainer.appendChild(toast);
  
  // Auto remove
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, duration);
}

// ══════════════════════════════════════════════════════════════
// CRITICAL FIX #3: Modal System
// ══════════════════════════════════════════════════════════════

/**
 * Open modal by ID
 * @param {string} modalId 
 */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) {
    console.error(`Modal not found: ${modalId}`);
    return;
  }
  modal.classList.add('open');
  
  // Focus trap
  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (focusableElements.length > 0) {
    focusableElements[0].focus();
  }
  
  // Prevent body scroll
  document.body.style.overflow = 'hidden';
}

/**
 * Close modal by ID
 * @param {string} modalId 
 */
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) {
    console.error(`Modal not found: ${modalId}`);
    return;
  }
  modal.classList.remove('open');
  
  // Restore body scroll
  document.body.style.overflow = '';
}

/**
 * Close modal on overlay click
 * @param {Event} e 
 * @param {string} modalId 
 */
function closeModalOnOverlay(e, modalId) {
  if (e.target.classList.contains('modal-overlay')) {
    closeModal(modalId);
  }
}

// ══════════════════════════════════════════════════════════════
// CRITICAL FIX #4: Sound System (Tactile Feedback)
// ══════════════════════════════════════════════════════════════

const sounds = {
  click: { frequency: 800, duration: 50 },
  complete: { frequency: 1200, duration: 100 },
  error: { frequency: 400, duration: 150 },
  thud: { frequency: 200, duration: 200 }
};

/**
 * Play tactile sound using Web Audio API
 * @param {string} soundType 
 */
function playTactileSound(soundType) {
  if (!sounds[soundType]) return;
  
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = sounds[soundType].frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + sounds[soundType].duration / 1000
    );
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + sounds[soundType].duration / 1000);
  } catch (e) {
    console.warn('Audio playback failed:', e);
  }
}

// ══════════════════════════════════════════════════════════════
// CRITICAL FIX #5: Error Handling Wrapper
// ══════════════════════════════════════════════════════════════

/**
 * Wrap function with error handling
 * @param {Function} fn 
 * @param {string} fnName 
 * @returns {Function}
 */
function withErrorHandling(fn, fnName) {
  return function(...args) {
    try {
      return fn.apply(this, args);
    } catch (error) {
      console.error(`Error in ${fnName}:`, error);
      showToast(`Something went wrong in ${fnName}. Check console for details.`, 'error');
      return null;
    }
  };
}

// ══════════════════════════════════════════════════════════════
// CRITICAL FIX #6: LocalStorage Quota Handler
// ══════════════════════════════════════════════════════════════

/**
 * Safe localStorage setItem with quota handling
 * @param {string} key 
 * @param {string} value 
 * @returns {boolean} success
 */
function safeLocalStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      console.error('LocalStorage quota exceeded');
      showToast('Storage full! Please export your data and clear old entries.', 'error', 5000);
      
      // Try to free up space by removing old data
      const keys = Object.keys(localStorage);
      const oldKeys = keys.filter(k => k.startsWith('z3_old_') || k.startsWith('z3_backup_'));
      oldKeys.forEach(k => localStorage.removeItem(k));
      
      // Retry once
      try {
        localStorage.setItem(key, value);
        showToast('Freed up space and saved successfully', 'success');
        return true;
      } catch (e2) {
        console.error('Still failed after cleanup:', e2);
        return false;
      }
    } else {
      console.error('LocalStorage error:', e);
      showToast('Failed to save data', 'error');
      return false;
    }
  }
}

// ══════════════════════════════════════════════════════════════
// CRITICAL FIX #7: DOM Ready Helper
// ══════════════════════════════════════════════════════════════

/**
 * Execute function when DOM is ready
 * @param {Function} fn 
 */
function onDOMReady(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    fn();
  }
}

// ══════════════════════════════════════════════════════════════
// CRITICAL FIX #8: Debounce Helper
// ══════════════════════════════════════════════════════════════

/**
 * Debounce function calls
 * @param {Function} func 
 * @param {number} wait 
 * @returns {Function}
 */
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

// ══════════════════════════════════════════════════════════════
// CRITICAL FIX #9: Constants (No More Magic Numbers)
// ══════════════════════════════════════════════════════════════

const CONSTANTS = {
  // Defer thresholds
  MAX_DEFER_COUNT: 3,
  DEFER_WARNING_COUNT: 2,
  
  // Particle counts
  PARTICLES_FAST: 0,
  PARTICLES_DEFAULT: 30,
  PARTICLES_STUNNING: 80,
  
  // Ritual stars
  RITUAL_STARS_FAST: 0,
  RITUAL_STARS_DEFAULT: 40,
  RITUAL_STARS_STUNNING: 80,
  
  // Time
  SAVE_DEBOUNCE_MS: 250,
  TOAST_DURATION_MS: 3000,
  TOAST_DURATION_LONG_MS: 5000,
  
  // Capacity
  DEFAULT_DAILY_CAPACITY_HOURS: 8,
  CAPACITY_WARNING_PERCENT: 75,
  CAPACITY_DANGER_PERCENT: 90,
  
  // Focus score
  SCORE_PER_COMPLETED_TASK: 10,
  SCORE_PER_POMODORO: 15,
  SCORE_PENALTY_PER_DEFER: 5,
  
  // Quick win threshold
  QUICK_WIN_MINUTES: 5,
  
  // Storage keys
  STORAGE_PREFIX: 'z3_',
  
  // Animation
  CONFETTI_COUNT: 70,
  CONFETTI_DURATION_MS: 2000
};

// ══════════════════════════════════════════════════════════════
// CRITICAL FIX #10: Cleanup on Page Unload
// ══════════════════════════════════════════════════════════════

/**
 * Cleanup function to prevent memory leaks
 */
function cleanup() {
  // Cancel animation frames
  if (typeof pAnimId !== 'undefined') {
    cancelAnimationFrame(pAnimId);
  }
  
  // Clear timers
  if (typeof saveTimer !== 'undefined') {
    clearTimeout(saveTimer);
  }
  
  // Remove event listeners
  window.removeEventListener('resize', resizeCanvas);
  window.removeEventListener('beforeunload', cleanup);
  
  console.log('Zenith cleanup completed');
}

// Register cleanup
window.addEventListener('beforeunload', cleanup);

// ══════════════════════════════════════════════════════════════
// CRITICAL FIX #11: Missing editGoalFromDetail Function
// ══════════════════════════════════════════════════════════════

/**
 * Edit goal from detail view
 */
function editGoalFromDetail() {
  if (typeof currentDetailGoalId !== 'undefined' && currentDetailGoalId) {
    closeModal('goalDetailModal');
    setTimeout(() => {
      editGoal(currentDetailGoalId);
    }, 300);
  } else {
    showToast('No goal selected', 'error');
  }
}

// ══════════════════════════════════════════════════════════════
// CRITICAL FIX #12: Safe Canvas Initialization
// ══════════════════════════════════════════════════════════════

/**
 * Initialize canvas safely with existence checks
 */
function safeInitParticles() {
  onDOMReady(() => {
    const canvasEl = document.getElementById('bgCanvas');
    if (!canvasEl) {
      console.warn('Canvas element not found, skipping particle initialization');
      return;
    }
    
    // Wait a bit more to ensure everything is loaded
    setTimeout(() => {
      if (typeof initParticles === 'function') {
        initParticles();
      }
    }, 100);
  });
}

// ══════════════════════════════════════════════════════════════
// CRITICAL FIX #13: Data Validation
// ══════════════════════════════════════════════════════════════

/**
 * Validate task object
 * @param {Object} task 
 * @returns {boolean}
 */
function validateTask(task) {
  if (!task || typeof task !== 'object') return false;
  if (!task.id || !task.title) return false;
  if (!task.date || !task.priority) return false;
  return true;
}

/**
 * Validate goal object
 * @param {Object} goal 
 * @returns {boolean}
 */
function validateGoal(goal) {
  if (!goal || typeof goal !== 'object') return false;
  if (!goal.id || !goal.title) return false;
  if (!goal.nodeType) return false;
  return true;
}

/**
 * Sanitize task before saving
 * @param {Object} task 
 * @returns {Object}
 */
function sanitizeTask(task) {
  return {
    ...task,
    title: sanitizeHTML(task.title || ''),
    description: sanitizeHTML(task.description || ''),
    notes: sanitizeHTML(task.notes || '')
  };
}

// ══════════════════════════════════════════════════════════════
// CRITICAL FIX #14: Keyboard Shortcuts
// ══════════════════════════════════════════════════════════════

/**
 * Initialize keyboard shortcuts
 */
function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + N: New task
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      if (typeof openAddTask === 'function') {
        openAddTask();
      }
    }
    
    // Escape: Close modals
    if (e.key === 'Escape') {
      const openModals = document.querySelectorAll('.modal-overlay.open');
      openModals.forEach(modal => {
        if (modal.id) {
          closeModal(modal.id);
        }
      });
    }
    
    // Ctrl/Cmd + 1-5: Switch views
    if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '5') {
      e.preventDefault();
      const views = ['tasks', 'goals', 'habits', 'pomodoro', 'analytics'];
      const index = parseInt(e.key) - 1;
      if (views[index] && typeof switchView === 'function') {
        switchView(views[index]);
      }
    }
  });
}

// Initialize on load
onDOMReady(initKeyboardShortcuts);

// ══════════════════════════════════════════════════════════════
// CRITICAL FIX #15: Export/Import Functions
// ══════════════════════════════════════════════════════════════

/**
 * Export all data as JSON
 * @returns {string}
 */
function exportData() {
  try {
    const data = {
      version: '8.1',
      exportDate: new Date().toISOString(),
      tasks: safeJSONParse('z3_tasks', []),
      goals: safeJSONParse('z3_goals', []),
      habits: safeJSONParse('z3_habits', []),
      habitLogs: safeJSONParse('z3_hlogs', {}),
      reviews: safeJSONParse('z3_reviews', []),
      inbox: safeJSONParse('z3_inbox', []),
      settings: {
        theme: localStorage.getItem('z3_app_theme'),
        mode: localStorage.getItem('z3_app_mode'),
        quality: localStorage.getItem('z3_quality'),
        capacity: localStorage.getItem('z3_capacity')
      }
    };
    
    return JSON.stringify(data, null, 2);
  } catch (e) {
    console.error('Export failed:', e);
    showToast('Failed to export data', 'error');
    return null;
  }
}

/**
 * Download data as JSON file
 */
function downloadData() {
  const data = exportData();
  if (!data) return;
  
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `zenith-backup-${fmtDate(new Date())}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showToast('Data exported successfully!', 'success');
}

/**
 * Import data from JSON
 * @param {string} jsonData 
 * @returns {boolean}
 */
function importData(jsonData) {
  try {
    const data = JSON.parse(jsonData);
    
    if (!data.version || !data.tasks) {
      throw new Error('Invalid data format');
    }
    
    // Backup current data
    const backup = exportData();
    if (backup) {
      safeLocalStorageSet(`z3_backup_${Date.now()}`, backup);
    }
    
    // Import new data
    if (data.tasks) safeLocalStorageSet('z3_tasks', JSON.stringify(data.tasks));
    if (data.goals) safeLocalStorageSet('z3_goals', JSON.stringify(data.goals));
    if (data.habits) safeLocalStorageSet('z3_habits', JSON.stringify(data.habits));
    if (data.habitLogs) safeLocalStorageSet('z3_hlogs', JSON.stringify(data.habitLogs));
    if (data.reviews) safeLocalStorageSet('z3_reviews', JSON.stringify(data.reviews));
    if (data.inbox) safeLocalStorageSet('z3_inbox', JSON.stringify(data.inbox));
    
    showToast('Data imported successfully! Reloading...', 'success');
    setTimeout(() => location.reload(), 1500);
    
    return true;
  } catch (e) {
    console.error('Import failed:', e);
    showToast('Failed to import data. Check file format.', 'error');
    return false;
  }
}

// ══════════════════════════════════════════════════════════════
// EXPORT ALL FIXES
// ══════════════════════════════════════════════════════════════

console.log('✅ Zenith V8.1 Critical Fixes Loaded');
console.log('📦 Available utilities:', {
  dateUtils: ['fmtDate', 'parseDate'],
  idUtils: ['genId'],
  stringUtils: ['capFirst', 'sanitizeHTML', 'escapeAttr'],
  storageUtils: ['safeJSONParse', 'safeLocalStorageSet'],
  uiUtils: ['showToast', 'openModal', 'closeModal'],
  soundUtils: ['playTactileSound'],
  dataUtils: ['exportData', 'downloadData', 'importData'],
  validationUtils: ['validateTask', 'validateGoal', 'sanitizeTask']
});
