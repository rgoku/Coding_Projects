/**
 * Integration Example for Solar Education Features Modules
 * 
 * This file demonstrates how to integrate the modular features
 * into your main application.
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { 
  openSiteBuilder, 
  closeSiteBuilder, 
  resetSiteBuilder, 
  sbSelect, 
  sbUpdateUI,
  getConfigNumber 
} from './siteBuilder.js';

import { 
  changePanelStyle, 
  closePanelStyleTooltip, 
  rebuildSolarFarm 
} from './panelStyles.js';

import { 
  validSites, 
  sbState, 
  siteLabels 
} from '../data/siteConfigs.js';

// ============================================================================
// EXPOSE TO GLOBAL SCOPE (if needed for inline event handlers)
// ============================================================================

// Option 1: Expose individual functions
window.openSiteBuilder = openSiteBuilder;
window.closeSiteBuilder = closeSiteBuilder;
window.resetSiteBuilder = resetSiteBuilder;
window.sbSelect = sbSelect;
window.sbUpdateUI = sbUpdateUI;
window.changePanelStyle = changePanelStyle;
window.closePanelStyleTooltip = closePanelStyleTooltip;

// Option 2: Expose as namespaced object
window.SolarFeatures = {
  siteBuilder: {
    open: openSiteBuilder,
    close: closeSiteBuilder,
    reset: resetSiteBuilder,
    select: sbSelect,
    updateUI: sbUpdateUI,
    getConfigNumber: getConfigNumber
  },
  panelStyles: {
    change: changePanelStyle,
    closeTooltip: closePanelStyleTooltip,
    rebuild: rebuildSolarFarm
  },
  data: {
    validSites,
    sbState,
    siteLabels
  }
};

// ============================================================================
// SETUP FUNCTIONS
// ============================================================================

/**
 * Initialize site builder event listeners
 */
export function setupSiteBuilder() {
  // Open button
  const openBtn = document.getElementById('buildSiteBtn');
  if (openBtn) {
    openBtn.addEventListener('click', openSiteBuilder);
  }

  // Close button
  const closeBtn = document.getElementById('closeSiteBuilder');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeSiteBuilder);
  }

  // Reset button
  const resetBtn = document.getElementById('resetSiteBuilder');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetSiteBuilder);
  }

  // Option selection buttons
  document.querySelectorAll('.sb-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      const field = btn.closest('.sb-opts')?.dataset.field;
      const value = btn.dataset.value;
      if (field && value) {
        sbSelect(field, value, btn);
      }
    });
  });

  // View configuration button
  const viewBtn = document.getElementById('sbViewBtn');
  if (viewBtn) {
    viewBtn.addEventListener('click', () => {
      console.log('Selected configuration:', sbState);
      closeSiteBuilder();
      applyConfiguration(sbState);
    });
  }

  // Close modal when clicking outside
  const modal = document.getElementById('siteBuilderModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeSiteBuilder();
      }
    });
  }
}

/**
 * Initialize panel style event listeners
 */
export function setupPanelStyles() {
  // Panel style buttons
  document.querySelectorAll('.panel-style-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const style = btn.dataset.style;
      if (style) {
        changePanelStyle(style);
      }
    });
  });

  // Panel style tooltip toggle
  const toggleBtn = document.getElementById('panelStyleBtn');
  const tooltip = document.getElementById('panelStyleTooltip');
  if (toggleBtn && tooltip) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      tooltip.classList.toggle('show');
    });
  }

  // Close tooltip when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#panelStyleBtn') && !e.target.closest('#panelStyleTooltip')) {
      closePanelStyleTooltip();
    }
  });
}

/**
 * Initialize all feature modules
 */
export function initializeFeatures() {
  setupSiteBuilder();
  setupPanelStyles();
  console.log('Solar education features initialized');
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Apply the selected site configuration
 */
function applyConfiguration(config) {
  console.log('Applying configuration:', config);
  
  if (config.module && config.inverter && config.dcCollection && config.dcCombo) {
    window.currentSiteConfig = { ...config };
    
    if (typeof window.rebuildSolarFarm === 'function') {
      rebuildSolarFarm();
    }
    
    updateConfigurationDisplay(config);
  }
}

/**
 * Update the UI to display the current configuration
 */
function updateConfigurationDisplay(config) {
  const displayEl = document.getElementById('currentConfigDisplay');
  if (displayEl) {
    const configNum = getConfigNumber();
    const moduleLabel = siteLabels[config.module]?.title || config.module;
    const inverterLabel = siteLabels[config.inverter]?.title || config.inverter;
    
    displayEl.innerHTML = 
      '<strong>Current Configuration #' + configNum + '</strong><br>' +
      'Module: ' + moduleLabel + '<br>' +
      'Inverter: ' + inverterLabel + '<br>' +
      'DC Collection: ' + (siteLabels[config.dcCollection]?.title || config.dcCollection) + '<br>' +
      'DC Combo: ' + (siteLabels[config.dcCombo]?.title || config.dcCombo);
  }
}

/**
 * Validate if a configuration is valid
 */
export function isValidConfiguration(config) {
  return validSites.some(site => 
    site.module === config.module &&
    site.inverter === config.inverter &&
    site.dcCollection === config.dcCollection &&
    site.dcCombo === config.dcCombo
  );
}

/**
 * Get all valid configurations for a given module type
 */
export function getValidConfigsForModule(moduleType) {
  return validSites.filter(site => site.module === moduleType);
}

/**
 * Get configuration details with labels
 */
export function getConfigurationDetails(config) {
  return {
    module: {
      value: config.module,
      label: siteLabels[config.module]
    },
    inverter: {
      value: config.inverter,
      label: siteLabels[config.inverter]
    },
    dcCollection: {
      value: config.dcCollection,
      label: siteLabels[config.dcCollection]
    },
    dcCombo: {
      value: config.dcCombo,
      label: siteLabels[config.dcCombo]
    }
  };
}

// ============================================================================
// AUTO-INITIALIZATION
// ============================================================================

export default initializeFeatures;
