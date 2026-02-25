/**
 * Panel Styles Feature Module
 * 
 * This module handles solar panel style switching functionality:
 * - 2L: 2 Landscape panels (original layout)
 * - 2P: 2 Portrait panels (rotated 90 degrees)
 * - 1P: 1 Portrait panel (single panel configuration)
 * 
 * Dependencies:
 * - Requires global variables: currentPanelStyle, trackerRows, junctionBoxes, 
 *   redCables, bearingPlates, combinerBoxes, inverterBoxes, scene, currentStep
 * - Requires global functions: createAllTrackerRows(), highlightComponent()
 */

/**
 * Closes the panel style selection tooltip
 */
export function closePanelStyleTooltip() {
  document.getElementById('panelStyleTooltip').classList.remove('show');
}

/**
 * Changes the current panel style and rebuilds the solar farm
 * @param {string} style - The panel style to switch to ('2L', '2P', or '1P')
 */
export function changePanelStyle(style) {
  // Access global currentPanelStyle
  if (window.currentPanelStyle === style) {
    closePanelStyleTooltip();
    return;
  }
  
  // Update global panel style
  window.currentPanelStyle = style;
  
  // Update button states
  document.querySelectorAll('.panel-style-option').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.style === style) {
      btn.classList.add('active');
    }
  });
  
  // Show loading indicator
  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'rebuildLoading';
  loadingDiv.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:rgba(10,22,40,0.95); padding:20px 40px; border-radius:12px; border:2px solid #ff1493; z-index:10001; color:#fff; font-weight:600; font-size:16px;';
  loadingDiv.innerHTML = '🔄 Switching to ' + style + '...';
  document.body.appendChild(loadingDiv);
  
  closePanelStyleTooltip();
  
  // Rebuild after short delay
  setTimeout(() => {
    rebuildSolarFarm();
    document.body.removeChild(loadingDiv);
  }, 100);
}

/**
 * Rebuilds the entire solar farm with the current panel style
 * - Removes all existing tracker rows from scene
 * - Disposes geometries and materials
 * - Clears all tracking arrays
 * - Recreates tracker rows with new panel style
 * - Re-applies current step highlighting
 */
export function rebuildSolarFarm() {
  // Access global variables
  const trackerRows = window.trackerRows || [];
  const scene = window.scene;
  
  // Remove existing tracker rows from scene
  trackerRows.forEach(tracker => {
    scene.remove(tracker);
    // Dispose of geometries and materials
    tracker.traverse(child => {
      if (child.geometry) child.geometry.dispose();
    });
  });
  
  // Clear all tracking arrays
  window.trackerRows = [];
  window.junctionBoxes = [];
  window.redCables = [];
  window.bearingPlates = [];
  window.combinerBoxes = [];
  window.inverterBoxes = [];
  
  // Rebuild tracker rows with new panel style
  if (typeof window.createAllTrackerRows === 'function') {
    window.createAllTrackerRows();
  }
  
  // Re-apply current step highlight
  if (typeof window.highlightComponent === 'function' && window.currentStep) {
    window.highlightComponent(window.currentStep);
  }
}
