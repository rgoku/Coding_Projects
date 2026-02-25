# Solar Education Features Modules

This directory contains modular ES6 JavaScript files for the solar education interactive features.

## Module Structure

### 1. `siteBuilder.js`
Site builder modal functionality for creating valid solar farm configurations.

**Exports:**
- `openSiteBuilder()` - Opens the site builder modal
- `closeSiteBuilder()` - Closes the site builder modal
- `resetSiteBuilder()` - Resets all selections to default state
- `sbSelect(field, value, btn)` - Handles option selection/deselection
- `sbUpdateUI()` - Updates UI based on current selections
- `getConfigNumber()` - Returns the configuration number

**Dependencies:**
- Imports `validSites`, `sbState`, `siteLabels` from `../data/siteConfigs.js`

**Usage Example:**
```javascript
import { openSiteBuilder, closeSiteBuilder } from './features/siteBuilder.js';

// Open the site builder
document.getElementById('buildBtn').addEventListener('click', openSiteBuilder);

// Close the site builder
document.getElementById('closeBtn').addEventListener('click', closeSiteBuilder);
```

### 2. `panelStyles.js`
Panel style switching functionality for solar farm visualization.

**Exports:**
- `closePanelStyleTooltip()` - Closes the panel style tooltip
- `changePanelStyle(style)` - Changes panel style and rebuilds farm
- `rebuildSolarFarm()` - Rebuilds solar farm with current settings

**Panel Styles:**
- `'2L'` - 2 Landscape panels (original layout)
- `'2P'` - 2 Portrait panels (rotated 90 degrees)
- `'1P'` - 1 Portrait panel (single panel configuration)

**Global Dependencies:**
This module requires the following global variables to be available on `window`:
- `window.currentPanelStyle` - Current panel style setting
- `window.trackerRows` - Array of tracker row objects
- `window.junctionBoxes` - Array of junction box objects
- `window.redCables` - Array of cable objects
- `window.bearingPlates` - Array of bearing plate objects
- `window.combinerBoxes` - Array of combiner box objects
- `window.inverterBoxes` - Array of inverter box objects
- `window.scene` - Three.js scene object
- `window.currentStep` - Current tutorial step
- `window.createAllTrackerRows()` - Function to create tracker rows
- `window.highlightComponent()` - Function to highlight components

**Usage Example:**
```javascript
import { changePanelStyle, closePanelStyleTooltip } from './features/panelStyles.js';

// Change to 2 Portrait layout
changePanelStyle('2P');

// Close tooltip
closePanelStyleTooltip();
```

## Data Module

### `../data/siteConfigs.js`
Configuration data for valid solar farm site combinations.

**Exports:**
- `validSites` - Array of 13 valid site configurations
  - 8 Bifacial 600W configurations (28 mods/string)
  - 5 First Solar 525W configurations (6 mods/string)
- `sbState` - Current site builder state object
- `siteLabels` - Display labels for all configuration options

**Configuration Fields:**
- `module` - Module type ('bifacial-600' or 'first-solar-525')
- `inverter` - Inverter type ('distributed', 'centralized-cluster', or 'central')
- `dcCollection` - DC collection method ('string-homeruns', 'harnesses', or 'trunk-bus')
- `dcCombo` - DC combination gear ('none', 'combiner-boxes', or 'lbds')

**Usage Example:**
```javascript
import { validSites, sbState, siteLabels } from '../data/siteConfigs.js';

// Check if current selection is valid
const isValid = validSites.some(site => 
  site.module === sbState.module &&
  site.inverter === sbState.inverter &&
  site.dcCollection === sbState.dcCollection &&
  site.dcCombo === sbState.dcCombo
);

// Get label for a configuration option
const label = siteLabels['bifacial-600']; // { title: 'Bifacial 600W', sub: '28 mods/string' }
```

## Integration Guide

To integrate these modules into your main application:

### 1. Import in HTML
```html
<script type="module">
  import { openSiteBuilder, closeSiteBuilder, resetSiteBuilder, sbSelect, sbUpdateUI } from './js/features/siteBuilder.js';
  import { changePanelStyle, closePanelStyleTooltip, rebuildSolarFarm } from './js/features/panelStyles.js';
  import { validSites, sbState, siteLabels } from './js/data/siteConfigs.js';
  
  // Make functions globally available if needed
  window.openSiteBuilder = openSiteBuilder;
  window.closeSiteBuilder = closeSiteBuilder;
  window.changePanelStyle = changePanelStyle;
  // ... etc
</script>
```

### 2. Import in JavaScript Module
```javascript
// In your main.js or other module
import { openSiteBuilder, sbSelect, sbUpdateUI } from './features/siteBuilder.js';
import { changePanelStyle } from './features/panelStyles.js';
import { validSites, sbState } from '../data/siteConfigs.js';

// Use the functions
export function setupSiteBuilder() {
  document.getElementById('buildBtn').addEventListener('click', openSiteBuilder);
  document.querySelectorAll('.sb-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      sbSelect(btn.dataset.field, btn.dataset.value, btn);
    });
  });
}
```

### 3. Event Listeners Setup
These modules are designed to work with the existing HTML structure. Make sure your HTML includes:

**Site Builder Modal:**
```html
<div id="siteBuilderModal" class="modal">
  <!-- Modal content with .sb-opt buttons -->
  <div class="sb-opts" data-field="module">
    <button class="sb-opt" data-value="bifacial-600" onclick="sbSelect('module', 'bifacial-600', this)">
      Bifacial 600W
    </button>
  </div>
  <!-- More fields... -->
  <div id="sbViewBtn">View Configuration</div>
  <div id="sbFooterInfo"></div>
</div>
```

**Panel Style Controls:**
```html
<div id="panelStyleTooltip">
  <button class="panel-style-option active" data-style="1P" onclick="changePanelStyle('1P')">
    1 Portrait
  </button>
  <button class="panel-style-option" data-style="2P" onclick="changePanelStyle('2P')">
    2 Portrait
  </button>
  <button class="panel-style-option" data-style="2L" onclick="changePanelStyle('2L')">
    2 Landscape
  </button>
</div>
```

## File Locations

```
solar-education/
├── js/
│   ├── data/
│   │   ├── siteConfigs.js      (Site configuration data)
│   │   ├── contentData.js      (Tutorial content)
│   │   └── quizData.js         (Quiz questions)
│   ├── features/
│   │   ├── siteBuilder.js      (Site builder functionality)
│   │   ├── panelStyles.js      (Panel style switching)
│   │   └── README.md           (This file)
│   └── main.js                 (Main application file)
└── index.html
```

## Notes

- All modules use ES6 syntax and must be loaded as modules (`type="module"`)
- The `panelStyles.js` module uses global variables from the main application scope
- The `siteBuilder.js` module is self-contained with proper imports
- Configuration data is centralized in `siteConfigs.js` for easy maintenance
