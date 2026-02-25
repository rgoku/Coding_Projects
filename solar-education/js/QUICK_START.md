# Quick Start - Extracted 3D Modules

## File Locations

```
✓ js/scene/textureGenerator.js (196 lines, 6.5 KB)
✓ js/scene/siteBuilder3D.js (1,144 lines, 63 KB)
✓ js/features/siteViewer.js (152 lines, 8.8 KB)
```

## Import Examples

```javascript
// Textures
import { mkPanelTex, mkGroundTex, mkGravelTex } 
  from './scene/textureGenerator.js';

// Site Builder
import { svBuildSite } 
  from './scene/siteBuilder3D.js';

// Site Viewer
import { openSiteViewer, closeSiteViewer, svResetView, svTopView, svToggleAuto } 
  from './features/siteViewer.js';
```

## Basic Usage

### 1. Generate Textures

```javascript
// Bifacial panel (blue cells, silver busbars)
const bifacialTexture = mkPanelTex(true);

// First Solar panel (black)
const firstSolarTexture = mkPanelTex(false);

// Ground
const groundTexture = mkGroundTex();

// Gravel
const gravelTexture = mkGravelTex();
```

### 2. Build 3D Site

```javascript
const scene = new THREE.Scene();

// Parameters:
// - scene: THREE.Scene
// - inverter: 'string' | 'central'
// - dcCollection: 'overhead' | 'homerun' | 'trench'
// - dcCombo: 'distributed' | 'central'
// - isBifacial: boolean

svBuildSite(scene, 'string', 'overhead', 'distributed', true);
```

### 3. Open Site Viewer

```javascript
const state = {
  module: 'bifacial-600',      // or 'firstsolar'
  inverter: 'string',           // or 'central'
  dcCollection: 'overhead',     // or 'homerun', 'trench'
  dcCombo: 'distributed'        // or 'central'
};

const labels = {
  'bifacial-600': { title: 'Bifacial 600W Mono-PERC' },
  'firstsolar': { title: 'First Solar Series 6 CdTe' },
  'string': { title: 'String Inverter (50kW)' },
  'central': { title: 'Central Inverter (2.5MW)' },
  'overhead': { title: 'Overhead DC Collection' },
  'homerun': { title: 'Homerun DC Collection' },
  'trench': { title: 'Trench DC Collection' },
  'distributed': { title: 'Distributed Combiners' },
  'central': { title: 'Central Combiners' }
};

function getConfigNumber() {
  return 1; // Current configuration number
}

// Open the viewer
openSiteViewer(state, getConfigNumber, labels);

// Camera controls
svResetView();      // Reset to default view
svTopView();        // Switch to top-down view
svToggleAuto();     // Toggle auto-rotation

// Close when done
closeSiteViewer();
```

## Camera Controls (When Viewer is Open)

| Input | Action |
|-------|--------|
| **Mouse Left Drag** | Orbit camera around target |
| **Mouse Right Drag** | Pan camera (move target) |
| **Mouse Wheel** | Zoom in/out |
| **W / ↑** | Move target forward |
| **S / ↓** | Move target backward |
| **A / ←** | Move target left |
| **D / →** | Move target right |
| **One Finger Touch** | Orbit camera |
| **Two Finger Pinch** | Zoom |

## HTML Setup

```html
<!DOCTYPE html>
<html>
<head>
  <title>Solar Site Viewer</title>
  <style>
    body { margin: 0; overflow: hidden; }
    canvas { display: block; }
    #siteViewerFS {
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0,0,0,0.9);
      display: none;
      z-index: 1000;
    }
    #siteViewerFS.active { display: block; }
  </style>
</head>
<body>
  <div id="siteViewerFS">
    <div id="svBadge"></div>
    <div id="svCfgPanel"></div>
    <div id="svHint">Use mouse to orbit, scroll to zoom</div>
    <button id="svAutoBtn">Auto</button>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/three@0.150.0/build/three.min.js"></script>
  <script type="module">
    import { openSiteViewer } from './js/features/siteViewer.js';
    
    // Your code here
  </script>
</body>
</html>
```

## Configuration Options

### Module Types
- `bifacial-600` - 600W Bifacial Mono-PERC (blue cells)
- `firstsolar` - First Solar Series 6 CdTe (black)

### Inverter Types
- `string` - String inverters (distributed, 50kW each)
- `central` - Central inverter (2.5MW)

### DC Collection Methods
- `overhead` - Elevated wire runs on support structures
- `homerun` - Direct underground conduit runs
- `trench` - Buried cable trays with junction boxes

### DC Combiner Placement
- `distributed` - Multiple small combiner boxes per block
- `central` - Single large combiner at array center

## Performance Tips

1. **Shadow Quality**: Adjust shadow map size in siteViewer.js
   ```javascript
   sun.shadow.mapSize.set(2048, 2048); // Reduce for better performance
   ```

2. **Pixel Ratio**: Limit device pixel ratio
   ```javascript
   svRenderer.setPixelRatio(Math.min(devicePixelRatio, 1)); // Lower = faster
   ```

3. **Fog Distance**: Increase fog density to cull distant objects
   ```javascript
   svScene.fog = new THREE.FogExp2(0x8DBBD8, 0.002); // Higher = more fog
   ```

## Troubleshooting

**Viewer not opening?**
- Ensure DOM elements exist: `#siteViewerFS`, `#svBadge`, `#svCfgPanel`, `#svAutoBtn`, `#svHint`
- Check browser console for errors
- Verify Three.js is loaded globally

**Textures not showing?**
- Check that textures are assigned to materials before rendering
- Verify sRGB encoding is supported

**Camera not responding?**
- Ensure canvas receives mouse events
- Check that event listeners are attached
- Verify keyboard keys object is populated

## Dependencies

- **Three.js r150+** (must be loaded globally as `THREE`)
- **Modern browser** with WebGL 2.0 support
- **ES6 modules** enabled

## Further Reading

- **MODULES_README.md** - Complete API documentation
- **EXTRACTION_SUMMARY.md** - Extraction details and statistics
- **js/features/README.md** - Additional feature documentation

---

**Created:** February 12, 2026  
**Modules Version:** 1.0.0  
**Three.js Version:** r150+
