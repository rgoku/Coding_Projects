# Solar Education Features - File Index

## Quick Navigation

### Core Modules (Use These)
1. **[siteBuilder.js](./siteBuilder.js)** - Site builder modal functionality
2. **[panelStyles.js](./panelStyles.js)** - Panel style switching
3. **[../data/siteConfigs.js](../data/siteConfigs.js)** - Configuration data

### Documentation (Read These)
4. **[README.md](./README.md)** - Complete module documentation
5. **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Quick reference guide
6. **[../MODULE_CREATION_SUMMARY.md](../MODULE_CREATION_SUMMARY.md)** - Project summary

### Integration Helpers (Reference These)
7. **[integration-example.js](./integration-example.js)** - Integration patterns
8. **[test-modules.html](./test-modules.html)** - Test suite

## Module Dependency Graph

```
index.html
    |
    ├── siteBuilder.js
    |       └── imports: siteConfigs.js
    |
    ├── panelStyles.js
    |       └── requires: window.scene, window.trackerRows, etc.
    |
    └── integration-example.js (optional)
            ├── imports: siteBuilder.js
            ├── imports: panelStyles.js
            └── imports: siteConfigs.js
```

## Import Examples

### Minimal Import
```javascript
import { openSiteBuilder } from './js/features/siteBuilder.js';
import { changePanelStyle } from './js/features/panelStyles.js';
```

### Full Import
```javascript
import { 
  openSiteBuilder, 
  closeSiteBuilder, 
  resetSiteBuilder, 
  sbSelect, 
  sbUpdateUI,
  getConfigNumber 
} from './js/features/siteBuilder.js';

import { 
  changePanelStyle, 
  closePanelStyleTooltip, 
  rebuildSolarFarm 
} from './js/features/panelStyles.js';

import { 
  validSites, 
  sbState, 
  siteLabels 
} from './js/data/siteConfigs.js';
```

### Use Integration Helper
```javascript
import initializeFeatures from './js/features/integration-example.js';
document.addEventListener('DOMContentLoaded', initializeFeatures);
```

## File Purposes

| File | Purpose | When to Use |
|------|---------|-------------|
| `siteConfigs.js` | Configuration data | Always import this first |
| `siteBuilder.js` | Site builder UI | When using site builder modal |
| `panelStyles.js` | Panel switching | When changing panel layouts |
| `README.md` | Documentation | Learning the API |
| `QUICK_REFERENCE.md` | Quick lookup | During development |
| `integration-example.js` | Integration guide | Setting up for first time |
| `test-modules.html` | Testing | Verifying module functionality |

## Typical Usage Flow

1. Import modules in your HTML or main JS file
2. Initialize features on page load
3. Attach to UI buttons/events
4. Use exported functions to control features

## Getting Started

**New to these modules?** Start here:
1. Read [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) (2 minutes)
2. Review [integration-example.js](./integration-example.js) (5 minutes)
3. Open [test-modules.html](./test-modules.html) in browser (1 minute)
4. Integrate into your project using [README.md](./README.md) guide

**Already familiar?** Jump to:
- [siteBuilder.js](./siteBuilder.js) for site builder functions
- [panelStyles.js](./panelStyles.js) for panel style functions
- [siteConfigs.js](../data/siteConfigs.js) for configuration data

## Common Tasks

### Task: Add Site Builder Button
```html
<button onclick="openSiteBuilder()">Build Site</button>
```

### Task: Add Panel Style Selector
```html
<button onclick="changePanelStyle('1P')">1 Portrait</button>
<button onclick="changePanelStyle('2P')">2 Portrait</button>
<button onclick="changePanelStyle('2L')">2 Landscape</button>
```

### Task: Check Valid Configuration
```javascript
import { validSites, sbState } from './js/data/siteConfigs.js';

const isValid = validSites.some(site => 
  site.module === sbState.module &&
  site.inverter === sbState.inverter &&
  site.dcCollection === sbState.dcCollection &&
  site.dcCombo === sbState.dcCombo
);
```

### Task: Get Configuration Details
```javascript
import { siteLabels } from './js/data/siteConfigs.js';

const label = siteLabels['bifacial-600'];
console.log(label.title); // "Bifacial 600W"
console.log(label.sub);   // "28 mods/string"
```

## Support

For detailed information about each module, see:
- **API Reference:** [README.md](./README.md)
- **Quick Commands:** [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
- **Integration Guide:** [integration-example.js](./integration-example.js)
- **Project Overview:** [../MODULE_CREATION_SUMMARY.md](../MODULE_CREATION_SUMMARY.md)

---

**Last Updated:** February 11, 2026  
**Total Files:** 8 (3 modules + 5 documentation/examples)  
**Total Code:** 334 lines of modular JavaScript
