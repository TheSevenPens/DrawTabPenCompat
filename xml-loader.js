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

    return { rows, tabletDefs, penDefs };
}
