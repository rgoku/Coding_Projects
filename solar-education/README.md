# Ampacity Renewables - Solar Education (Modular Version)

[View Full Project Repository](https://github.com/rgoku/Coding_Projects/tree/main/solar-education)

This is a refactored, modular version of the Solar Education interactive 3D application with advanced site configuration features.

## 🆕 New Features in Version 2.0

### 🏗️ Site Builder
- **Interactive Site Configuration** - Build custom solar farms with 13 valid configurations
- **Real-time Validation** - Invalid combinations are automatically disabled
- **Visual Flow Bar** - Track your progress through the configuration steps
- **Module Options**: Bifacial 600W (28 mods/string) or First Solar 525W (6 mods/string)
- **Inverter Types**: Distributed, Centralized Cluster, or Central
- **DC Collection**: String Homeruns, Harnesses, or Trunk Bus
- **DC Combination**: Combiner Boxes, LBDs, or None

### 🌐 3D Site Viewer
- **Fullscreen Immersive Experience** - Explore your configured solar farm
- **Advanced Camera Controls**:
  - Mouse drag to orbit, right-click to pan, scroll to zoom
  - Keyboard navigation (WASD/Arrow keys)
  - Touch support (single-finger drag, pinch zoom)
  - Auto-rotation mode
- **Multiple View Modes**: Default orbital view, top-down view, reset view
- **Configuration Display**: See your selected options on-screen
- **Color-Coded Legend**: Panels, DC Wiring, Inverters, AC, Substation

### 🔲 Panel Configuration
- **Dynamic Panel Layouts**:
  - 1P (1 Portrait) - 110 panels per row
  - 2P (2 Portrait) - 95 panels per row
  - 2L (2 Landscape) - 95 panels per row
- **Real-time Rebuild**: Solar farm regenerates with new panel arrangement
- **Loading Indicators**: Smooth transitions during panel style changes

### 🎨 Procedural Textures
- **Bifacial Panel Texture**: Realistic 6×10 cell grid with busbars
- **First Solar Texture**: Authentic CdTe appearance with laser scribe lines
- **Ground Textures**: Dynamic grass/dirt and gravel pad generation

### ⚡ Performance Optimizations
- **Hardware Acceleration**: `will-change` properties for smooth animations
- **Smooth Loading**: Fade-out transitions instead of instant removal
- **InstancedMesh Rendering**: Efficient rendering of 1,760+ solar panels

## 📁 Project Structure

```
solar-education/
├── index.html                    # Main HTML file
├── README.md                     # This file
├── css/                          # Stylesheets (modular)
│   ├── base.css                 # Reset, fonts, body styles, loading screen
│   ├── animations.css           # Keyframes and animations
│   ├── header.css               # Header bar & progress tracker
│   ├── panels.css               # Left & right panels, legends
│   ├── controls.css             # Bottom controls & buttons
│   ├── quiz.css                 # Quiz modal styles
│   └── siteBuilder.css          # 🆕 Site builder & viewer styles
├── js/                          # JavaScript modules
│   ├── main.js                  # Main application logic
│   ├── data/                    # Data modules
│   │   ├── contentData.js       # Educational content for each step
│   │   ├── quizData.js          # Quiz questions
│   │   └── siteConfigs.js       # 🆕 Valid site configurations
│   ├── features/                # 🆕 Feature modules
│   │   ├── siteBuilder.js       # Site configuration UI
│   │   ├── siteViewer.js        # Fullscreen 3D viewer
│   │   └── panelStyles.js       # Panel layout switching
│   └── scene/                   # 🆕 3D scene modules
│       ├── textureGenerator.js  # Procedural texture generation
│       └── siteBuilder3D.js     # Complete solar farm builder (1,144 lines)
└── assets/
    └── images/                  # Images (logo embedded in HTML for now)
```

## 🚀 How to Run

1. **Serve the application** using a local web server (required for ES6 modules):

   ```bash
   # Using Python
   python -m http.server 8000

   # Using Node.js
   npx http-server -p 8000

   # Using PHP
   php -S localhost:8000
   ```

2. **Open in browser**: Navigate to `http://localhost:8000`

## ✨ Benefits of This Structure

✅ **Maintainability** - Each file has a single responsibility
✅ **Reusability** - Components can be reused in other projects
✅ **Collaboration** - Multiple developers can work on different files
✅ **Performance** - Browser can cache individual files
✅ **Debugging** - Easier to locate and fix issues
✅ **Scalability** - Easy to add new features without bloating files

## 📝 Key Files

### HTML
- **index.html** - Main entry point, imports all CSS and JavaScript modules

### CSS Files
- **base.css** - Foundation styles, resets, global elements, loading animations
- **animations.css** - Reusable animation keyframes
- **header.css** - Top navigation bar and progress tracker
- **panels.css** - Side panels for education content and stats
- **controls.css** - Interactive buttons and tooltips
- **quiz.css** - Quiz modal and question styles
- **siteBuilder.css** - 🆕 Site builder modal, flow bar, site viewer UI

### JavaScript Files
- **main.js** - Core application (5,384 lines)
  - Three.js scene setup
  - 3D solar farm construction
  - Camera controls
  - UI interactions
  - Quiz system logic

- **data/contentData.js** - Educational content for each step
  - Module, String, Tracker, Combiner, Cabling, Inverter
  - HTML content, stats, camera positions

- **data/quizData.js** - Quiz questions (10 questions)
  - Multiple choice options
  - Correct answers
  - Explanations

- **data/siteConfigs.js** - 🆕 Site configuration data
  - 13 valid solar farm configurations (8 Bifacial + 5 First Solar)
  - Site builder state management
  - Configuration display labels

### Feature Modules (NEW!)
- **features/siteBuilder.js** - Site builder modal logic (172 lines)
  - Configuration validation and UI management
  - Real-time constraint checking
  - Flow bar visualization

- **features/siteViewer.js** - Fullscreen 3D viewer (152 lines)
  - Camera control system (mouse/keyboard/touch)
  - View mode switching
  - Auto-rotation

- **features/panelStyles.js** - Panel layout switching (99 lines)
  - Dynamic panel arrangement (1P/2P/2L)
  - Solar farm rebuilding
  - Loading state management

### Scene Modules (NEW!)
- **scene/textureGenerator.js** - Procedural textures (196 lines)
  - Bifacial panel texture (6×10 cell grid)
  - First Solar panel texture (CdTe appearance)
  - Ground and gravel textures

- **scene/siteBuilder3D.js** - Photorealistic solar farm builder (1,500+ lines)
  - **ULTRA-REALISTIC MATERIALS**: Industry-grade material properties with weathering
    - Anodized aluminum, galvanized steel, powder-coated finishes
    - UV-aged cables, reflective signage, self-illuminated LEDs
    - Weathered concrete, ceramic insulators, tempered glass
  - **DETAILED COMPONENTS**: Professional engineering accuracy
    - 1,760+ solar panels with mid-clamps and mounting hardware
    - W6x9 I-beam pile foundations with bearing assemblies
    - Linear actuator motors with encoders and status LEDs
    - Hex bolts, lock washers, grease fittings (Zerk fittings)
  - **REALISTIC TERRAIN**: Natural grading with drainage
    - 80x80 resolution terrain mesh for smooth topography
    - Drainage slopes, worn vehicle paths, soil variations
    - Micro-terrain texture for authentic ground detail
  - **COMPLETE INFRASTRUCTURE**:
    - Chain-link perimeter fence with barbed wire
    - Double-gate entrance with security
    - LED security lighting poles
    - Warning signage (ANSI Z535 compliant)
    - Parking lot with striping
    - Drainage culverts and swales
  - **VEGETATION & ENVIRONMENT**:
    - Native pine trees and desert bushes
    - Security cameras, weather stations (anemometer, rain gauge)
    - Utility monitoring boxes with antennas
    - Row identification markers
    - Rocks, dirt patches, tire tracks
  - **ELECTRICAL SYSTEMS**: Complete AC/DC infrastructure
    - String junction boxes (NEMA 4 weatherproof)
    - Combiner boxes (Type 304 stainless steel)
    - Load break disconnects with red safety handles
    - String inverters with LCD displays and LED indicators
    - Step-up transformers (480V to 34.5kV)
    - Complete substation with 115kV transmission
  - **PROFESSIONAL DETAILS**: Museum-quality realism
    - Cable trays, conduit supports, liquidtight connectors
    - Arc flash warning labels, equipment nameplates
    - Grounding systems with copper rods
    - Heat sink fins, cooling radiators
    - Porcelain insulators, circuit breakers

## 🔧 Further Modularization (Optional)

If you want to split `main.js` further, consider:

```
js/
├── main.js                      # Entry point & initialization
├── scene/
│   ├── sceneSetup.js           # Three.js scene, camera, renderer
│   ├── solarFarm.js            # Solar panel construction functions
│   ├── lighting.js             # Sun tracking & day/night cycle
│   └── particles.js            # Electricity flow particles
├── camera/
│   ├── cameraControls.js       # Camera movement & transitions
│   └── viewPresets.js          # Top view, default view, closeups
├── ui/
│   ├── navigation.js           # Step navigation & panels
│   └── quiz.js                 # Quiz system
└── data/
    ├── contentData.js          # Educational content
    └── quizData.js             # Quiz questions
```

## 🎨 Customization

- **Colors**: Edit CSS variables in `base.css` or individual files
- **Content**: Modify `contentData.js` to change educational text
- **Quiz**: Add/edit questions in `quizData.js`
- **3D Models**: Adjust geometry in `main.js` build functions

## 📚 Dependencies

- **Three.js** r128 - Loaded from CDN in index.html
- **Google Fonts** - Inter font family

## ⚡ Performance Tips

- CSS files are cached separately by the browser
- Consider minifying CSS/JS for production
- Compress images in the `assets/images/` folder
- Use lazy loading for quiz modal content

## 🐛 Troubleshooting

**Issue**: "CORS policy" or module loading errors
**Solution**: Must use a local web server (not `file://` protocol)

**Issue**: 3D scene doesn't load
**Solution**: Check browser console for Three.js errors, ensure CDN is accessible

**Issue**: Styles not loading
**Solution**: Verify CSS file paths in index.html are correct

---

**Version 1.0**: 6,758 lines (293 KB) → 10 modular files
**Version 2.0**: 9,556 lines (+2,798 new lines) → 18 modular files 🚀
**Version 2.1**: 10,200 lines (+644 photorealistic enhancements) → 18 modular files ✨

### File Statistics
- **Total Files**: 18 (7 CSS + 11 JS modules)
- **Total Lines of Code**: ~8,200 lines (distributed across modules)
- **New Code in v2.1**:
  - 644 lines of photorealistic materials and ultra-detailed components
  - 45+ new materials with physics-based rendering properties
  - Professional-grade hardware details (bolts, washers, clamps, bearings)
  - Realistic terrain system with drainage and natural grading
  - Complete site infrastructure (fencing, lighting, signage, security)
- **Largest Module**: siteBuilder3D.js (1,500+ lines of photorealistic 3D)

### Realism Features (Version 2.1)
- 🎨 **45+ Photorealistic Materials**: Industry-accurate PBR materials with weathering
- 🔩 **Engineering Details**: Hex bolts, lock washers, grease fittings, bearing assemblies
- 🌍 **Natural Terrain**: 80x80 resolution mesh with drainage slopes and soil variations
- 🔒 **Complete Security**: Chain-link fence, barbed wire, cameras, LED lighting
- ⚡ **Professional Equipment**: NEMA enclosures, stainless steel combiner boxes, certified signage
- 🌲 **Environmental Details**: Native vegetation, rocks, tire tracks, worn paths

Created with ❤️ by Ampacity Renewables
**Now with Museum-Quality Photorealistic Rendering** ✨
