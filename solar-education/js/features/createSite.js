// ═══════════════════════════════════════════════════════════
// Create Site Feature Module
// Extracted from solar-farm-v2 — Full-screen site builder
// with configuration wizard, 3D scene, navigation, legend
// ═══════════════════════════════════════════════════════════

import { createOrbitControls } from '../scene/orbitControls.js';
import { csBuildSite } from '../scene/createSite3D.js';

// ═══ VALID SITE CONFIGURATIONS ═══
const csValidSites = [
  { module: 'bifacial-600', inverter: 'distributed', dcCollection: 'string-homeruns', dcCombo: 'none' },
  { module: 'bifacial-600', inverter: 'centralized-cluster', dcCollection: 'harnesses', dcCombo: 'combiner-boxes' },
  { module: 'bifacial-600', inverter: 'central', dcCollection: 'harnesses', dcCombo: 'combiner-boxes' },
  { module: 'bifacial-600', inverter: 'centralized-cluster', dcCollection: 'trunk-bus', dcCombo: 'lbds' },
  { module: 'bifacial-600', inverter: 'central', dcCollection: 'trunk-bus', dcCombo: 'lbds' },
  { module: 'first-solar-525', inverter: 'distributed', dcCollection: 'string-homeruns', dcCombo: 'none' },
  { module: 'first-solar-525', inverter: 'centralized-cluster', dcCollection: 'harnesses', dcCombo: 'combiner-boxes' },
  { module: 'first-solar-525', inverter: 'central', dcCollection: 'harnesses', dcCombo: 'combiner-boxes' },
];

// ═══ FIELD ORDER ═══
const csFields = ['module', 'inverter', 'dcCollection', 'dcCombo'];

// ═══ MODULE STATE ═══
let csScene, csCamera, csRenderer, csControls;
let csSceneReady = false;
let csSigns = [];
let csWaypoints = [];
let flyState = null;
let navIdx = -1;
let csSelection = { module: null, inverter: null, dcCollection: null, dcCombo: null };
let csFrameId = null;
let csKeyHandler = null;
let csResizeHandler = null;

// ═══════════════════════════════════════════════════════════
// CONFIGURATION VALIDATION HELPERS
// ═══════════════════════════════════════════════════════════

// Check if a site config value matches a selection value
function csFieldMatch(siteVal, selVal) {
  if (!selVal) return true; // not yet selected — any value is ok
  return siteVal === selVal;
}

// Check if a hypothetical selection leads to at least one valid config
function csIsSelectionViable(testSelection) {
  return csValidSites.some(s =>
    csFieldMatch(s.module, testSelection.module) &&
    csFieldMatch(s.inverter, testSelection.inverter) &&
    csFieldMatch(s.dcCollection, testSelection.dcCollection) &&
    csFieldMatch(s.dcCombo, testSelection.dcCombo)
  );
}

// Check if the current full selection is a valid complete config
function csIsValidComplete() {
  if (!csSelection.module || !csSelection.inverter ||
      !csSelection.dcCollection || !csSelection.dcCombo) {
    return false;
  }
  return csValidSites.some(s =>
    s.module === csSelection.module &&
    s.inverter === csSelection.inverter &&
    s.dcCollection === csSelection.dcCollection &&
    s.dcCombo === csSelection.dcCombo
  );
}

// ═══════════════════════════════════════════════════════════
// WIZARD INNER HTML
// ═══════════════════════════════════════════════════════════
function csGetWizardHTML() {
  return `
    <div class="cs-header">
      <div class="cs-logo">\u{1F3D7}</div>
      <div class="cs-title">Create a Site</div>
      <div class="cs-subtitle">Select your solar site configuration \u2014 invalid options are automatically disabled</div>
      <button class="cs-close" id="csModalCloseBtn">\u2715</button>
    </div>

    <div class="cs-step-tabs">
      <div class="cs-step-tab" id="csSt0"><span class="cs-dot"></span> Module</div>
      <div class="cs-step-tab" id="csSt1"><span class="cs-dot"></span> Inverter</div>
      <div class="cs-step-tab" id="csSt2"><span class="cs-dot"></span> DC Collection</div>
      <div class="cs-step-tab" id="csSt3"><span class="cs-dot"></span> DC Combination</div>
    </div>

    <div class="cs-cfg-section">
      <div class="cs-cfg-label">\u25B8 Module / String Size</div>
      <div class="cs-cfg-cards cols-2" data-field="module">
        <div class="cs-cfg-card" data-field="module" data-value="bifacial-600">
          <div class="cs-cfg-card-title">Bifacial 600W</div>
          <div class="cs-cfg-card-sub">28 mods/string</div>
        </div>
        <div class="cs-cfg-card" data-field="module" data-value="first-solar-525">
          <div class="cs-cfg-card-title">First Solar 525W</div>
          <div class="cs-cfg-card-sub">6 mods/string</div>
        </div>
      </div>
    </div>

    <div class="cs-cfg-section">
      <div class="cs-cfg-label">\u25B8 Inverter Type</div>
      <div class="cs-cfg-cards cols-3" data-field="inverter">
        <div class="cs-cfg-card" data-field="inverter" data-value="distributed">
          <div class="cs-cfg-card-title">Distributed String Inverters</div>
          <div class="cs-cfg-card-sub">Individual inverters per string</div>
        </div>
        <div class="cs-cfg-card" data-field="inverter" data-value="centralized-cluster">
          <div class="cs-cfg-card-title">Centralized String Inverter Clusters</div>
          <div class="cs-cfg-card-sub">Grouped inverter clusters</div>
        </div>
        <div class="cs-cfg-card" data-field="inverter" data-value="central">
          <div class="cs-cfg-card-title">Central Inverters</div>
          <div class="cs-cfg-card-sub">Single large central inverter</div>
        </div>
      </div>
    </div>

    <div class="cs-cfg-section">
      <div class="cs-cfg-label">\u25B8 DC Collection</div>
      <div class="cs-cfg-cards cols-3" data-field="dcCollection">
        <div class="cs-cfg-card" data-field="dcCollection" data-value="string-homeruns">
          <div class="cs-cfg-card-title">String Homeruns</div>
          <div class="cs-cfg-card-sub">Direct wire runs from each string</div>
        </div>
        <div class="cs-cfg-card" data-field="dcCollection" data-value="harnesses">
          <div class="cs-cfg-card-title">Harnesses</div>
          <div class="cs-cfg-card-sub">Bundled cable assemblies</div>
        </div>
        <div class="cs-cfg-card" data-field="dcCollection" data-value="trunk-bus">
          <div class="cs-cfg-card-title">Trunk Bus</div>
          <div class="cs-cfg-card-sub">High-capacity bus system</div>
        </div>
      </div>
    </div>

    <div class="cs-cfg-section">
      <div class="cs-cfg-label">\u25B8 DC Combination</div>
      <div class="cs-cfg-cards cols-3" data-field="dcCombo">
        <div class="cs-cfg-card" data-field="dcCombo" data-value="combiner-boxes">
          <div class="cs-cfg-card-title">Combiner Boxes</div>
          <div class="cs-cfg-card-sub">Combine multiple string outputs</div>
        </div>
        <div class="cs-cfg-card" data-field="dcCombo" data-value="lbds">
          <div class="cs-cfg-card-title">LBD's</div>
          <div class="cs-cfg-card-sub">Load Break Disconnects</div>
        </div>
        <div class="cs-cfg-card" data-field="dcCombo" data-value="none">
          <div class="cs-cfg-card-title">None</div>
          <div class="cs-cfg-card-sub">No DC combination needed</div>
        </div>
      </div>
    </div>

    <div class="cs-footer">
      <div class="cs-status" id="csStatus">0 of 4 selected</div>
      <div style="display:flex;gap:8px;">
        <button class="cs-start-over" id="csStartOverBtn">\u21BB Start Over</button>
        <button class="cs-build-btn" id="csBuildBtn">Build Site \u25B8</button>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════
// OVERLAY VISIBILITY HELPERS
// ═══════════════════════════════════════════════════════════
function hideCSOverlays() {
  const ids = ['csUI', 'csInfo', 'csLegend', 'csLegendToggle', 'csEditBtn', 'csNav'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('visible');
  });
}

function showCSOverlays() {
  const ids = ['csUI', 'csInfo', 'csEditBtn', 'csNav'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('visible');
  });
}

// ═══════════════════════════════════════════════════════════
// EXPORTED: Open the Create Site modal
// ═══════════════════════════════════════════════════════════
export function openCreateSite() {
  const modal = document.getElementById('createSiteModal');
  if (!modal) return;

  // Initialize modal structure if not yet created
  if (!document.getElementById('csModalInner')) {
    modal.innerHTML = `
      <div id="csModalInner" class="cs-modal-inner"></div>
      <div id="csLoading" class="cs-loading">
        <div class="cs-spinner"></div>
        <p>Building your solar farm...</p>
      </div>
      <div id="csUI" class="cs-ui"></div>
      <div id="csInfo" class="cs-info"></div>
      <div id="csLegend" class="cs-legend"></div>
      <button id="csLegendToggle" class="cs-legend-toggle">Show Legend</button>
      <button id="csEditBtn" class="cs-edit-btn">\u270E Edit Configuration</button>
      <div id="csNav" class="cs-nav">
        <h3>Navigation</h3>
        <div id="csNavList" class="cs-nav-list"></div>
      </div>`;
  }

  modal.classList.add('active');

  // Reset state
  csSelection = { module: null, inverter: null, dcCollection: null, dcCombo: null };
  csSceneReady = false;

  // Show wizard, hide 3D overlays
  const inner = document.getElementById('csModalInner');
  if (inner) inner.style.display = '';

  const loading = document.getElementById('csLoading');
  if (loading) loading.classList.remove('active');

  hideCSOverlays();

  // Populate wizard HTML
  if (inner) {
    inner.innerHTML = csGetWizardHTML();
  }

  csSetupWizard();
  csUpdateUI();
}

// ═══════════════════════════════════════════════════════════
// EXPORTED: Close the Create Site modal
// ═══════════════════════════════════════════════════════════
export function closeCreateSite() {
  const modal = document.getElementById('createSiteModal');
  if (modal) modal.classList.remove('active');
  csDisposeScene();

  // Remove keyboard and resize listeners
  if (csKeyHandler) {
    window.removeEventListener('keydown', csKeyHandler);
    csKeyHandler = null;
  }
  if (csResizeHandler) {
    window.removeEventListener('resize', csResizeHandler);
    csResizeHandler = null;
  }
}

// ═══════════════════════════════════════════════════════════
// WIZARD SETUP — attaches click handlers to cards and buttons
// ═══════════════════════════════════════════════════════════
function csSetupWizard() {
  // Card click handlers
  const cards = document.querySelectorAll('#csModalInner .cs-cfg-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      if (card.classList.contains('cs-disabled')) return;
      const field = card.dataset.field;
      const value = card.dataset.value;
      csSelect(field, value);
    });
  });

  // Start Over button
  const startOverBtn = document.getElementById('csStartOverBtn');
  if (startOverBtn) {
    startOverBtn.addEventListener('click', csResetSelections);
  }

  // Build Site button
  const buildBtn = document.getElementById('csBuildBtn');
  if (buildBtn) {
    buildBtn.addEventListener('click', () => {
      if (csIsValidComplete()) {
        csBuildScene();
      }
    });
  }

  // Close button — goes back to 3D if scene exists, otherwise closes modal
  const closeBtn = document.getElementById('csModalCloseBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      if (csSceneReady) {
        const inner = document.getElementById('csModalInner');
        if (inner) inner.style.display = 'none';
        showCSOverlays();
      } else {
        closeCreateSite();
      }
    });
  }
}

// ═══════════════════════════════════════════════════════════
// SELECT A FIELD VALUE — updates selection, cascading resets
// ═══════════════════════════════════════════════════════════
function csSelect(field, value) {
  // Toggle: deselect if already selected
  if (csSelection[field] === value) {
    csSelection[field] = null;
  } else {
    csSelection[field] = value;
  }

  // Cascading reset: clear later fields that are no longer valid
  const fieldIdx = csFields.indexOf(field);
  if (fieldIdx >= 0) {
    for (let i = fieldIdx + 1; i < csFields.length; i++) {
      const laterField = csFields[i];
      if (csSelection[laterField]) {
        const test = { ...csSelection };
        if (!csIsSelectionViable(test)) {
          csSelection[laterField] = null;
        }
      }
    }
  }

  csUpdateUI();
}

// ═══════════════════════════════════════════════════════════
// RESET ALL SELECTIONS
// ═══════════════════════════════════════════════════════════
function csResetSelections() {
  csSelection = { module: null, inverter: null, dcCollection: null, dcCombo: null };
  csUpdateUI();
}

// ═══════════════════════════════════════════════════════════
// UPDATE UI — enable/disable cards, step tabs, status, build button
// ═══════════════════════════════════════════════════════════
function csUpdateUI() {
  // Enable/disable cards based on what's still valid
  csFields.forEach(field => {
    const cards = document.querySelectorAll(
      '#csModalInner .cs-cfg-card[data-field="' + field + '"]'
    );
    cards.forEach(card => {
      const val = card.dataset.value;
      const test = { ...csSelection };
      test[field] = val;
      const isValid = csIsSelectionViable(test);

      card.classList.toggle('cs-disabled', !isValid);
      card.classList.toggle('cs-selected', csSelection[field] === val);
    });
  });

  // Step tabs
  csFields.forEach((f, i) => {
    const tab = document.getElementById('csSt' + i);
    if (!tab) return;
    const filled = csSelection[f] !== null;
    tab.classList.toggle('done', filled);
    // Active = first unfilled step where all prior steps are filled
    const isActive = !filled && csFields.slice(0, i).every(pf => csSelection[pf] !== null);
    tab.classList.toggle('active', isActive);
  });

  // Status text and build button
  const count = csFields.filter(f => csSelection[f] !== null).length;
  const allSelected = count === 4;
  const isValidConfig = allSelected && csIsValidComplete();

  const statusEl = document.getElementById('csStatus');
  const buildBtn = document.getElementById('csBuildBtn');

  if (statusEl) {
    if (isValidConfig) {
      const modConfigs = csValidSites.filter(s => s.module === csSelection.module);
      const idx = modConfigs.findIndex(s =>
        s.inverter === csSelection.inverter &&
        s.dcCollection === csSelection.dcCollection &&
        s.dcCombo === csSelection.dcCombo
      );
      const moduleMax = csSelection.module === 'bifacial-600' ? 5 : 3;
      statusEl.textContent = '\u2705 Valid \u2014 Site ' + (idx >= 0 ? idx + 1 : '?') + ' of ' + moduleMax;
      statusEl.style.color = '#34d399';
    } else if (allSelected) {
      statusEl.textContent = '\u274C Invalid combination';
      statusEl.style.color = '#f87171';
    } else {
      statusEl.textContent = count + ' of 4 selected';
      statusEl.style.color = 'rgba(255,255,255,.3)';
    }
  }

  if (buildBtn) {
    buildBtn.classList.toggle('visible', isValidConfig);
  }
}

// ═══════════════════════════════════════════════════════════
// BUILD 3D SCENE
// ═══════════════════════════════════════════════════════════
function csBuildScene() {
  if (!csSelection.module || !csSelection.inverter ||
      !csSelection.dcCollection || !csSelection.dcCombo) return;

  // Show loading screen
  const loading = document.getElementById('csLoading');
  if (loading) loading.classList.add('active');

  const inner = document.getElementById('csModalInner');

  setTimeout(() => {
    // Dispose any previous scene
    csDisposeScene();

    // --- Create Three.js scene ---
    csScene = new THREE.Scene();
    csScene.background = new THREE.Color(0x87CEEB);
    csScene.fog = new THREE.FogExp2(0x87CEEB, 0.0012);

    // Camera
    csCamera = new THREE.PerspectiveCamera(
      50, window.innerWidth / window.innerHeight, 0.5, 1200
    );
    csCamera.position.set(-80, 60, 100);

    // Renderer
    csRenderer = new THREE.WebGLRenderer({ antialias: true });
    csRenderer.setSize(window.innerWidth, window.innerHeight);
    csRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    csRenderer.shadowMap.enabled = true;
    csRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    csRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    csRenderer.toneMappingExposure = 1.15;
    csRenderer.outputEncoding = THREE.sRGBEncoding;

    // Append renderer canvas to the modal
    const modal = document.getElementById('createSiteModal');
    if (modal) {
      modal.appendChild(csRenderer.domElement);
      csRenderer.domElement.style.position = 'absolute';
      csRenderer.domElement.style.top = '0';
      csRenderer.domElement.style.left = '0';
      csRenderer.domElement.style.zIndex = '0';
    }

    // OrbitControls
    csControls = createOrbitControls(csCamera, csRenderer.domElement);
    csControls.target.set(0, 2, 0);
    csControls.enableDamping = true;
    csControls.dampingFactor = 0.08;

    // --- Lighting ---
    const sun = new THREE.DirectionalLight(0xfff5e0, 1.6);
    sun.position.set(80, 100, -40);
    sun.castShadow = true;
    sun.shadow.mapSize.set(4096, 4096);
    sun.shadow.camera.left = -180;
    sun.shadow.camera.right = 180;
    sun.shadow.camera.top = 180;
    sun.shadow.camera.bottom = -180;
    sun.shadow.camera.far = 500;
    sun.shadow.bias = -0.0005;
    sun.shadow.normalBias = 0.02;
    csScene.add(sun);

    const fill = new THREE.DirectionalLight(0xaabbdd, 0.35);
    fill.position.set(-60, 30, 80);
    csScene.add(fill);

    csScene.add(new THREE.AmbientLight(0x8ab4f0, 0.42));
    csScene.add(new THREE.HemisphereLight(0x88bbff, 0x445522, 0.60));

    // --- Sky dome ---
    const skyGeo = new THREE.SphereGeometry(500, 16, 16);
    const skyMat = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x4488cc) },
        bottomColor: { value: new THREE.Color(0xccddee) },
        offset: { value: 20 },
        exponent: { value: 0.4 }
      },
      vertexShader: [
        'varying vec3 vWP;',
        'void main() {',
        '  vec4 wp = modelMatrix * vec4(position, 1.0);',
        '  vWP = wp.xyz;',
        '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
        '}'
      ].join('\n'),
      fragmentShader: [
        'uniform vec3 topColor;',
        'uniform vec3 bottomColor;',
        'uniform float offset;',
        'uniform float exponent;',
        'varying vec3 vWP;',
        'void main() {',
        '  float h = normalize(vWP + vec3(0, offset, 0)).y;',
        '  gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);',
        '}'
      ].join('\n'),
      side: THREE.BackSide
    });
    csScene.add(new THREE.Mesh(skyGeo, skyMat));

    // --- Determine configuration parameters ---
    const inv = csSelection.inverter;
    const dc = csSelection.dcCollection;
    const comb = csSelection.dcCombo;
    const isBi = csSelection.module === 'bifacial-600';
    const isFS = csSelection.module === 'first-solar-525';

    // --- Build the site geometry ---
    const result = csBuildSite(csScene, inv, dc, comb, isBi, isFS);
    csSigns = result.signs || [];
    csWaypoints = result.waypoints || [];
    csSceneReady = true;

    // --- Transition UI ---
    // Hide loading
    if (loading) loading.classList.remove('active');

    // Hide wizard inner
    if (inner) inner.style.display = 'none';

    // Show 3D overlays
    showCSOverlays();

    // Update info panel
    const infoEl = document.getElementById('csInfo');
    if (infoEl) {
      const modLabel = isFS ? 'First Solar S6+ 525W' : 'Bifacial 600W';
      const strLabel = isFS ? '6 modules/string' : '28 modules/string';
      infoEl.innerHTML =
        'Orbit: drag \u00B7 Zoom: scroll \u00B7 Pan: right-drag \u00B7 Keys: \u2190 \u2192 cycle \u00B7 1-9 jump<br>' +
        modLabel + ' \u00B7 ' + strLabel;
    }

    // Update header overlay
    const uiEl = document.getElementById('csUI');
    if (uiEl) {
      uiEl.innerHTML =
        '<h1>Ampacity Renewables</h1><div class="sub">3D Solar Farm \u2014 Create Site</div>';
    }

    // --- Start animation loop ---
    csAnimate();

    // --- Populate navigation panel ---
    csPopulateNav();

    // --- Build power flow legend ---
    csBuildLegend(dc, comb, inv, isBi, isFS);

    // --- Setup edit config and legend toggle buttons ---
    csSetupEditBtn();

    // --- Setup keyboard navigation ---
    csSetupKeyboard();

    // --- Setup resize handler ---
    csSetupResize();
  }, 100);
}

// ═══════════════════════════════════════════════════════════
// FLY-TO CAMERA ANIMATION
// ═══════════════════════════════════════════════════════════
function csFlyTo(target, cam, duration) {
  if (!csCamera || !csControls) return;
  const dur = duration || 1.5;
  flyState = {
    startPos: csCamera.position.clone(),
    startTarget: csControls.target.clone(),
    endPos: new THREE.Vector3(cam.x, cam.y, cam.z),
    endTarget: new THREE.Vector3(target.x, target.y, target.z),
    t: 0,
    dur: dur
  };
}

// ═══════════════════════════════════════════════════════════
// ANIMATION LOOP
// ═══════════════════════════════════════════════════════════
function csAnimate() {
  csFrameId = requestAnimationFrame(csAnimate);

  // Update fly-to camera animation
  if (flyState) {
    // Increment t based on duration: ~60fps, so dt is approx 1/60
    flyState.t += (1 / 60) / flyState.dur;

    if (flyState.t >= 1) {
      // Snap to final position
      csCamera.position.copy(flyState.endPos);
      csControls.target.copy(flyState.endTarget);
      flyState = null;
    } else {
      // Smooth ease-in-out (cubic)
      const t = flyState.t;
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      csCamera.position.lerpVectors(flyState.startPos, flyState.endPos, ease);
      csControls.target.lerpVectors(flyState.startTarget, flyState.endTarget, ease);
    }
  }

  // Update controls
  if (csControls && csControls.update) {
    csControls.update();
  }

  // Billboard signs — always face camera
  if (csSigns.length && csCamera) {
    for (let i = 0; i < csSigns.length; i++) {
      csSigns[i].lookAt(csCamera.position);
    }
  }

  // Render
  if (csRenderer && csScene && csCamera) {
    csRenderer.render(csScene, csCamera);
  }
}

// ═══════════════════════════════════════════════════════════
// NAVIGATION PANEL
// ═══════════════════════════════════════════════════════════
function csPopulateNav() {
  const list = document.getElementById('csNavList');
  if (!list) return;
  list.innerHTML = '';

  csWaypoints.forEach((wp, i) => {
    // Add separator after overview waypoint
    if (i === 1) {
      const sep = document.createElement('div');
      sep.className = 'cs-nav-sep';
      list.appendChild(sep);
    }

    const btn = document.createElement('button');
    btn.className = 'cs-nav-btn';

    const keyHint = i < 9
      ? '<span style="opacity:.35;font-size:9px;margin-left:auto">' + (i + 1) + '</span>'
      : '';
    btn.innerHTML =
      '<span class="cs-nav-dot" style="background:' + wp.color + '"></span>' +
      '<span style="flex:1">' + wp.name + '</span>' + keyHint;

    btn.addEventListener('click', () => {
      navIdx = i;
      csFlyTo(wp.target, wp.cam, wp.overview ? 2 : 1.5);
      csSetActiveNav(btn);
    });

    list.appendChild(btn);
  });
}

function csSetActiveNav(btn) {
  const allBtns = document.querySelectorAll('#csNavList .cs-nav-btn');
  allBtns.forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

// ═══════════════════════════════════════════════════════════
// POWER FLOW LEGEND
// ═══════════════════════════════════════════════════════════
function csBuildLegend(dc, comb, inv, isBi, isFS) {
  const leg = document.getElementById('csLegend');
  if (!leg) return;

  const modLabel = isFS ? 'First Solar S6+ 525W' : 'Bifacial 600W';

  const dcName = {
    'string-homeruns': 'String Homeruns',
    'harnesses': 'DC Harnesses (Y-Conn)',
    'trunk-bus': 'Trunk Bus'
  }[dc] || dc;

  const combName = {
    'none': 'Direct (No Combiner)',
    'combiner-boxes': 'Combiner Boxes',
    'lbds': 'Load Break Disconnects'
  }[comb] || comb;

  const invName = {
    'distributed': 'String Inverters (Distributed)',
    'centralized-cluster': 'Inverter Cluster (Centralized)',
    'central': 'Central Inverter'
  }[inv] || inv;

  let step = 1;
  let h = '<h3><span>Power Flow Path</span>' +
    '<button class="cs-leg-hide leg-hide" id="csLegHideBtn">Hide</button></h3>';

  // 1. Modules
  h += '<div class="cs-leg-item"><div class="cs-leg-color" style="background:#3858A0"></div>';
  h += '<div class="cs-leg-label">' + step + '. ' + modLabel + '</div></div>';
  h += '<div class="cs-leg-arrow">\u2193 USE-2 PV wire (red/black)</div>';
  step++;

  // 2. DC Collection
  h += '<div class="cs-leg-item"><div class="cs-leg-color" style="background:#EE6600"></div>';
  h += '<div class="cs-leg-label">' + step + '. ' + dcName + '</div></div>';
  h += '<div class="cs-leg-equip">Orange PVC conduit \u00B7 Sch 40</div>';
  step++;

  // 3. DC Combination (if applicable)
  if (comb !== 'none') {
    h += '<div class="cs-leg-arrow">\u2193 DC feeder conduit</div>';
    h += '<div class="cs-leg-item"><div class="cs-leg-color" style="background:#1560CC"></div>';
    h += '<div class="cs-leg-label">' + step + '. ' + combName + '</div></div>';
    h += '<div class="cs-leg-equip">Blue HDPE conduit \u00B7 direct buried</div>';
    step++;
  }

  // 4. Inverter
  h += '<div class="cs-leg-arrow">\u2193 DC/AC conversion</div>';
  h += '<div class="cs-leg-item"><div class="cs-leg-color" style="background:#1A7A68"></div>';
  h += '<div class="cs-leg-label">' + step + '. ' + invName + '</div></div>';
  step++;

  // 5. Transformer
  h += '<div class="cs-leg-arrow">\u2193 EMT conduit (AC)</div>';
  h += '<div class="cs-leg-item"><div class="cs-leg-color" style="background:#CCD0D8"></div>';
  h += '<div class="cs-leg-label">' + step + '. Step-Up Transformer</div></div>';
  h += '<div class="cs-leg-equip">Chrome EMT \u00B7 3-phase AC</div>';
  step++;

  // 6. Substation to Grid
  h += '<div class="cs-leg-arrow">\u2193 MV XLPE cable</div>';
  h += '<div class="cs-leg-item"><div class="cs-leg-color" style="background:#DDAA00"></div>';
  h += '<div class="cs-leg-label">' + step + '. Substation \u2192 Grid</div></div>';
  h += '<div class="cs-leg-equip">Yellow MV jacket \u00B7 34.5 kV</div>';

  leg.innerHTML = h;
  leg.classList.add('visible');

  // Hide the toggle button since legend is now visible
  const toggleBtn = document.getElementById('csLegendToggle');
  if (toggleBtn) toggleBtn.classList.remove('visible');

  // Setup hide button inside legend
  const hideBtn = document.getElementById('csLegHideBtn');
  if (hideBtn) {
    hideBtn.addEventListener('click', () => csToggleLegend(false));
  }
}

function csToggleLegend(show) {
  const leg = document.getElementById('csLegend');
  const btn = document.getElementById('csLegendToggle');
  if (show) {
    if (leg) leg.classList.add('visible');
    if (btn) btn.classList.remove('visible');
  } else {
    if (leg) leg.classList.remove('visible');
    if (btn) btn.classList.add('visible');
  }
}

// ═══════════════════════════════════════════════════════════
// EDIT CONFIGURATION BUTTON
// ═══════════════════════════════════════════════════════════
function csSetupEditBtn() {
  const editBtn = document.getElementById('csEditBtn');
  if (!editBtn) return;

  // Clone to remove old listeners
  const newBtn = editBtn.cloneNode(true);
  editBtn.parentNode.replaceChild(newBtn, editBtn);

  newBtn.addEventListener('click', () => {
    // Re-show wizard
    const inner = document.getElementById('csModalInner');
    if (inner) {
      inner.style.display = '';
      inner.innerHTML = csGetWizardHTML();
    }

    // Hide 3D overlays
    hideCSOverlays();

    // Re-setup wizard with current selections preserved
    csSetupWizard();
    csUpdateUI();
  });

  // Legend toggle button
  const legToggle = document.getElementById('csLegendToggle');
  if (legToggle) {
    const newToggle = legToggle.cloneNode(true);
    legToggle.parentNode.replaceChild(newToggle, legToggle);
    newToggle.addEventListener('click', () => csToggleLegend(true));
  }
}

// ═══════════════════════════════════════════════════════════
// KEYBOARD NAVIGATION
// ═══════════════════════════════════════════════════════════
function csSetupKeyboard() {
  // Remove previous handler if any
  if (csKeyHandler) {
    window.removeEventListener('keydown', csKeyHandler);
  }

  csKeyHandler = function (e) {
    if (!csSceneReady || !csWaypoints.length) return;

    // Only handle keys when modal is active and wizard is hidden (3D mode)
    const modal = document.getElementById('createSiteModal');
    if (!modal || !modal.classList.contains('active')) return;
    const inner = document.getElementById('csModalInner');
    if (inner && inner.style.display !== 'none') return;

    const key = e.key;

    // Number keys 1-9: jump to waypoint
    if (key >= '1' && key <= '9') {
      const i = parseInt(key) - 1;
      if (i < csWaypoints.length) {
        navIdx = i;
        const wp = csWaypoints[i];
        csFlyTo(wp.target, wp.cam, 1.5);
        const btns = document.querySelectorAll('#csNavList .cs-nav-btn');
        if (btns[i]) csSetActiveNav(btns[i]);
      }
      return;
    }

    // Arrow left/right: cycle through waypoints
    if (key === 'ArrowRight' || key === 'ArrowLeft') {
      e.preventDefault();
      const dir = key === 'ArrowRight' ? 1 : -1;
      navIdx = (navIdx + dir + csWaypoints.length) % csWaypoints.length;
      const wp = csWaypoints[navIdx];
      csFlyTo(wp.target, wp.cam, 1.2);
      const btns = document.querySelectorAll('#csNavList .cs-nav-btn');
      if (btns[navIdx]) csSetActiveNav(btns[navIdx]);
    }

    // Escape: close
    if (key === 'Escape') {
      closeCreateSite();
    }
  };

  window.addEventListener('keydown', csKeyHandler);
}

// ═══════════════════════════════════════════════════════════
// RESIZE HANDLER
// ═══════════════════════════════════════════════════════════
function csSetupResize() {
  if (csResizeHandler) {
    window.removeEventListener('resize', csResizeHandler);
  }

  csResizeHandler = function () {
    if (csCamera && csRenderer) {
      csCamera.aspect = window.innerWidth / window.innerHeight;
      csCamera.updateProjectionMatrix();
      csRenderer.setSize(window.innerWidth, window.innerHeight);
    }
  };

  window.addEventListener('resize', csResizeHandler);
}

// ═══════════════════════════════════════════════════════════
// DISPOSE SCENE — clean up all Three.js resources
// ═══════════════════════════════════════════════════════════
function csDisposeScene() {
  if (csFrameId) {
    cancelAnimationFrame(csFrameId);
    csFrameId = null;
  }

  if (csRenderer) {
    csRenderer.dispose();
    if (csRenderer.domElement && csRenderer.domElement.parentNode) {
      csRenderer.domElement.remove();
    }
  }

  if (csScene) {
    csScene.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => {
            if (m.map) m.map.dispose();
            m.dispose();
          });
        } else {
          if (obj.material.map) obj.material.map.dispose();
          obj.material.dispose();
        }
      }
    });
  }

  csScene = null;
  csCamera = null;
  csRenderer = null;
  csControls = null;
  csSceneReady = false;
  csSigns = [];
  csWaypoints = [];
  flyState = null;
  navIdx = -1;
}
