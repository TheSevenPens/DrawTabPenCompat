/**
 * Fetches and parses the Wacom compatibility JSON files.
 * @param {string} compatUrl - The URL to the compatibility JSON file.
 * @param {string} tabletsUrl - The URL to the tablets JSON file.
 * @param {string} pensUrl - The URL to the pens JSON file.
 * @returns {Promise<{rows: Object[], tabletDefs: Map, penDefs: Map, penFamilyDefs: Map, tabletFamilyDefs: Map}>}
 */
export async function fetchAndParseJSON(compatUrl, tabletsUrl, pensUrl) {
    const [compatRes, tabletsRes, pensRes] = await Promise.all([
        fetch(compatUrl),
        fetch(tabletsUrl),
        fetch(pensUrl)
    ]);

    if (!compatRes.ok || !tabletsRes.ok || !pensRes.ok) {
        throw new Error(`Network response was not ok`);
    }

    const compatData = await compatRes.json();
    const tabletsData = await tabletsRes.json();
    const pensData = await pensRes.json();

    const tabletDefs = new Map();
    const penDefs = new Map();
    const penFamilyDefs = new Map();
    const tabletFamilyDefs = new Map();
    const familyToPens = new Map(); // Map<FamilyID, Set<PenID>>

    // Parse Definitions
    tabletsData.tabletdefs.forEach(def => {
        tabletDefs.set(def.id, {
            name: def.name || '',
            familyId: def.familyid || ''
        });
    });

    pensData.pendefs.forEach(def => {
        const id = def.id;
        const familyId = def.familyid || '';
        penDefs.set(id, {
            name: def.name || '',
            familyId: familyId
        });
        if (familyId) {
            if (!familyToPens.has(familyId)) {
                familyToPens.set(familyId, new Set());
            }
            familyToPens.get(familyId).add(id);
        }
    });

    if (pensData.penfamilydefs) {
        pensData.penfamilydefs.forEach(def => {
            penFamilyDefs.set(def.id, def.name);
        });
    }

    if (tabletsData.tabletfamilydefs) {
        tabletsData.tabletfamilydefs.forEach(def => {
            tabletFamilyDefs.set(def.id, def.name);
        });
    }

    // Process Rows & Validation
    const missingTabletDefs = new Set();
    const missingPenDefs = new Map(); // Map<PenID, Set<TabletID>>
    const usedTablets = new Set();
    const usedPens = new Set();

    const processedRows = compatData.compatrows.map(row => {
        const rowTablets = new Set(row.tablets || []);
        const rowPens = new Set(row.pens || []);

        if (row.penfamilies) {
            row.penfamilies.forEach(familyId => {
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
        console.warn('Missing tablet definitions:', Array.from(missingTabletDefs).sort());
    }

    if (missingPenDefs.size > 0) {
        console.warn('Missing pen definitions:');
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
        console.warn('Unused tablet definitions:', unusedTabletDefs.sort());
    }

    // Check for unused pen definitions
    const unusedPenDefs = [];
    penDefs.forEach((_, id) => {
        if (!usedPens.has(id)) {
            unusedPenDefs.push(id);
        }
    });

    if (unusedPenDefs.length > 0) {
        console.warn('Unused pen definitions:', unusedPenDefs.sort());
    }

    return { rows: processedRows, tabletDefs, penDefs, penFamilyDefs, tabletFamilyDefs };
}
