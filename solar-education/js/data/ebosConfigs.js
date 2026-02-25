// EBOS Site Designer - Configuration Data
// Converted from hsat-site-designer (1).jsx

export const EBOS_VALID_PATHS = [
  { module: "bifacial", inverter: "distributed", dcCollection: "homeruns", dcCombination: "none", id: "B1", cls: "A" },
  { module: "bifacial", inverter: "cluster", dcCollection: "harnesses", dcCombination: "combiner", id: "B2", cls: "B" },
  { module: "bifacial", inverter: "central", dcCollection: "harnesses", dcCombination: "combiner", id: "B3", cls: "C" },
  { module: "bifacial", inverter: "cluster", dcCollection: "trunk", dcCombination: "lbd", id: "B7", cls: "B" },
  { module: "bifacial", inverter: "central", dcCollection: "trunk", dcCombination: "lbd", id: "B8", cls: "C" },
  { module: "firstsolar", inverter: "distributed", dcCollection: "homeruns", dcCombination: "none", id: "FS1", cls: "A" },
  { module: "firstsolar", inverter: "cluster", dcCollection: "harnesses", dcCombination: "combiner", id: "FS2", cls: "B" },
  { module: "firstsolar", inverter: "central", dcCollection: "harnesses", dcCombination: "combiner", id: "FS3", cls: "C" },
  { module: "firstsolar", inverter: "cluster", dcCollection: "trunk", dcCombination: "lbd", id: "FS4", cls: "B" },
  { module: "firstsolar", inverter: "central", dcCollection: "trunk", dcCombination: "lbd", id: "FS5", cls: "C" },
];

export const EBOS_MOD = {
  bifacial: { name: "Bifacial 600W", sub: "28 mods/string", watt: 600, w: 1.134, h: 2.278, strLen: 28 },
  firstsolar: { name: "First Solar 525W", sub: "6 mods/string", watt: 525, w: 1.2, h: 2.0, strLen: 6 }
};

export const EBOS_INV_OPTS = [
  { key: "distributed", name: "Distributed String Inverters", sub: "Individual inverters per string", invPer: 3 },
  { key: "cluster", name: "Centralized String Inverter Clusters", sub: "Grouped inverter clusters", invPer: 8 },
  { key: "central", name: "Central Inverters", sub: "Single large central inverter", invPer: 16 }
];

export const EBOS_DCC_OPTS = [
  { key: "homeruns", name: "String Homeruns", sub: "Direct wire runs from each string" },
  { key: "harnesses", name: "Harnesses", sub: "Bundled cable assemblies" },
  { key: "trunk", name: "Trunk Bus", sub: "High-capacity bus system" }
];

export const EBOS_DCM_OPTS = [
  { key: "combiner", name: "Combiner Boxes", sub: "Combine multiple string outputs" },
  { key: "lbd", name: "LBD's", sub: "Load Break Disconnects" },
  { key: "none", name: "None", sub: "No DC combination needed" }
];

export const EBOS_STEPS = ["Module", "Inverter", "DC Collection", "DC Combination"];

// Theme colors
export const EBOS_THEME = {
  bg: "#0b1121", bgDeep: "#060b17",
  card: "#111c32", cardHover: "#162442", cardDisabled: "#0a0f1a",
  border: "#1c2d4a", borderActive: "#00b8d4", borderDim: "#152238",
  accent: "#00d4ff", accentGlow: "rgba(0,212,255,0.15)", accentBright: "#00e5ff",
  text: "#e4eaf6", textSub: "#6b82a8", textDim: "#3d5278", textDisabled: "#2a3a55",
  pink: "#ff4081", orange: "#ff9100", green: "#00e676", yellow: "#ffea00",
  red: "#ff5252", purple: "#b388ff", blue: "#448aff",
  dcColor: "#ff5252", acColor: "#00e676", mvColor: "#b388ff", trunkColor: "#ff9100",
  font: "'Segoe UI','SF Pro Display',-apple-system,sans-serif",
  fontMono: "'JetBrains Mono','SF Mono','Cascadia Code',monospace"
};

// Validation function - filters valid paths based on current selection
export function ebosGetValid(sel) {
  let r = [...EBOS_VALID_PATHS];
  if (sel.module) r = r.filter(p => p.module === sel.module);
  if (sel.inverter) r = r.filter(p => p.inverter === sel.inverter);
  if (sel.dcCollection) r = r.filter(p => p.dcCollection === sel.dcCollection);
  if (sel.dcCombination) r = r.filter(p => p.dcCombination === sel.dcCombination);
  return {
    modules: [...new Set(r.map(p => p.module))],
    inverters: [...new Set(r.map(p => p.inverter))],
    dcCollections: [...new Set(r.map(p => p.dcCollection))],
    dcCombinations: [...new Set(r.map(p => p.dcCombination))],
    matched: r.length === 1 ? r[0] : null,
    remaining: r
  };
}
