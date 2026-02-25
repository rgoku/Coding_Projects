// =============================================================================
// EBOS Site Designer — Vanilla JS Module
// Converted from hsat-site-designer (1).jsx (React → plain DOM/innerHTML)
// =============================================================================

import {
  EBOS_VALID_PATHS, EBOS_MOD, EBOS_INV_OPTS, EBOS_DCC_OPTS,
  EBOS_DCM_OPTS, EBOS_STEPS, EBOS_THEME, ebosGetValid
} from '../data/ebosConfigs.js';
import { buildLayout } from '../scene/ebosLayout.js';
import { ebosBuild3D, ebosCreateLabel } from '../scene/ebos3D.js';

// ---------------------------------------------------------------------------
// Shorthand alias for the theme
// ---------------------------------------------------------------------------
const T = EBOS_THEME;

// ---------------------------------------------------------------------------
// Module-scoped state (replaces React useState / useRef)
// ---------------------------------------------------------------------------
let ebosView = 'wizard';
let ebosSelection = { module: null, inverter: null, dcCollection: null, dcCombination: null };
let ebosSpatialParams = { rowLength: 140, postSpacing: 7, rowPitch: 6.5, blockRows: 12, blockCount: 4 };
let ebosSideTab = 'layout';
let ebosShowLeg = true;

// Three.js scene references
let ebosScene = null;
let ebosCamera = null;
let ebosRenderer = null;
let ebosFrameId = null;

// Camera state
let ebosCam = { theta: Math.PI / 5, phi: Math.PI / 4, dist: 60, tx: 0, ty: 3, tz: 0 };

// Mouse interaction state
let ebosMouseState = { down: false, btn: -1, lx: 0, ly: 0 };

// Computed state
let ebosMatched = null;
let ebosLayout = null;
let ebosConfig = null;

// Animation ref for camera direction transitions
let ebosAnimRef = null;

// Compass update interval
let ebosCompassInterval = null;

// Stored event listener references for cleanup
let ebosListeners = {};

// Resize handler reference
let ebosResizeHandler = null;

// ---------------------------------------------------------------------------
// PUBLIC: Open / Close the EBOS modal
// ---------------------------------------------------------------------------

export function openCreateEbosSite() {
  // Reset to wizard view
  ebosView = 'wizard';
  ebosSelection = { module: null, inverter: null, dcCollection: null, dcCombination: null };
  ebosSpatialParams = { rowLength: 140, postSpacing: 7, rowPitch: 6.5, blockRows: 12, blockCount: 4 };
  ebosSideTab = 'layout';
  ebosShowLeg = true;
  ebosCam = { theta: Math.PI / 5, phi: Math.PI / 4, dist: 60, tx: 0, ty: 3, tz: 0 };
  ebosMouseState = { down: false, btn: -1, lx: 0, ly: 0 };
  ebosMatched = null;
  ebosLayout = null;
  ebosConfig = null;

  const modal = document.getElementById('createEbosSiteModal');
  if (modal) {
    // Create inner content wrapper if not present
    if (!document.getElementById('ebosContent')) {
      modal.innerHTML = '<div id="ebosContent" style="width:100%;height:100%;"></div>';
    }
    modal.classList.add('active');
    ebosRenderWizard();
  }
}

export function closeCreateEbosSite() {
  ebosDispose3D();
  const modal = document.getElementById('createEbosSiteModal');
  if (modal) modal.classList.remove('active');
}

// ---------------------------------------------------------------------------
// WIZARD VIEW — full innerHTML rendering
// ---------------------------------------------------------------------------

function ebosRenderWizard() {
  const container = document.getElementById('ebosContent');
  if (!container) return;

  const valid = ebosGetValid(ebosSelection);
  const cnt = Object.values(ebosSelection).filter(Boolean).length;
  const curStep = !ebosSelection.module ? 0
    : !ebosSelection.inverter ? 1
    : !ebosSelection.dcCollection ? 2
    : !ebosSelection.dcCombination ? 3 : 4;
  const ok = cnt === 4 && valid.matched;

  // Build step indicators
  const stepsHTML = EBOS_STEPS.map((s, i) => {
    const done = (i === 0 && ebosSelection.module) || (i === 1 && ebosSelection.inverter) ||
                 (i === 2 && ebosSelection.dcCollection) || (i === 3 && ebosSelection.dcCombination);
    const active = i === curStep;
    return `
      <div style="display:flex;align-items:center;">
        <div style="display:flex;align-items:center;gap:6px;padding:6px 14px;border-radius:20px;
          background:${done ? T.accentGlow : active ? 'rgba(255,255,255,0.04)' : 'transparent'};
          border:1px solid ${done ? T.accent : active ? T.borderActive : 'transparent'};">
          <div style="width:8px;height:8px;border-radius:50%;
            background:${done ? T.accent : active ? T.accent : T.textDim};
            box-shadow:${done ? '0 0 8px ' + T.accent : 'none'};"></div>
          <span style="font-size:11px;font-weight:600;color:${done ? T.accent : active ? T.text : T.textDim};">${s}</span>
        </div>
        ${i < 3 ? `<div style="width:20px;height:1px;background:${done ? T.accent : T.borderDim};margin:0 2px;"></div>` : ''}
      </div>`;
  }).join('');

  // Module cards
  const moduleCards = Object.entries(EBOS_MOD).map(([k, v]) => {
    const sel = ebosSelection.module === k;
    const dis = !valid.modules.includes(k) && ebosSelection.module !== k;
    return ebosRenderOpt(v.name, v.sub, sel, dis, `ebosPick('module','${k}')`);
  }).join('');

  // Inverter cards
  const invCards = EBOS_INV_OPTS.map(o => {
    const sel = ebosSelection.inverter === o.key;
    const dis = !valid.inverters.includes(o.key) && ebosSelection.inverter !== o.key;
    return ebosRenderOpt(o.name, o.sub, sel, dis, `ebosPick('inverter','${o.key}')`);
  }).join('');

  // DC Collection cards
  const dccCards = EBOS_DCC_OPTS.map(o => {
    const sel = ebosSelection.dcCollection === o.key;
    const dis = !valid.dcCollections.includes(o.key) && ebosSelection.dcCollection !== o.key;
    return ebosRenderOpt(o.name, o.sub, sel, dis, `ebosPick('dcCollection','${o.key}')`);
  }).join('');

  // DC Combination cards
  const dcmCards = EBOS_DCM_OPTS.map(o => {
    const sel = ebosSelection.dcCombination === o.key;
    const dis = !valid.dcCombinations.includes(o.key) && ebosSelection.dcCombination !== o.key;
    return ebosRenderOpt(o.name, o.sub, sel, dis, `ebosPick('dcCombination','${o.key}')`);
  }).join('');

  container.innerHTML = `
    <div style="width:100%;height:100vh;background:${T.bgDeep};display:flex;align-items:center;justify-content:center;font-family:${T.font};overflow:auto;padding:20px;">
      <!-- Ambient glow -->
      <div style="position:fixed;top:30%;left:50%;width:600px;height:600px;
        background:radial-gradient(circle,rgba(0,180,220,0.04)0%,transparent 70%);
        transform:translate(-50%,-50%);pointer-events:none;"></div>

      <div style="width:100%;max-width:720px;background:${T.card};border-radius:16px;
        border:2px solid ${T.borderActive};
        box-shadow:0 0 60px rgba(0,180,220,0.08),0 20px 60px rgba(0,0,0,0.5);
        position:relative;overflow:hidden;">

        <!-- Top glow line -->
        <div style="position:absolute;top:0;left:10%;right:10%;height:1px;
          background:linear-gradient(90deg,transparent,${T.accentBright},transparent);"></div>

        <!-- Header -->
        <div style="padding:28px 32px 0;text-align:center;">
          <div style="display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:8px;">
            <div style="width:36px;height:36px;border-radius:8px;
              background:linear-gradient(135deg,#ff4081,#ff9100);
              display:flex;align-items:center;justify-content:center;
              font-size:18px;font-weight:800;color:#fff;
              box-shadow:0 4px 15px rgba(255,64,129,0.3);">E</div>
            <span style="font-size:22px;font-weight:700;color:${T.pink};">Create a Site</span>
            <!-- Close button -->
            <button onclick="window._ebosClose()"
              style="position:absolute;top:14px;right:18px;background:transparent;border:none;
              color:${T.textSub};font-size:22px;cursor:pointer;padding:4px 8px;
              border-radius:4px;line-height:1;"
              onmouseover="this.style.color='${T.text}'"
              onmouseout="this.style.color='${T.textSub}'">&times;</button>
          </div>
          <p style="font-size:13px;color:${T.textSub};margin:0 0 20px;">
            Select your solar site configuration — invalid options are automatically disabled</p>

          <!-- Step indicators -->
          <div style="display:flex;align-items:center;justify-content:center;margin-bottom:24px;">
            ${stepsHTML}
          </div>
        </div>

        <!-- Option Sections -->
        <div style="padding:0 28px 20px;display:flex;flex-direction:column;gap:20px;">
          <!-- Module -->
          <div>
            <div style="font-size:12px;font-weight:700;color:${T.orange};letter-spacing:0.8px;margin-bottom:10px;">&#9656; MODULE / STRING SIZE</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
              ${moduleCards}
            </div>
          </div>

          <!-- Inverter -->
          <div>
            <div style="font-size:12px;font-weight:700;color:${T.orange};letter-spacing:0.8px;margin-bottom:10px;">&#9656; INVERTER TYPE</div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">
              ${invCards}
            </div>
          </div>

          <!-- DC Collection -->
          <div>
            <div style="font-size:12px;font-weight:700;color:${T.orange};letter-spacing:0.8px;margin-bottom:10px;">&#9656; DC COLLECTION</div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">
              ${dccCards}
            </div>
          </div>

          <!-- DC Combination -->
          <div>
            <div style="font-size:12px;font-weight:700;color:${T.orange};letter-spacing:0.8px;margin-bottom:10px;">&#9656; DC COMBINATION</div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">
              ${dcmCards}
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="padding:16px 28px 24px;border-top:1px solid ${T.borderDim};
          display:flex;align-items:center;justify-content:space-between;">
          <span style="font-size:13px;color:${T.textSub};">
            <span style="color:${T.text};font-weight:600;">${cnt}</span> of 4 selected
          </span>
          <div style="display:flex;gap:10px;">
            <button onclick="window._ebosReset()"
              style="padding:9px 20px;border-radius:8px;border:1px solid ${T.border};
              background:transparent;color:${T.textSub};cursor:pointer;
              font-family:${T.font};font-size:13px;">&#8635; Start Over</button>
            <button onclick="${ok ? 'window._ebosBuild()' : ''}"
              ${!ok ? 'disabled' : ''}
              style="padding:9px 28px;border-radius:8px;border:none;
              background:${ok ? 'linear-gradient(135deg,' + T.accent + ',' + T.blue + ')' : T.cardDisabled};
              color:${ok ? '#000' : T.textDisabled};
              cursor:${ok ? 'pointer' : 'not-allowed'};
              font-family:${T.font};font-size:13px;font-weight:700;
              box-shadow:${ok ? '0 4px 20px rgba(0,212,255,0.25)' : 'none'};">Build Site &rarr;</button>
          </div>
        </div>
      </div>
    </div>`;

  // Attach global handlers for inline onclick
  window._ebosClose = closeCreateEbosSite;
  window._ebosReset = ebosResetWizard;
  window._ebosBuild = ebosStartDesigner;
  window.ebosPick = ebosPick;
}

// ---------------------------------------------------------------------------
// Option card renderer (returns HTML string)
// ---------------------------------------------------------------------------

function ebosRenderOpt(name, sub, sel, dis, onclickStr) {
  const d = dis && !sel;
  return `
    <button onclick="${d ? '' : onclickStr}"
      style="padding:14px;border-radius:10px;
        border:1.5px solid ${sel ? T.borderActive : d ? T.borderDim : T.border};
        background:${sel ? 'linear-gradient(135deg,rgba(0,180,220,0.12),rgba(0,212,255,0.06))' : d ? T.cardDisabled : T.bg};
        cursor:${d ? 'not-allowed' : 'pointer'};text-align:center;font-family:${T.font};
        opacity:${d ? '0.35' : '1'};
        box-shadow:${sel ? '0 0 20px rgba(0,212,255,0.08)' : 'none'};
        position:relative;overflow:hidden;transition:all 0.2s;"
      onmouseover="${d ? '' : `this.style.borderColor='rgba(0,212,255,0.3)';this.style.background='${sel ? 'linear-gradient(135deg,rgba(0,180,220,0.12),rgba(0,212,255,0.06))' : T.cardHover}'`}"
      onmouseout="${d ? '' : `this.style.borderColor='${sel ? T.borderActive : T.border}';this.style.background='${sel ? 'linear-gradient(135deg,rgba(0,180,220,0.12),rgba(0,212,255,0.06))' : T.bg}'`}">
      ${sel ? `<div style="position:absolute;top:0;left:20%;right:20%;height:1px;background:linear-gradient(90deg,transparent,${T.accent},transparent);"></div>` : ''}
      <div style="font-size:13px;font-weight:600;color:${sel ? T.text : d ? T.textDisabled : T.text};margin-bottom:4px;line-height:1.3;">${name}</div>
      <div style="font-size:10px;color:${sel ? T.textSub : d ? T.textDisabled : T.textDim};line-height:1.3;">${sub}</div>
    </button>`;
}

// ---------------------------------------------------------------------------
// Wizard interaction handlers
// ---------------------------------------------------------------------------

function ebosPick(cat, val) {
  const n = { ...ebosSelection };
  n[cat] = ebosSelection[cat] === val ? null : val;
  // Cascading resets
  if (cat === 'module') { n.inverter = null; n.dcCollection = null; n.dcCombination = null; }
  if (cat === 'inverter') { n.dcCollection = null; n.dcCombination = null; }
  if (cat === 'dcCollection') { n.dcCombination = null; }
  ebosSelection = n;
  ebosRenderWizard();
}

function ebosResetWizard() {
  ebosSelection = { module: null, inverter: null, dcCollection: null, dcCombination: null };
  ebosRenderWizard();
}

// ---------------------------------------------------------------------------
// Transition: Wizard → Designer
// ---------------------------------------------------------------------------

function ebosStartDesigner() {
  const valid = ebosGetValid(ebosSelection);
  if (!valid.matched) return;
  ebosMatched = valid.matched;
  ebosConfig = { ...ebosSelection };
  ebosView = 'designer';

  // Reset camera for new site
  ebosCam = { theta: Math.PI / 5, phi: Math.PI / 4, dist: 60, tx: 0, ty: 3, tz: 0 };

  ebosRenderDesigner();
}

// ---------------------------------------------------------------------------
// DESIGNER VIEW — full innerHTML rendering
// ---------------------------------------------------------------------------

function ebosRenderDesigner() {
  const container = document.getElementById('ebosContent');
  if (!container) return;

  // Compute layout
  ebosLayout = buildLayout(ebosConfig.module, ebosConfig, ebosSpatialParams);

  // Set initial camera distance based on layout size
  ebosCam.dist = Math.max(30, Math.min(ebosLayout.bounds.w, ebosLayout.bounds.h) * 0.7);

  const clsC = ebosMatched.cls === 'A' ? T.green : ebosMatched.cls === 'B' ? T.yellow : T.blue;
  const modInfo = EBOS_MOD[ebosConfig.module];
  const invLabel = ebosConfig.inverter === 'distributed' ? 'Distributed'
    : ebosConfig.inverter === 'cluster' ? 'Cluster' : 'Central';
  const dccLabel = ebosConfig.dcCollection === 'homeruns' ? 'Homeruns'
    : ebosConfig.dcCollection === 'harnesses' ? 'Harness' : 'Trunk Bus';

  // Header stats
  const statsData = [
    { l: 'MODULES', v: ebosLayout.stats.totalMods.toLocaleString() },
    { l: 'CAPACITY', v: ebosLayout.stats.totMW.toFixed(1) + ' MW', c: T.accent },
    { l: 'INVERTERS', v: ebosLayout.stats.invCnt },
    { l: 'BLOCKS', v: ebosSpatialParams.blockCount }
  ];
  const statsHTML = statsData.map(x => `
    <div style="text-align:center;">
      <div style="color:${T.textDim};letter-spacing:0.5px;">${x.l}</div>
      <div style="color:${x.c || T.text};font-weight:700;font-size:14px;">${x.v}</div>
    </div>`).join('');

  container.innerHTML = `
    <div style="width:100%;height:100vh;background:${T.bgDeep};font-family:${T.font};
      color:${T.text};display:flex;flex-direction:column;overflow:hidden;">

      <!-- HEADER BAR -->
      <div style="display:flex;align-items:center;justify-content:space-between;
        padding:8px 16px;border-bottom:1px solid ${T.border};flex-shrink:0;background:${T.card};">
        <div style="display:flex;align-items:center;gap:10px;">
          <button onclick="window._ebosBackToWizard()"
            style="background:${T.bg};border:1px solid ${T.border};color:${T.textSub};
            border-radius:6px;padding:5px 12px;cursor:pointer;font-family:${T.font};font-size:11px;">&#8592; Config</button>
          <span style="font-size:13px;font-weight:700;">${ebosMatched.id}</span>
          <span style="font-size:10px;padding:2px 8px;border-radius:4px;background:${clsC};
            color:#000;font-weight:800;">CLASS ${ebosMatched.cls}</span>
          <span style="font-size:11px;color:${T.textSub};">
            ${modInfo.name} &middot; ${invLabel} &middot; ${dccLabel}</span>
        </div>
        <div style="display:flex;gap:20px;font-size:10px;font-family:${T.fontMono};">
          ${statsHTML}
        </div>
        <button onclick="window._ebosClose()"
          style="background:transparent;border:1px solid ${T.border};color:${T.textSub};
          border-radius:6px;padding:5px 12px;cursor:pointer;font-family:${T.font};font-size:16px;line-height:1;"
          onmouseover="this.style.color='${T.text}'"
          onmouseout="this.style.color='${T.textSub}'">&times;</button>
      </div>

      <!-- MAIN AREA -->
      <div style="display:flex;flex:1;overflow:hidden;">

        <!-- 3D VIEWPORT -->
        <div style="flex:1;position:relative;">
          <div id="ebos3DMount" style="width:100%;height:100%;"></div>

          <!-- Navigation hint -->
          <div style="position:absolute;top:12px;left:12px;background:rgba(6,11,23,0.88);
            backdrop-filter:blur(10px);border-radius:10px;padding:10px 14px;
            border:1px solid ${T.border};font-size:11px;color:${T.textSub};line-height:1.6;">
            <div style="font-weight:700;color:${T.text};margin-bottom:4px;font-size:12px;">Navigation</div>
            <div>Left-drag &rarr; <span style="color:${T.accent};">Orbit</span></div>
            <div>Right-drag &rarr; <span style="color:${T.accent};">Pan</span></div>
            <div>Scroll &rarr; <span style="color:${T.accent};">Zoom</span></div>
          </div>

          <!-- Legend -->
          <div id="ebosLegendPanel" style="position:absolute;bottom:12px;left:12px;background:rgba(6,11,23,0.92);
            backdrop-filter:blur(10px);border-radius:10px;padding:${ebosShowLeg ? '12px 14px' : '8px 12px'};
            border:1px solid ${T.border};font-size:10px;transition:all 0.2s;">
            ${ebosRenderLegend()}
          </div>

          <!-- SVG Compass -->
          <div id="ebosCompassWrap" style="position:absolute;top:8px;right:8px;user-select:none;">
            ${ebosRenderCompass()}
          </div>
        </div>

        <!-- SIDE PANEL -->
        <div style="width:300px;flex-shrink:0;background:${T.card};border-left:1px solid ${T.border};
          display:flex;flex-direction:column;overflow:hidden;">

          <!-- Tabs -->
          <div style="display:flex;border-bottom:1px solid ${T.border};flex-shrink:0;">
            ${['layout', 'elec', 'stats'].map(tab => `
              <button onclick="window._ebosSetSideTab('${tab}')"
                style="flex:1;padding:8px;border:none;
                background:${ebosSideTab === tab ? T.bgDeep : 'transparent'};
                color:${ebosSideTab === tab ? T.accent : T.textDim};
                font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;
                cursor:pointer;font-family:${T.fontMono};
                border-bottom:${ebosSideTab === tab ? '2px solid ' + T.accent : '2px solid transparent'};">
                ${tab === 'layout' ? 'LAYOUT' : tab === 'elec' ? 'ELECTRICAL' : 'STATS'}</button>`).join('')}
          </div>

          <!-- Tab Content -->
          <div id="ebosSideContent" style="flex:1;overflow:auto;padding:14px;">
            ${ebosRenderSideTab()}
          </div>
        </div>
      </div>
    </div>`;

  // Wire up global handlers
  window._ebosClose = closeCreateEbosSite;
  window._ebosBackToWizard = ebosBackToWizard;
  window._ebosSetSideTab = ebosSetSideTab;
  window._ebosToggleLegend = ebosToggleLegend;
  window._ebosGoDir = ebosGoDir;

  // Initialize 3D scene
  const mountEl = document.getElementById('ebos3DMount');
  if (mountEl) ebosInit3D(mountEl);

  // Attach slider event delegation
  ebosAttachSliderListeners();

  // Start compass update interval
  if (ebosCompassInterval) clearInterval(ebosCompassInterval);
  ebosCompassInterval = setInterval(ebosUpdateCompass, 50);
}

// ---------------------------------------------------------------------------
// Legend renderer
// ---------------------------------------------------------------------------

function ebosRenderLegend() {
  const toggleBtn = `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;cursor:pointer;"
      onclick="window._ebosToggleLegend()">
      <div style="font-weight:700;color:${T.textDim};font-size:9px;letter-spacing:1px;">3D LEGEND</div>
      <div style="font-size:10px;color:${T.textSub};width:20px;height:20px;display:flex;align-items:center;
        justify-content:center;border-radius:4px;background:rgba(255,255,255,0.06);
        border:1px solid ${T.borderDim};">${ebosShowLeg ? '&#9662;' : '&#9656;'}</div>
    </div>`;

  if (!ebosShowLeg) return toggleBtn;

  const items = [
    ebosConfig.module === 'bifacial'
      ? { c: '#1c3a60', l: 'Bifacial Panels (blue cells + busbars)' }
      : { c: '#111111', l: 'First Solar Panels (black thin film)' },
    { c: '#ff6600', l: 'Nextracker Orange Badge' },
    { c: '#a5a5a5', l: 'Array Tech Fan Plate' },
    { c: '#1a3a8a', l: 'Drive Motor (blue)' },
    { c: '#a5a5a5', l: 'W-Beam Steel Posts' },
    ebosConfig.inverter === 'distributed' ? { c: '#2a2a2a', l: 'String Inverter (LEDs)' } : null,
    ebosConfig.dcCombination === 'combiner' ? { c: '#cc2222', l: 'Combiner Box' } : null,
    ebosConfig.dcCombination === 'lbd' ? { c: '#e08020', l: 'LBD' } : null,
    ebosConfig.inverter === 'cluster' ? { c: '#ccbb00', l: 'Cluster Inverter' } : null,
    ebosConfig.inverter === 'central' ? { c: '#3366cc', l: 'Central Inverter' } : null,
    ebosConfig.inverter === 'central' ? { c: '#8855cc', l: 'MV Transformer' } : null,
    { c: '#5522aa', l: 'Substation' },
    { c: '#6a6a55', l: 'Service Roads' },
    { c: '#ff2200', l: 'DC+ Cable (red)' },
    { c: '#2244aa', l: 'DC- Cable (blue)' },
    { c: '#00ff00', l: 'Ground Wire (green)' }
  ].filter(Boolean);

  const itemsHTML = items.map(it => `
    <div style="display:flex;align-items:center;gap:7px;margin-top:4px;">
      <div style="width:12px;height:12px;border-radius:3px;background:${it.c};
        border:1px solid rgba(255,255,255,0.1);flex-shrink:0;"></div>
      <span style="color:${T.textSub};">${it.l}</span>
    </div>`).join('');

  return toggleBtn + `<div style="margin-top:6px;">${itemsHTML}</div>`;
}

function ebosToggleLegend() {
  ebosShowLeg = !ebosShowLeg;
  const panel = document.getElementById('ebosLegendPanel');
  if (panel) {
    panel.style.padding = ebosShowLeg ? '12px 14px' : '8px 12px';
    panel.innerHTML = ebosRenderLegend();
  }
}

// ---------------------------------------------------------------------------
// SVG Compass renderer
// ---------------------------------------------------------------------------

function ebosRenderCompass() {
  const angle = ebosCam.theta;
  const degReadout = (((angle * 180 / Math.PI) % 360 + 360) % 360).toFixed(0);

  // Tick marks
  let ticks = '';
  for (let i = 0; i < 36; i++) {
    const a = i * 10 * Math.PI / 180;
    const inner = i % 9 === 0 ? 48 : i % 3 === 0 ? 53 : 56;
    const strokeColor = i % 9 === 0 ? 'rgba(0,212,255,0.5)' : 'rgba(100,130,170,0.25)';
    const sw = i % 9 === 0 ? 1.5 : 0.5;
    ticks += `<line x1="${Math.sin(a) * inner}" y1="${-Math.cos(a) * inner}" x2="${Math.sin(a) * 60}" y2="${-Math.cos(a) * 60}" stroke="${strokeColor}" stroke-width="${sw}"/>`;
  }

  // Diagonal lines
  let diags = '';
  [45, 135, 225, 315].forEach(a => {
    const r1 = 12, r2 = 38, rad = a * Math.PI / 180;
    diags += `<line x1="${Math.sin(rad) * r1}" y1="${-Math.cos(rad) * r1}" x2="${Math.sin(rad) * r2}" y2="${-Math.cos(rad) * r2}" stroke="rgba(100,130,170,0.15)" stroke-width="0.5"/>`;
  });

  return `
    <svg width="140" height="140" viewBox="-70 -70 140 140" style="filter:drop-shadow(0 4px 12px rgba(0,0,0,0.5));">
      <!-- Outer ring -->
      <circle cx="0" cy="0" r="65" fill="rgba(6,11,23,0.92)" stroke="rgba(28,45,74,0.8)" stroke-width="1.5"/>
      <circle cx="0" cy="0" r="58" fill="none" stroke="rgba(0,212,255,0.12)" stroke-width="0.5"/>
      <!-- Tick marks -->
      ${ticks}
      <!-- Rotating group -->
      <g id="ebosCompassNeedle" transform="rotate(${angle * 180 / Math.PI})">
        <!-- North needle -->
        <polygon points="0,-46 -6,-8 0,-14 6,-8" fill="#ff3344" opacity="0.9"/>
        <!-- South needle -->
        <polygon points="0,46 -6,8 0,14 6,8" fill="#556680" opacity="0.7"/>
        <!-- E/W lines -->
        <line x1="-42" y1="0" x2="-10" y2="0" stroke="rgba(100,130,170,0.3)" stroke-width="1"/>
        <line x1="10" y1="0" x2="42" y2="0" stroke="rgba(100,130,170,0.3)" stroke-width="1"/>
        <!-- Diagonals -->
        ${diags}
        <!-- Center diamond -->
        <polygon points="0,-6 6,0 0,6 -6,0" fill="rgba(0,212,255,0.3)" stroke="rgba(0,212,255,0.5)" stroke-width="0.5"/>
      </g>
      <!-- Fixed cardinal labels (clickable) -->
      <g style="cursor:pointer;" onclick="window._ebosGoDir(${-Math.PI / 2},${Math.PI / 5})">
        <circle cx="0" cy="-52" r="10" fill="rgba(255,51,68,0.15)" stroke="rgba(255,51,68,0.4)" stroke-width="0.8"/>
        <text x="0" y="-48" text-anchor="middle" fill="#ff3344" font-size="11" font-weight="800" font-family="${T.font}">N</text>
      </g>
      <g style="cursor:pointer;" onclick="window._ebosGoDir(${Math.PI / 2},${Math.PI / 5})">
        <circle cx="0" cy="52" r="10" fill="rgba(255,255,255,0.04)" stroke="rgba(100,130,170,0.3)" stroke-width="0.5"/>
        <text x="0" y="56" text-anchor="middle" fill="#6b82a8" font-size="10" font-weight="700" font-family="${T.font}">S</text>
      </g>
      <g style="cursor:pointer;" onclick="window._ebosGoDir(0,${Math.PI / 5})">
        <circle cx="52" cy="0" r="10" fill="rgba(255,255,255,0.04)" stroke="rgba(100,130,170,0.3)" stroke-width="0.5"/>
        <text x="52" y="4" text-anchor="middle" fill="#6b82a8" font-size="10" font-weight="700" font-family="${T.font}">E</text>
      </g>
      <g style="cursor:pointer;" onclick="window._ebosGoDir(${Math.PI},${Math.PI / 5})">
        <circle cx="-52" cy="0" r="10" fill="rgba(255,255,255,0.04)" stroke="rgba(100,130,170,0.3)" stroke-width="0.5"/>
        <text x="-52" y="4" text-anchor="middle" fill="#6b82a8" font-size="10" font-weight="700" font-family="${T.font}">W</text>
      </g>
      <!-- Center top-down button -->
      <g style="cursor:pointer;" onclick="window._ebosGoDir(${ebosCam.theta},0.08)">
        <circle cx="0" cy="0" r="8" fill="rgba(0,212,255,0.1)" stroke="rgba(0,212,255,0.4)" stroke-width="0.8"/>
        <circle cx="0" cy="0" r="3" fill="rgba(0,212,255,0.5)"/>
      </g>
      <!-- Degree readout -->
      <text id="ebosCompassDeg" x="0" y="38" text-anchor="middle" fill="rgba(0,212,255,0.5)" font-size="7" font-family="${T.fontMono}">${degReadout}&deg;</text>
    </svg>`;
}

function ebosUpdateCompass() {
  // Rotate the needle group
  const needle = document.getElementById('ebosCompassNeedle');
  if (needle) {
    needle.setAttribute('transform', `rotate(${ebosCam.theta * 180 / Math.PI})`);
  }
  // Update degree readout
  const degEl = document.getElementById('ebosCompassDeg');
  if (degEl) {
    const deg = (((ebosCam.theta * 180 / Math.PI) % 360 + 360) % 360).toFixed(0);
    degEl.textContent = deg + '\u00B0';
  }
}

// ---------------------------------------------------------------------------
// Camera direction animation (goDir)
// ---------------------------------------------------------------------------

function ebosGoDir(theta, phi) {
  if (ebosAnimRef) cancelAnimationFrame(ebosAnimRef);
  const st = ebosCam.theta, sp = ebosCam.phi, steps = 30;
  let i = 0;
  const dT = ((((theta - st) % (Math.PI * 2)) + (Math.PI * 3)) % (Math.PI * 2)) - Math.PI;
  const step = () => {
    i++;
    const t = 1 - Math.pow(1 - i / steps, 3);
    ebosCam.theta = st + dT * t;
    ebosCam.phi = sp + (phi - sp) * t;
    if (i < steps) ebosAnimRef = requestAnimationFrame(step);
  };
  step();
}

// ---------------------------------------------------------------------------
// Side tab switching & rendering
// ---------------------------------------------------------------------------

function ebosSetSideTab(tab) {
  ebosSideTab = tab;
  // Re-render just the tab buttons + content (avoid full re-render)
  ebosRenderDesigner();
}

function ebosRenderSideTab() {
  if (ebosSideTab === 'layout') return ebosRenderLayoutTab();
  if (ebosSideTab === 'elec') return ebosRenderElectricalTab();
  if (ebosSideTab === 'stats') return ebosRenderStatsTab();
  return '';
}

// ---------------------------------------------------------------------------
// LAYOUT tab
// ---------------------------------------------------------------------------

function ebosRenderLayoutTab() {
  const sp = ebosSpatialParams;
  return `
    <div style="display:flex;flex-direction:column;gap:12px;">
      ${ebosRenderSectionLabel('ROW GEOMETRY')}
      ${ebosRenderSlider('Row Length (m)', sp.rowLength, 60, 300, 5, 'rowLength')}
      ${ebosRenderSlider('Post Spacing (m)', sp.postSpacing, 4, 10, 0.5, 'postSpacing')}
      ${ebosRenderSlider('Row Pitch (m)', sp.rowPitch, 4, 10, 0.5, 'rowPitch')}
      ${ebosRenderSectionLabel('BLOCK STRUCTURE')}
      ${ebosRenderSlider('Rows per Block', sp.blockRows, 6, 20, 1, 'blockRows')}
      ${ebosRenderSlider('Block Count', sp.blockCount, 1, 12, 1, 'blockCount')}
      <div style="padding:10px;border-radius:6px;background:${T.bgDeep};border:1px solid ${T.border};
        font-size:10px;color:${T.textSub};line-height:1.6;">
        <span style="color:${T.accent};font-weight:700;">i </span>
        Components match the Ampacity Renewables style: W-beam posts,
        alternating Array Tech fan plates &amp; Nextracker orange badges,
        cylindrical torque tubes, teal cell panels with busbars,
        string inverters with LEDs.
      </div>
    </div>`;
}

// ---------------------------------------------------------------------------
// ELECTRICAL tab
// ---------------------------------------------------------------------------

function ebosRenderElectricalTab() {
  const clsC = ebosMatched.cls === 'A' ? T.green : ebosMatched.cls === 'B' ? T.yellow : T.blue;
  const modInfo = EBOS_MOD[ebosConfig.module];
  const dccLabel = ebosConfig.dcCollection === 'homeruns' ? 'String Homeruns'
    : ebosConfig.dcCollection === 'harnesses' ? 'Harnesses' : 'Trunk Bus';
  const dcmLabel = ebosConfig.dcCombination === 'none' ? 'None'
    : ebosConfig.dcCombination === 'combiner' ? 'Combiner Boxes' : 'LBDs';
  const invLabel = ebosConfig.inverter === 'distributed' ? 'Distributed'
    : ebosConfig.inverter === 'cluster' ? 'Cluster' : 'Central';

  return `
    <div style="display:flex;flex-direction:column;gap:12px;">
      ${ebosRenderSectionLabel('CONFIGURATION')}
      <div style="padding:10px;border-radius:8px;border:1px solid ${clsC};background:${clsC}11;">
        <div style="font-weight:700;font-size:12px;">${ebosMatched.id} &mdash; Class ${ebosMatched.cls}</div>
        <div style="font-size:10px;color:${T.textSub};margin-top:4px;">${modInfo.name}</div>
      </div>

      ${ebosRenderSectionLabel('HIERARCHY')}
      ${ebosRenderChain()}

      ${ebosRenderSectionLabel('TOPOLOGY')}
      ${ebosRenderInfoRow('DC Collection', dccLabel)}
      ${ebosRenderInfoRow('DC Combination', dcmLabel)}
      ${ebosRenderInfoRow('Inverter', invLabel)}

      ${ebosRenderSectionLabel('HARD CONSTRAINTS')}
      <div style="padding:10px;border-radius:6px;background:rgba(255,82,82,0.05);
        border:1px solid rgba(255,82,82,0.15);font-size:10px;color:${T.textSub};line-height:1.7;">
        &#128274; No harness + trunk bus mixing<br/>
        &#128274; No LBDs without trunk bus<br/>
        &#128274; No string homeruns for First Solar<br/>
        &#128274; No DC equipment inline with trackers<br/>
        &#128274; String lengths locked
      </div>
    </div>`;
}

// ---------------------------------------------------------------------------
// STATS tab
// ---------------------------------------------------------------------------

function ebosRenderStatsTab() {
  const s = ebosLayout.stats;
  const sp = ebosSpatialParams;
  const modInfo = EBOS_MOD[ebosConfig.module];

  return `
    <div style="display:flex;flex-direction:column;gap:10px;">
      ${ebosRenderSectionLabel('SITE SUMMARY')}
      ${ebosRenderStatRow('Total Capacity', s.totMW.toFixed(2) + ' MW', true)}
      ${ebosRenderStatRow('Total Modules', s.totalMods.toLocaleString())}
      ${ebosRenderStatRow('Total Strings', s.totalStrs.toLocaleString())}
      ${ebosRenderStatRow('Inverters', s.invCnt)}

      ${ebosRenderSectionLabel('PER ROW')}
      ${ebosRenderStatRow('Modules / Row', s.modsPerRow)}
      ${ebosRenderStatRow('Strings / Row', s.strsPerRow)}
      ${ebosRenderStatRow('Row Length', s.actLen.toFixed(1) + ' m')}
      ${ebosRenderStatRow('Posts / Row', s.numPosts)}

      ${ebosRenderSectionLabel('PER BLOCK')}
      ${ebosRenderStatRow('Block Power', s.blkKW.toFixed(0) + ' kW')}
      ${ebosRenderStatRow('Rows / Block', sp.blockRows)}

      ${ebosRenderSectionLabel('MODULE')}
      ${ebosRenderStatRow('Type', modInfo.name)}
      ${ebosRenderStatRow('Rating', modInfo.watt + 'W')}
      ${ebosRenderStatRow('String Length', modInfo.strLen + ' modules')}
    </div>`;
}

// ---------------------------------------------------------------------------
// Shared UI sub-components (return HTML strings)
// ---------------------------------------------------------------------------

function ebosRenderSectionLabel(text) {
  return `<div style="font-size:9px;color:${T.textDim};letter-spacing:1px;font-weight:700;font-family:${T.fontMono};margin-top:4px;">${text}</div>`;
}

function ebosRenderInfoRow(label, value) {
  return `
    <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid ${T.borderDim};font-size:11px;">
      <span style="color:${T.textSub};">${label}</span>
      <span style="color:${T.text};font-weight:600;">${value}</span>
    </div>`;
}

function ebosRenderStatRow(label, value, accent) {
  return `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:7px 10px;
      border-radius:6px;background:${T.bgDeep};border:1px solid ${T.borderDim};">
      <span style="font-size:10px;color:${T.textDim};font-family:${T.fontMono};">${label}</span>
      <span style="font-size:${accent ? '14' : '12'}px;font-weight:700;
        color:${accent ? T.accent : T.text};font-family:${T.fontMono};">${value}</span>
    </div>`;
}

// ---------------------------------------------------------------------------
// Chain rendering (electrical hierarchy)
// ---------------------------------------------------------------------------

function ebosRenderChain() {
  const steps = ['MODULE', 'STRING'];
  if (ebosConfig.dcCollection === 'harnesses') steps.push('HARNESS');
  if (ebosConfig.dcCollection === 'trunk') steps.push('TRUNK BUS');
  if (ebosConfig.dcCombination === 'combiner') steps.push('COMBINER');
  if (ebosConfig.dcCombination === 'lbd') steps.push('LBD');
  steps.push(
    ebosConfig.inverter === 'distributed' ? 'STR INV'
    : ebosConfig.inverter === 'cluster' ? 'CLUST INV' : 'CENT INV'
  );
  steps.push('MV XFMR', 'MV COLL', 'SUBSTATION');

  const cm = {
    'MODULE': '#64748b', 'STRING': '#94a3b8',
    'HARNESS': T.dcColor, 'TRUNK BUS': T.trunkColor,
    'COMBINER': T.dcColor, 'LBD': T.trunkColor,
    'STR INV': T.green, 'CLUST INV': T.yellow, 'CENT INV': T.blue,
    'MV XFMR': T.mvColor, 'MV COLL': T.mvColor, 'SUBSTATION': '#7c3aed'
  };

  const html = steps.map((x, i) => `
    <div style="display:flex;align-items:center;gap:3px;">
      <span style="font-size:8px;font-weight:700;padding:2px 5px;border-radius:3px;
        background:${cm[x] || T.textDim};color:#000;white-space:nowrap;">${x}</span>
      ${i < steps.length - 1 ? `<span style="color:${T.textDim};font-size:9px;">&rarr;</span>` : ''}
    </div>`).join('');

  return `<div style="display:flex;flex-wrap:wrap;gap:3px;align-items:center;">${html}</div>`;
}

// ---------------------------------------------------------------------------
// Slider renderer
// ---------------------------------------------------------------------------

function ebosRenderSlider(label, value, min, max, step, paramKey) {
  const pct = ((value - min) / (max - min)) * 100;
  const displayVal = Number.isInteger(step) ? value : Number(value).toFixed(1);

  return `
    <div>
      <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
        <span style="font-size:10px;color:${T.textSub};">${label}</span>
        <span class="ebos-slider-val" data-param="${paramKey}"
          style="font-size:10px;color:${T.accent};font-weight:600;font-family:${T.fontMono};">${displayVal}</span>
      </div>
      <div style="position:relative;height:18px;display:flex;align-items:center;">
        <div style="position:absolute;width:100%;height:3px;background:${T.borderDim};border-radius:2px;"></div>
        <div class="ebos-slider-fill" data-param="${paramKey}"
          style="position:absolute;width:${pct}%;height:3px;background:${T.accent};border-radius:2px;"></div>
        <input type="range" class="ebos-slider-input" data-param="${paramKey}"
          min="${min}" max="${max}" step="${step}" value="${value}"
          style="position:absolute;width:100%;height:18px;opacity:0;cursor:pointer;margin:0;" />
        <div class="ebos-slider-thumb" data-param="${paramKey}"
          style="position:absolute;left:calc(${pct}% - 6px);width:12px;height:12px;border-radius:50%;
          background:${T.accent};border:2px solid ${T.bgDeep};pointer-events:none;
          box-shadow:0 0 6px rgba(0,212,255,0.3);"></div>
      </div>
    </div>`;
}

// ---------------------------------------------------------------------------
// Slider event delegation
// ---------------------------------------------------------------------------

function ebosAttachSliderListeners() {
  const sideContent = document.getElementById('ebosSideContent');
  if (!sideContent) return;

  sideContent.addEventListener('input', (e) => {
    if (!e.target.classList.contains('ebos-slider-input')) return;
    const paramKey = e.target.dataset.param;
    const val = parseFloat(e.target.value);
    ebosSpatialParams[paramKey] = val;

    // Update visual elements immediately (without full re-render)
    const step = parseFloat(e.target.step);
    const min = parseFloat(e.target.min);
    const max = parseFloat(e.target.max);
    const pct = ((val - min) / (max - min)) * 100;
    const displayVal = Number.isInteger(step) ? val : val.toFixed(1);

    // Update value display
    const valEl = sideContent.querySelector(`.ebos-slider-val[data-param="${paramKey}"]`);
    if (valEl) valEl.textContent = displayVal;

    // Update fill bar
    const fillEl = sideContent.querySelector(`.ebos-slider-fill[data-param="${paramKey}"]`);
    if (fillEl) fillEl.style.width = pct + '%';

    // Update thumb position
    const thumbEl = sideContent.querySelector(`.ebos-slider-thumb[data-param="${paramKey}"]`);
    if (thumbEl) thumbEl.style.left = `calc(${pct}% - 6px)`;

    // Rebuild 3D scene
    ebosRebuild3D();
  });
}

// ---------------------------------------------------------------------------
// 3D Scene initialisation
// ---------------------------------------------------------------------------

function ebosInit3D(mountEl) {
  if (!mountEl || typeof THREE === 'undefined') return;

  const w = mountEl.clientWidth, h = mountEl.clientHeight;

  // Scene
  ebosScene = new THREE.Scene();

  // Camera
  ebosCamera = new THREE.PerspectiveCamera(50, w / h, 0.1, 1500);

  // Renderer
  ebosRenderer = new THREE.WebGLRenderer({ antialias: true });
  ebosRenderer.setSize(w, h);
  ebosRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  ebosRenderer.shadowMap.enabled = true;
  ebosRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
  ebosRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  ebosRenderer.toneMappingExposure = 1.2;
  mountEl.appendChild(ebosRenderer.domElement);

  // Build 3D content
  ebosBuild3D(ebosScene, ebosLayout, ebosConfig);

  // ---- Mouse / Touch / Wheel handlers ----
  const de = ebosRenderer.domElement;

  const onMouseDown = (e) => {
    ebosMouseState = { down: true, btn: e.button, lx: e.clientX, ly: e.clientY };
  };

  const onMouseMove = (e) => {
    if (!ebosMouseState.down) return;
    const dx = e.clientX - ebosMouseState.lx;
    const dy = e.clientY - ebosMouseState.ly;
    ebosMouseState.lx = e.clientX;
    ebosMouseState.ly = e.clientY;

    if (ebosMouseState.btn === 0) {
      // Orbit
      ebosCam.theta -= dx * 0.004;
      ebosCam.phi = Math.max(0.05, Math.min(Math.PI / 2 - 0.02, ebosCam.phi - dy * 0.004));
    } else {
      // Pan
      const s2 = ebosCam.dist * 0.0015;
      const st = Math.sin(ebosCam.theta), ct = Math.cos(ebosCam.theta);
      ebosCam.tx += (-dx * ct - dy * st * Math.cos(ebosCam.phi)) * s2;
      ebosCam.tz += (-dx * st + dy * ct * Math.cos(ebosCam.phi)) * s2;
      ebosCam.ty = Math.max(0, ebosCam.ty + dy * Math.sin(ebosCam.phi) * s2);
    }
  };

  const onMouseUp = () => { ebosMouseState.down = false; };

  const onWheel = (e) => {
    e.preventDefault();
    ebosCam.dist = Math.max(3, Math.min(400, ebosCam.dist * (1 + e.deltaY * 0.001)));
  };

  const onContext = (e) => { e.preventDefault(); };

  const onTouchStart = (e) => {
    if (e.touches.length === 1) {
      ebosMouseState = { down: true, btn: 0, lx: e.touches[0].clientX, ly: e.touches[0].clientY };
    }
  };

  const onTouchMove = (e) => {
    if (!ebosMouseState.down || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - ebosMouseState.lx;
    const dy = e.touches[0].clientY - ebosMouseState.ly;
    ebosMouseState.lx = e.touches[0].clientX;
    ebosMouseState.ly = e.touches[0].clientY;
    ebosCam.theta -= dx * 0.004;
    ebosCam.phi = Math.max(0.05, Math.min(Math.PI / 2 - 0.02, ebosCam.phi - dy * 0.004));
  };

  const onTouchEnd = () => { ebosMouseState.down = false; };

  de.addEventListener('mousedown', onMouseDown);
  de.addEventListener('mousemove', onMouseMove);
  de.addEventListener('mouseup', onMouseUp);
  de.addEventListener('mouseleave', onMouseUp);
  de.addEventListener('wheel', onWheel, { passive: false });
  de.addEventListener('contextmenu', onContext);
  de.addEventListener('touchstart', onTouchStart);
  de.addEventListener('touchmove', onTouchMove);
  de.addEventListener('touchend', onTouchEnd);

  // Store references for cleanup
  ebosListeners = {
    de, onMouseDown, onMouseMove, onMouseUp, onWheel, onContext,
    onTouchStart, onTouchMove, onTouchEnd
  };

  // Resize handler
  ebosResizeHandler = () => {
    const nw = mountEl.clientWidth, nh = mountEl.clientHeight;
    if (nw === 0 || nh === 0) return;
    ebosCamera.aspect = nw / nh;
    ebosCamera.updateProjectionMatrix();
    ebosRenderer.setSize(nw, nh);
  };
  window.addEventListener('resize', ebosResizeHandler);

  // Animation loop
  const animate = () => {
    ebosFrameId = requestAnimationFrame(animate);
    const c = ebosCam;
    ebosCamera.position.x = c.tx + c.dist * Math.sin(c.phi) * Math.cos(c.theta);
    ebosCamera.position.y = c.ty + c.dist * Math.cos(c.phi);
    ebosCamera.position.z = c.tz + c.dist * Math.sin(c.phi) * Math.sin(c.theta);
    ebosCamera.lookAt(c.tx, c.ty, c.tz);
    ebosRenderer.render(ebosScene, ebosCamera);
  };
  animate();
}

// ---------------------------------------------------------------------------
// Dispose 3D
// ---------------------------------------------------------------------------

function ebosDispose3D() {
  // Stop animation loop
  if (ebosFrameId) {
    cancelAnimationFrame(ebosFrameId);
    ebosFrameId = null;
  }

  // Stop compass interval
  if (ebosCompassInterval) {
    clearInterval(ebosCompassInterval);
    ebosCompassInterval = null;
  }

  // Stop camera animation
  if (ebosAnimRef) {
    cancelAnimationFrame(ebosAnimRef);
    ebosAnimRef = null;
  }

  // Remove resize handler
  if (ebosResizeHandler) {
    window.removeEventListener('resize', ebosResizeHandler);
    ebosResizeHandler = null;
  }

  // Remove event listeners from renderer canvas
  if (ebosListeners.de) {
    const L = ebosListeners;
    L.de.removeEventListener('mousedown', L.onMouseDown);
    L.de.removeEventListener('mousemove', L.onMouseMove);
    L.de.removeEventListener('mouseup', L.onMouseUp);
    L.de.removeEventListener('mouseleave', L.onMouseUp);
    L.de.removeEventListener('wheel', L.onWheel);
    L.de.removeEventListener('contextmenu', L.onContext);
    L.de.removeEventListener('touchstart', L.onTouchStart);
    L.de.removeEventListener('touchmove', L.onTouchMove);
    L.de.removeEventListener('touchend', L.onTouchEnd);
    ebosListeners = {};
  }

  // Remove renderer DOM element and dispose
  if (ebosRenderer) {
    const domEl = ebosRenderer.domElement;
    if (domEl && domEl.parentNode) {
      domEl.parentNode.removeChild(domEl);
    }
    ebosRenderer.dispose();
    ebosRenderer = null;
  }

  // Clean up Three.js scene
  if (ebosScene) {
    ebosScene.traverse((obj) => {
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
    while (ebosScene.children.length > 0) ebosScene.remove(ebosScene.children[0]);
    ebosScene = null;
  }

  ebosCamera = null;
}

// ---------------------------------------------------------------------------
// Rebuild 3D (after slider change)
// ---------------------------------------------------------------------------

function ebosRebuild3D() {
  if (!ebosScene || !ebosConfig) return;

  // Recalculate layout
  ebosLayout = buildLayout(ebosConfig.module, ebosConfig, ebosSpatialParams);

  // Rebuild scene content
  ebosBuild3D(ebosScene, ebosLayout, ebosConfig);

  // Update header stats (quick DOM updates)
  ebosUpdateHeaderStats();
}

function ebosUpdateHeaderStats() {
  // The header is part of the full innerHTML so we do a targeted approach
  // by simply re-rendering the designer. For performance, we avoid full
  // re-render and just update inline. But since the header is in the same
  // container, a lightweight approach is to only update stats text nodes.
  // For simplicity and correctness, we just do nothing extra here -- the
  // 3D scene is rebuilt and stats will update on next tab render.
  // However we CAN update the stats tab if it's currently active:
  if (ebosSideTab === 'stats') {
    const sideContent = document.getElementById('ebosSideContent');
    if (sideContent) sideContent.innerHTML = ebosRenderStatsTab();
  }
}

// ---------------------------------------------------------------------------
// Back to wizard
// ---------------------------------------------------------------------------

function ebosBackToWizard() {
  ebosDispose3D();
  ebosView = 'wizard';
  ebosConfig = null;
  ebosMatched = null;
  ebosRenderWizard();
}
