# Solar Education Platform - Extracted Modules

This document describes the three major ES6 modules extracted from the monolithic HTML file.

## Module Structure

```
solar-education/js/
├── scene/
│   ├── textureGenerator.js    (6.5 KB)
│   └── siteBuilder3D.js        (63 KB)
└── features/
    └── siteViewer.js           (8.8 KB)
```

---

## 1. textureGenerator.js

**Location:** js/scene/textureGenerator.js
**Size:** 6.5 KB
**Purpose:** Procedural texture generation for solar panels and ground materials

### Exported Functions

- **mkPanelTex(bif)**: Generates bifacial or First Solar panel textures (512x1024)
- **mkGroundTex()**: Generates grass/dirt ground texture (512x512, 12x12 repeat)
- **mkGravelTex()**: Generates gravel texture for roads (256x256)

## 2. siteViewer.js

**Location:** js/features/siteViewer.js
**Size:** 8.8 KB
**Purpose:** Fullscreen 3D site viewer with advanced camera controls

### Exported Functions

- **openSiteViewer(sbState, getConfigNumber, siteLabels)**: Opens fullscreen 3D viewer
- **closeSiteViewer()**: Closes viewer and disposes resources
- **svResetView()**: Resets camera to default isometric view
- **svTopView()**: Sets camera to top-down view
- **svToggleAuto()**: Toggles automatic camera rotation

### Camera Controls

**Mouse:** Left drag (orbit), Right drag (pan), Scroll wheel (zoom)
**Touch:** One finger (orbit), Two finger pinch (zoom)
**Keyboard:** WASD or arrow keys to move target

## 3. siteBuilder3D.js

**Location:** js/scene/siteBuilder3D.js
**Size:** 63 KB (1,135+ lines)
**Purpose:** Generates complete 3D solar farm

### Exported Function

- **svBuildSite(sc, inv, dc, comb, isBi)**: Builds entire 3D solar site

### Generated Components

- Ground terrain (800x800 with procedural elevation)
- Solar arrays (panels, racking, torque tubes, posts)
- DC collection system (overhead/homerun/trench)
- Inverters (string/central)
- DC combiners (distributed/central)
- Substation (transformer, switchgear)
- Roads and fencing
- Weather station
- Vegetation (trees, bushes)

## Usage Example

```javascript
import { openSiteViewer } from "./features/siteViewer.js";

const state = {
  module: "bifacial-600",
  inverter: "string",
  dcCollection: "overhead",
  dcCombo: "distributed"
};

openSiteViewer(state, getConfigNum, labels);
```

## Dependencies

- Three.js (r150+)
- Modern browser with WebGL 2.0
- ES6 module support
