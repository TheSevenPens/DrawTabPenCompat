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

    // Parse Definitions
    xmlDoc.querySelectorAll('tabletdef').forEach(def => {
        tabletDefs.set(def.getAttribute('id'), {
            name: def.getAttribute('name'),
            familyId: def.getAttribute('familyid') || ''
        });
    });

    xmlDoc.querySelectorAll('pendef').forEach(def => {
        penDefs.set(def.getAttribute('id'), {
            name: def.getAttribute('name'),
            familyId: def.getAttribute('familyid') || ''
        });
    });

    // Check for missing tablet definitions and pen definitions
    const missingTabletDefs = new Set();
    const missingPenDefs = new Set();
    const usedTablets = new Set();
    const usedPens = new Set();

    rows.forEach(row => {
        const tabletNode = row.querySelector('tablet');
        if (tabletNode) {
            const text = tabletNode.textContent || '';
            const items = text.replace(/[\n\r]+/g, ' ').trim().split(/\s+/).filter(s => s.length > 0);
            items.forEach(item => {
                usedTablets.add(item);
                if (!tabletDefs.has(item)) {
                    missingTabletDefs.add(item);
                }
            });
        }

        const penNode = row.querySelector('pen');
        if (penNode) {
            const text = penNode.textContent || '';
            const items = text.replace(/[\n\r]+/g, ' ').trim().split(/\s+/).filter(s => s.length > 0);
            items.forEach(item => {
                usedPens.add(item);
                if (!penDefs.has(item)) {
                    missingPenDefs.add(item);
                }
            });
        }
    });

    if (missingTabletDefs.size > 0) {
        console.warn('Missing tablet definitions:', Array.from(missingTabletDefs).sort());
    }

    if (missingPenDefs.size > 0) {
        console.warn('Missing pen definitions:', Array.from(missingPenDefs).sort());
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

    return { rows, tabletDefs, penDefs };
}
