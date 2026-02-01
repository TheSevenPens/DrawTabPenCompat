/**
 * Fetches and parses a compatibility XML file.
 * @param {string} url - The URL to the XML file.
 * @returns {Promise<{rows: Object[], tabletDefs: Map, penDefs: Map, penFamilyDefs: Map, tabletFamilyDefs: Map}>}
 */
async function fetchAndParseXML(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    const xmlText = await response.text();

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");

    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
        throw new Error('XML parsing failed');
    }

    const rows = Array.from(xmlDoc.querySelectorAll('compatrow'));
    const tabletDefs = new Map();
    const penDefs = new Map();
    const penFamilyDefs = new Map();
    const tabletFamilyDefs = new Map();
    const familyToPens = new Map(); // Map<FamilyID, Set<PenID>>
    const familyToTablets = new Map(); // Map<FamilyID, Set<TabletID>>

    // Parse Definitions
    xmlDoc.querySelectorAll('tabletdef').forEach(def => {
        const id = def.getAttribute('id');
        const familyId = def.getAttribute('familyid') || '';
        tabletDefs.set(id, {
            name: def.getAttribute('name'),
            familyId: familyId
        });
        if (familyId) {
            if (!familyToTablets.has(familyId)) {
                familyToTablets.set(familyId, new Set());
            }
            familyToTablets.get(familyId).add(id);
        }
    });

    xmlDoc.querySelectorAll('pendef').forEach(def => {
        const id = def.getAttribute('id');
        const familyId = def.getAttribute('familyid') || '';
        penDefs.set(id, {
            name: def.getAttribute('name'),
            familyId: familyId
        });
        if (familyId) {
            if (!familyToPens.has(familyId)) {
                familyToPens.set(familyId, new Set());
            }
            familyToPens.get(familyId).add(id);
        }
    });

    xmlDoc.querySelectorAll('penfamilydef').forEach(def => {
        penFamilyDefs.set(def.getAttribute('id'), def.getAttribute('name'));
    });

    xmlDoc.querySelectorAll('tabletfamilydef').forEach(def => {
        tabletFamilyDefs.set(def.getAttribute('id'), def.getAttribute('name'));
    });

    // Process Rows & Validation
    const missingTabletDefs = new Set();
    const missingPenDefs = new Map(); // Map<PenID, Set<TabletID>>
    const usedTablets = new Set();
    const usedPens = new Set();

    const processedRows = rows.map(row => {
        const tabletNode = row.querySelector('tablet');
        const penNode = row.querySelector('pen');
        const penFamilyNode = row.querySelector('penfamily');
        const tabletFamilyNode = row.querySelector('tabletfamily');

        const rowTablets = new Set();
        const rowPens = new Set();

        // Tablets (Direct)
        if (tabletNode) {
            const text = tabletNode.textContent || '';
            const items = text.replace(/[\n\r]+/g, ' ').trim().split(/\s+/).filter(s => s.length > 0);
            items.forEach(id => rowTablets.add(id));
        }

        // Tablet Families (Expansion)
        if (tabletFamilyNode) {
            const text = tabletFamilyNode.textContent || '';
            const families = text.replace(/[\n\r]+/g, ' ').trim().split(/\s+/).filter(s => s.length > 0);
            families.forEach(familyId => {
                if (familyToTablets.has(familyId)) {
                    familyToTablets.get(familyId).forEach(tabletId => rowTablets.add(tabletId));
                } else {
                    console.warn(`Unknown tablet family '${familyId}' used in compatibility row.`);
                }
            });
        }

        // Pens (Direct)
        if (penNode) {
            const text = penNode.textContent || '';
            const items = text.replace(/[\n\r]+/g, ' ').trim().split(/\s+/).filter(s => s.length > 0);
            items.forEach(id => rowPens.add(id));
        }

        // Pen Families (Expansion)
        if (penFamilyNode) {
            const text = penFamilyNode.textContent || '';
            const families = text.replace(/[\n\r]+/g, ' ').trim().split(/\s+/).filter(s => s.length > 0);
            families.forEach(familyId => {
                if (familyToPens.has(familyId)) {
                    familyToPens.get(familyId).forEach(penId => rowPens.add(penId));
                } else {
                    console.warn(`Unknown pen family '${familyId}' used in compatibility row.`);
                }
            });
        }

        const tabletArray = Array.from(rowTablets);
        const penArray = Array.from(rowPens);

        // Validation Logic
        tabletArray.forEach(id => {
            usedTablets.add(id);
            if (!tabletDefs.has(id)) {
                missingTabletDefs.add(id);
            }
        });

        penArray.forEach(id => {
            usedPens.add(id);
            if (!penDefs.has(id)) {
                if (!missingPenDefs.has(id)) {
                    missingPenDefs.set(id, new Set());
                }
                tabletArray.forEach(t => missingPenDefs.get(id).add(t));
            }
        });

        return { tablets: tabletArray, pens: penArray };
    });

    if (missingTabletDefs.size > 0) {
        console.warn(`[${url}] Missing tablet definitions:`, Array.from(missingTabletDefs).sort());
    }

    if (missingPenDefs.size > 0) {
        console.warn(`[${url}] Missing pen definitions:`);
        const sortedMissing = Array.from(missingPenDefs.keys()).sort();
        sortedMissing.forEach(penId => {
            const tablets = Array.from(missingPenDefs.get(penId)).sort().join(', ');
            console.warn(`  - ${penId} (referenced by: ${tablets})`);
        });
    }

    // Check for unused tablet definitions
    const unusedTabletDefs = [];
    tabletDefs.forEach((_, id) => {
        if (!usedTablets.has(id)) {
            unusedTabletDefs.push(id);
        }
    });

    if (unusedTabletDefs.length > 0) {
        console.warn(`[${url}] Unused tablet definitions:`, unusedTabletDefs.sort());
    }

    // Check for unused pen definitions
    const unusedPenDefs = [];
    penDefs.forEach((_, id) => {
        if (!usedPens.has(id)) {
            unusedPenDefs.push(id);
        }
    });

    if (unusedPenDefs.length > 0) {
        console.warn(`[${url}] Unused pen definitions:`, unusedPenDefs.sort());
    }

    return { rows: processedRows, tabletDefs, penDefs, penFamilyDefs, tabletFamilyDefs };
}

/**
 * Merges multiple compatibility data objects.
 * @param {Array<Object>} dataList 
 * @returns {Object} Merged data
 */
function mergeCompatData(dataList) {
    let allRows = [];
    const mergedTabletDefs = new Map();
    const mergedPenDefs = new Map();
    const mergedPenFamilyDefs = new Map();
    const mergedTabletFamilyDefs = new Map();

    dataList.forEach(data => {
        allRows = allRows.concat(data.rows);
        data.tabletDefs.forEach((val, key) => mergedTabletDefs.set(key, val));
        data.penDefs.forEach((val, key) => mergedPenDefs.set(key, val));
        data.penFamilyDefs.forEach((val, key) => mergedPenFamilyDefs.set(key, val));
        data.tabletFamilyDefs.forEach((val, key) => mergedTabletFamilyDefs.set(key, val));
    });

    return {
        rows: allRows,
        tabletDefs: mergedTabletDefs,
        penDefs: mergedPenDefs,
        penFamilyDefs: mergedPenFamilyDefs,
        tabletFamilyDefs: mergedTabletFamilyDefs
    };
}
