/**
 * Fetches and parses the Wacom compatibility XML file.
 * @param {string} url - The URL to the XML file.
 * @returns {Promise<{rows: Element[], tabletDefs: Map, penDefs: Map}>}
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

    // Parse Definitions
    xmlDoc.querySelectorAll('tabletdef').forEach(def => {
        const id = def.getAttribute('id');
        tabletDefs.set(id, {
            name: def.getAttribute('name'),
            familyId: def.getAttribute('familyid') || ''
        });
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

        const rowTablets = new Set();
        const rowPens = new Set();

        // Tablets
        if (tabletNode) {
            const text = tabletNode.textContent || '';
            const items = text.replace(/[\n\r]+/g, ' ').trim().split(/\s+/).filter(s => s.length > 0);
            items.forEach(id => rowTablets.add(id));
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
