/**
 * Generates the three JSON files in static/data/ from DrawTabData submodule.
 * Run: node scripts/generate-data.js
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';

mkdirSync('static/data', { recursive: true });

const DATA_DIR = 'data-repo/data';

// --- Load DrawTabData ---

function loadJSON(path) {
  return JSON.parse(readFileSync(path, 'utf-8'));
}

const wacomPens = loadJSON(`${DATA_DIR}/pens/WACOM-pens.json`).Pens;
const wacomPenFamilies = loadJSON(`${DATA_DIR}/pen-families/WACOM-pen-families.json`).PenFamilies;
const wacomTablets = loadJSON(`${DATA_DIR}/tablets/WACOM-tablets.json`).DrawingTablets;
const wacomTabletFamilies = loadJSON(`${DATA_DIR}/tablet-families/WACOM-tablet-families.json`).TabletFamilies;
const wacomPenCompat = loadJSON(`${DATA_DIR}/pen-compat/WACOM-pen-compat.json`).PenCompat;

// --- Generate wacom-pens.json ---

const pensOutput = {
  penfamilydefs: wacomPenFamilies.map(f => ({
    brand: "wacom",
    id: f.FamilyId,
    name: f.FamilyName,
  })),
  pendefs: wacomPens.map(p => ({
    brand: "wacom",
    familyid: p.PenFamily || "",
    id: p.PenId,
    name: p.PenName,
    year: p.PenYear || "",
  })),
};

writeFileSync('static/data/wacom-pens.json', JSON.stringify(pensOutput, null, 4));
console.log(`wacom-pens.json: ${pensOutput.penfamilydefs.length} families, ${pensOutput.pendefs.length} pens`);

// --- Generate wacom-tablets.json ---

const tabletsOutput = {
  tabletfamilydefs: wacomTabletFamilies.map(f => ({
    brand: "wacom",
    id: f.FamilyId,
    name: f.FamilyName,
  })),
  tabletdefs: wacomTablets.map(t => ({
    brand: "wacom",
    familyid: t.ModelFamily || "",
    id: t.ModelId,
    name: t.ModelName,
    type: (t.ModelType || "pentablet").toLowerCase(),
  })),
};

writeFileSync('static/data/wacom-tablets.json', JSON.stringify(tabletsOutput, null, 4));
console.log(`wacom-tablets.json: ${tabletsOutput.tabletfamilydefs.length} families, ${tabletsOutput.tabletdefs.length} tablets`);

// --- Generate wacom-pen-compat.json ---
// DrawTabData format: [{PenId, TabletIds: [...]}]
// App format: [{tablets: [...], pens: [...]}]
// Convert: each DrawTabData entry becomes {tablets: TabletIds, pens: [PenId]}

const compatOutput = {
  compatrows: wacomPenCompat.map(entry => ({
    tablets: entry.TabletIds,
    pens: [entry.PenId],
  })),
};

writeFileSync('static/data/wacom-pen-compat.json', JSON.stringify(compatOutput, null, 4));
console.log(`wacom-pen-compat.json: ${compatOutput.compatrows.length} compat rows`);

console.log('\nDone. Generated static/data/ from data-repo/.');
