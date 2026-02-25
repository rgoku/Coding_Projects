/**
 * Site Configuration Data
 * 
 * This module contains all valid site configurations for the solar farm builder.
 * Each configuration specifies a valid combination of:
 * - Module type (bifacial-600 or first-solar-525)
 * - Inverter type (distributed, centralized-cluster, or central)
 * - DC collection method (string-homeruns, harnesses, or trunk-bus)
 * - DC combination gear (none, combiner-boxes, or lbds)
 */

/**
 * Valid site configurations
 * Total of 13 valid configurations:
 * - 8 Bifacial 600W configurations (28 mods/string)
 * - 5 First Solar 525W configurations (6 mods/string)
 */
export const validSites = [
  // ═══ BIFACIAL 600W — 8 Valid Configurations (28 mods/string) ═══
  { module:"bifacial-600", inverter:"distributed", dcCollection:"string-homeruns", dcCombo:"none" },           // Bifacial 1
  { module:"bifacial-600", inverter:"centralized-cluster", dcCollection:"string-homeruns", dcCombo:"combiner-boxes" }, // Bifacial 2
  { module:"bifacial-600", inverter:"central", dcCollection:"string-homeruns", dcCombo:"combiner-boxes" },     // Bifacial 3
  { module:"bifacial-600", inverter:"distributed", dcCollection:"harnesses", dcCombo:"none" },                 // Bifacial 4
  { module:"bifacial-600", inverter:"centralized-cluster", dcCollection:"harnesses", dcCombo:"combiner-boxes" },       // Bifacial 5
  { module:"bifacial-600", inverter:"central", dcCollection:"harnesses", dcCombo:"combiner-boxes" },           // Bifacial 6
  { module:"bifacial-600", inverter:"centralized-cluster", dcCollection:"trunk-bus", dcCombo:"lbds" },         // Bifacial 7
  { module:"bifacial-600", inverter:"central", dcCollection:"trunk-bus", dcCombo:"lbds" },                     // Bifacial 8
  // ═══ FIRST SOLAR 525W — 5 Valid Configurations (6 mods/string) ═══
  { module:"first-solar-525", inverter:"distributed", dcCollection:"harnesses", dcCombo:"none" },              // First Solar 1
  { module:"first-solar-525", inverter:"centralized-cluster", dcCollection:"harnesses", dcCombo:"combiner-boxes" },    // First Solar 2
  { module:"first-solar-525", inverter:"central", dcCollection:"harnesses", dcCombo:"combiner-boxes" },        // First Solar 3
  { module:"first-solar-525", inverter:"centralized-cluster", dcCollection:"trunk-bus", dcCombo:"lbds" },      // First Solar 4
  { module:"first-solar-525", inverter:"central", dcCollection:"trunk-bus", dcCombo:"lbds" }                   // First Solar 5
];

/**
 * Site builder state
 * Tracks the current selection for each configuration field
 */
export const sbState = { 
  module: null, 
  inverter: null, 
  dcCollection: null, 
  dcCombo: null 
};

/**
 * Site configuration labels
 * Display names and descriptions for each configuration option
 */
export const siteLabels = {
  'bifacial-600': { title: 'Bifacial 600W', sub: '28 mods/string' },
  'first-solar-525': { title: 'First Solar 525W', sub: '6 mods/string' },
  'distributed': { title: 'Distributed String Inverters', sub: 'Inverters located at the array' },
  'centralized-cluster': { title: 'Centralized String Inverter Clusters', sub: 'Inverters grouped in clusters' },
  'central': { title: 'Central Inverters', sub: 'Central inverter stations' },
  'string-homeruns': { title: 'String Homeruns', sub: 'Individual string wiring' },
  'harnesses': { title: 'Harnesses', sub: 'Pre-assembled harness cabling' },
  'trunk-bus': { title: 'Trunk Bus', sub: 'Trunk cable with drop lines' },
  'combiner-boxes': { title: 'Combiner Boxes', sub: 'Combine string outputs' },
  'lbds': { title: "LBD's", sub: 'Load break disconnects' },
  'none': { title: 'None', sub: 'No DC combination gear' }
};
