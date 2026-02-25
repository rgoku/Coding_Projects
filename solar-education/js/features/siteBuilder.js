/**
 * Site Builder Feature Module
 * 
 * This module handles the site builder modal functionality including:
 * - Opening/closing the modal
 * - Resetting selections
 * - Validating configuration combinations
 * - Updating the UI based on selections
 */

import { validSites, sbState, siteLabels } from '../data/siteConfigs.js';

/**
 * Opens the site builder modal
 * Resets all selections before opening
 */
export function openSiteBuilder() {
  resetSiteBuilder();
  document.getElementById('siteBuilderModal').classList.add('active');
}

/**
 * Closes the site builder modal
 */
export function closeSiteBuilder() {
  document.getElementById('siteBuilderModal').classList.remove('active');
}

/**
 * Resets the site builder to default state
 * Clears all selections and hides the view button
 */
export function resetSiteBuilder() {
  sbState.module = null;
  sbState.inverter = null;
  sbState.dcCollection = null;
  sbState.dcCombo = null;
  
  document.querySelectorAll('.sb-opt').forEach(b => {
    b.classList.remove('sb-selected');
  });
  
  document.getElementById('sbViewBtn').classList.remove('visible');
  sbUpdateUI();
}

/**
 * Handles selection/deselection of a configuration option
 * @param {string} field - The configuration field (module, inverter, dcCollection, dcCombo)
 * @param {string} value - The value to select
 * @param {HTMLElement} btn - The button element that was clicked
 */
export function sbSelect(field, value, btn) {
  if (btn.classList.contains('sb-disabled')) return;
  
  if (sbState[field] === value) {
    sbState[field] = null;
  } else {
    sbState[field] = value;
  }
  
  sbUpdateUI();
}

/**
 * Updates the UI based on current selections
 * - Enables/disables options based on valid configurations
 * - Updates visual selection state
 * - Updates footer information
 * - Updates flow diagram
 */
export function sbUpdateUI() {
  const fields = ['module', 'inverter', 'dcCollection', 'dcCombo'];
  
  // Helper: does a config field match? Handles "*" wildcard for module
  function fm(siteVal, stateVal) {
    return !stateVal || siteVal === '*' || siteVal === stateVal;
  }

  // Update each field's options
  fields.forEach(field => {
    const container = document.querySelector('.sb-opts[data-field="' + field + '"]');
    if (!container) return;
    
    container.querySelectorAll('.sb-opt').forEach(btn => {
      const val = btn.dataset.value;
      const testState = { ...sbState };
      testState[field] = val;
      
      const isValid = validSites.some(site =>
        fm(site.module, testState.module) &&
        fm(site.inverter, testState.inverter) &&
        fm(site.dcCollection, testState.dcCollection) &&
        fm(site.dcCombo, testState.dcCombo)
      );
      
      btn.classList.toggle('sb-disabled', !isValid);
      btn.classList.toggle('sb-selected', sbState[field] === val);
    });
  });

  // Check if configuration is complete and valid
  const count = fields.filter(f => sbState[f] !== null).length;
  const allSelected = count === 4;
  const isValidConfig = allSelected && validSites.some(s =>
    fm(s.module, sbState.module) && 
    s.inverter === sbState.inverter &&
    s.dcCollection === sbState.dcCollection && 
    s.dcCombo === sbState.dcCombo
  );

  // Update view button visibility
  document.getElementById('sbViewBtn').classList.toggle('visible', isValidConfig);
  
  // Update footer information
  const info = document.getElementById('sbFooterInfo');
  if (isValidConfig) {
    const moduleMax = sbState.module === 'bifacial-600' ? 8 : 5;
    info.textContent = '✅ Valid configuration — Site ' + getConfigNumber() + ' of ' + moduleMax;
    info.style.color = '#34d399';
  } else if (allSelected) {
    info.textContent = '❌ Invalid combination — adjust your selections';
    info.style.color = '#f87171';
  } else {
    info.textContent = count + ' of 4 selected';
    info.style.color = '#94a3b8';
  }

  // Update Flow Bar visualization
  const flowMap = {
    module: { node: 'sbFlowModule', val: 'sbFlowModuleVal' },
    inverter: { node: 'sbFlowInverter', val: 'sbFlowInverterVal' },
    dcCollection: { node: 'sbFlowDC', val: 'sbFlowDCVal' },
    dcCombo: { node: 'sbFlowCombo', val: 'sbFlowComboVal' }
  };
  
  const arrows = ['sbFlowArrow1', 'sbFlowArrow2', 'sbFlowArrow3'];
  let prevFilled = true;
  
  fields.forEach((field, i) => {
    const el = document.getElementById(flowMap[field].node);
    const valEl = document.getElementById(flowMap[field].val);
    if (!el || !valEl) return;
    
    const isFilled = sbState[field] !== null;
    el.classList.toggle('filled', isFilled);
    el.classList.toggle('active-node', !isFilled && prevFilled);
    valEl.textContent = isFilled ? (siteLabels[sbState[field]]?.title || sbState[field]) : '—';
    
    if (i > 0) {
      const arrow = document.getElementById(arrows[i - 1]);
      if (arrow) arrow.classList.toggle('lit', isFilled);
    }
    
    prevFilled = isFilled;
  });
}

/**
 * Gets the configuration number for the current selection
 * @returns {number|string} The configuration number or '?' if not found
 */
export function getConfigNumber() {
  // Get configs for the selected module only
  const moduleConfigs = validSites.filter(s => s.module === sbState.module);
  const idx = moduleConfigs.findIndex(s =>
    s.inverter === sbState.inverter &&
    s.dcCollection === sbState.dcCollection &&
    s.dcCombo === sbState.dcCombo
  );
  return idx >= 0 ? idx + 1 : '?';
}
