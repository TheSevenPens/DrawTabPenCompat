/**
 * Fetches and parses the compatibility JSON files.
 * @param {string} compatUrl - The URL to the compatibility JSON file.
 * @param {string} tabletsUrl - The URL to the tablets JSON file.
 * @param {string} pensUrl - The URL to the pens JSON file.
 * @param {(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>} fetchImpl
 * @returns {Promise<{pairs: Object[], tabletDefs: Map, penDefs: Map, penFamilyDefs: Map, tabletFamilyDefs: Map, diagnostics: Object}>}
 */
export async function fetchAndParseJSON(compatUrl, tabletsUrl, pensUrl, fetchImpl = fetch) {
    const [compatRes, tabletsRes, pensRes] = await Promise.all([
        fetchImpl(compatUrl),
        fetchImpl(tabletsUrl),
        fetchImpl(pensUrl)
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
    const penFamilyBrands = new Map();
    const tabletFamilyBrands = new Map();
    const familyToPens = new Map(); // Map<FamilyID, Set<PenID>>

    // Parse Definitions
    tabletsData.tabletdefs.forEach(def => {
        tabletDefs.set(def.id, {
            brand: def.brand || '',
            name: def.name || '',
            fullName: def.fullname || '',
            familyId: def.familyid || ''
        });
    });

    pensData.pendefs.forEach(def => {
        const id = def.id;
        const familyId = def.familyid || '';
        penDefs.set(id, {
            brand: def.brand || '',
            name: def.name || '',
            fullName: def.fullname || '',
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
            if (def.brand) penFamilyBrands.set(def.id, def.brand);
        });
    }

    if (tabletsData.tabletfamilydefs) {
        tabletsData.tabletfamilydefs.forEach(def => {
            tabletFamilyDefs.set(def.id, def.name);
            if (def.brand) tabletFamilyBrands.set(def.id, def.brand);
        });
    }

    // Process Rows & Validation
    const pairRows = [];
    const seenPairs = new Set();
    const pairOccurrences = new Map();
    (compatData.compatrows || []).forEach(row => {
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

        rowTablets.forEach(tabletId => {
            rowPens.forEach(penId => {
                const key = `${tabletId}\u0000${penId}`;
                const nextCount = (pairOccurrences.get(key) || 0) + 1;
                pairOccurrences.set(key, nextCount);
                if (seenPairs.has(key)) return;
                seenPairs.add(key);
                pairRows.push({ tabletId, penId });
            });
        });
    });

    pairRows.sort((a, b) => {
        const tabletCompared = a.tabletId.localeCompare(b.tabletId, undefined, { numeric: true, sensitivity: 'base' });
        if (tabletCompared !== 0) return tabletCompared;
        return a.penId.localeCompare(b.penId, undefined, { numeric: true, sensitivity: 'base' });
    });

    const missingTabletDefs = new Set();
    const missingPenDefs = new Map(); // Map<PenID, Set<TabletID>>
    const usedTablets = new Set();
    const usedPens = new Set();

    // Validation Logic against flat pair source
    pairRows.forEach(({ tabletId, penId }) => {
        usedTablets.add(tabletId);
        usedPens.add(penId);

        if (!tabletDefs.has(tabletId)) {
            missingTabletDefs.add(tabletId);
        }

        if (!penDefs.has(penId)) {
            if (!missingPenDefs.has(penId)) {
                missingPenDefs.set(penId, new Set());
            }
            missingPenDefs.get(penId).add(tabletId);
        }
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

    const duplicatePairs = Array.from(pairOccurrences.entries())
        .filter(([, occurrences]) => occurrences > 1)
        .map(([key, occurrences]) => {
            const [tabletId, penId] = key.split('\u0000');
            return { tabletId, penId, occurrences };
        })
        .sort((a, b) => {
            const tabletCompared = a.tabletId.localeCompare(b.tabletId, undefined, { numeric: true, sensitivity: 'base' });
            if (tabletCompared !== 0) return tabletCompared;
            return a.penId.localeCompare(b.penId, undefined, { numeric: true, sensitivity: 'base' });
        });

    const diagnostics = {
        pensWithoutTablets: unusedPenDefs.sort(),
        tabletsWithoutPens: unusedTabletDefs.sort(),
        duplicatePairs,
    };

    return { pairs: pairRows, tabletDefs, penDefs, penFamilyDefs, tabletFamilyDefs, penFamilyBrands, tabletFamilyBrands, diagnostics };
}
