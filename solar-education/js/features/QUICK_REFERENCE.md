# Quick Reference - Solar Education Modules

## Import Statements

```javascript
// Site Builder
import { 
  openSiteBuilder, 
  closeSiteBuilder, 
  resetSiteBuilder, 
  sbSelect, 
  sbUpdateUI,
  getConfigNumber 
} from './features/siteBuilder.js';

// Panel Styles
import { 
  changePanelStyle, 
  closePanelStyleTooltip, 
  rebuildSolarFarm 
} from './features/panelStyles.js';

// Configuration Data
import { 
  validSites,      // Array of 13 valid configs
  sbState,         // Current selection state
  siteLabels       // Display labels
} from './data/siteConfigs.js';
```

## Common Usage

### Open Site Builder
```javascript
openSiteBuilder();
```

### Change Panel Style
```javascript
changePanelStyle('2P');  // Options: '1P', '2P', '2L'
```

### Check Valid Configuration
```javascript
const isValid = validSites.some(site => 
  site.module === sbState.module &&
  site.inverter === sbState.inverter &&
  site.dcCollection === sbState.dcCollection &&
  site.dcCombo === sbState.dcCombo
);
```

### Get Configuration Label
```javascript
const label = siteLabels['bifacial-600'];
// Returns: { title: 'Bifacial 600W', sub: '28 mods/string' }
```

## HTML Event Handlers

### Site Builder Buttons
```html
<button onclick="openSiteBuilder()">Build Site</button>
<button onclick="closeSiteBuilder()">Close</button>
<button onclick="resetSiteBuilder()">Reset</button>

<button class="sb-opt" 
        data-value="bifacial-600" 
        onclick="sbSelect('module', 'bifacial-600', this)">
  Bifacial 600W
</button>
```

### Panel Style Buttons
```html
<button onclick="changePanelStyle('1P')">1 Portrait</button>
<button onclick="changePanelStyle('2P')">2 Portrait</button>
<button onclick="changePanelStyle('2L')">2 Landscape</button>
```

## Configuration Fields

### Module Types
- `'bifacial-600'` - Bifacial 600W (28 mods/string)
- `'first-solar-525'` - First Solar 525W (6 mods/string)

### Inverter Types
- `'distributed'` - Distributed String Inverters
- `'centralized-cluster'` - Centralized String Inverter Clusters
- `'central'` - Central Inverters

### DC Collection Methods
- `'string-homeruns'` - String Homeruns
- `'harnesses'` - Harnesses
- `'trunk-bus'` - Trunk Bus

### DC Combination Gear
- `'none'` - None
- `'combiner-boxes'` - Combiner Boxes
- `'lbds'` - Load Break Disconnects (LBDs)

## Valid Configurations

### Bifacial 600W (8 configs)
1. distributed + string-homeruns + none
2. centralized-cluster + string-homeruns + combiner-boxes
3. central + string-homeruns + combiner-boxes
4. distributed + harnesses + none
5. centralized-cluster + harnesses + combiner-boxes
6. central + harnesses + combiner-boxes
7. centralized-cluster + trunk-bus + lbds
8. central + trunk-bus + lbds

### First Solar 525W (5 configs)
1. distributed + harnesses + none
2. centralized-cluster + harnesses + combiner-boxes
3. central + harnesses + combiner-boxes
4. centralized-cluster + trunk-bus + lbds
5. central + trunk-bus + lbds

## Module Exports Summary

### siteConfigs.js
```javascript
export const validSites;      // Array[13]
export const sbState;         // Object
export const siteLabels;      // Object
```

### siteBuilder.js
```javascript
export function openSiteBuilder();
export function closeSiteBuilder();
export function resetSiteBuilder();
export function sbSelect(field, value, btn);
export function sbUpdateUI();
export function getConfigNumber();
```

### panelStyles.js
```javascript
export function closePanelStyleTooltip();
export function changePanelStyle(style);
export function rebuildSolarFarm();
```

## File Sizes
- `siteConfigs.js` - 3.6 KB (63 lines)
- `siteBuilder.js` - 5.4 KB (172 lines)
- `panelStyles.js` - 3.1 KB (99 lines)
- **Total:** 334 lines of modular code

## Quick Setup

```javascript
// 1. Import
import initializeFeatures from './features/integration-example.js';

// 2. Initialize on page load
document.addEventListener('DOMContentLoaded', initializeFeatures);

// 3. Done! All features are now active.
```
