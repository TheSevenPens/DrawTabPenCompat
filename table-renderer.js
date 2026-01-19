/**
 * Renders the compatibility table based on the provided data and current UI state.
 * @param {HTMLTableSectionElement} tableBody - The tbody element to populate.
 * @param {Element[]} compatibilityRows - Array of XML compatrow elements.
 * @param {Map} tabletDefs - Map of tablet definitions.
 * @param {Map} penDefs - Map of pen definitions.
 */
function renderCompatTable(tableBody, compatibilityRows, tabletDefs, penDefs) {
    const showNamesCheckbox = document.getElementById('show-names');
    const onePerLineCheckbox = document.getElementById('one-per-line');
    const searchInput = document.getElementById('search-input');
    const viewModeInput = document.querySelector('input[name="view-mode"]:checked');

    const showNames = showNamesCheckbox ? showNamesCheckbox.checked : true;
    const onePerLine = onePerLineCheckbox ? onePerLineCheckbox.checked : false;
    const viewMode = viewModeInput ? viewModeInput.value : 'grouped';
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

    tableBody.innerHTML = ''; // Clear existing

    let displayRows = [];

    switch (viewMode) {
        case 'by-pen':
            displayRows = getRowsByPen(compatibilityRows, tabletDefs, penDefs);
            break;
        case 'by-tablet':
            displayRows = getRowsByTablet(compatibilityRows, tabletDefs, penDefs);
            break;
        case 'ungrouped':
            displayRows = getRowsUngrouped(compatibilityRows, tabletDefs, penDefs);
            break;
        case 'grouped':
        default:
            displayRows = getRowsGrouped(compatibilityRows, tabletDefs, penDefs);
            break;
    }

    // Filter and Render
    displayRows.forEach(row => {
        // Filter Logic
        if (searchTerm) {
            const allItems = [...row.tablets, ...row.pens];
            const match = allItems.some(item => {
                const id = item.toLowerCase();
                let name = '';
                if (tabletDefs.has(item)) name = tabletDefs.get(item).name.toLowerCase();
                else if (penDefs.has(item)) name = penDefs.get(item).name.toLowerCase();

                return id.includes(searchTerm) || name.includes(searchTerm);
            });
            if (!match) return; // Skip row if no match
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatItems(row.tablets, 'device-tag tablet', tabletDefs, showNames, onePerLine)}</td>
            <td>${formatItems(row.pens, 'device-tag', penDefs, showNames, onePerLine)}</td>
        `;
        tableBody.appendChild(tr);
    });
}

function getRowsByPen(compatibilityRows, tabletDefs, penDefs) {
    const penToTablets = new Map();

    compatibilityRows.forEach(row => {
        const tabletNode = row.querySelector('tablet');
        const penNode = row.querySelector('pen');
        const tablets = extractItems(tabletNode);
        const pens = extractItems(penNode);

        pens.forEach(p => {
            if (!penToTablets.has(p)) penToTablets.set(p, new Set());
            tablets.forEach(t => penToTablets.get(p).add(t));
        });
    });

    const displayRows = [];
    penToTablets.forEach((tabletSet, penId) => {
        const sortedPens = [penId];
        const sortedTablets = sortItems(Array.from(tabletSet), tabletDefs);
        displayRows.push({ tablets: sortedTablets, pens: sortedPens });
    });

    return displayRows.sort((a, b) => compareDeviceIds(a.pens[0], b.pens[0], penDefs));
}

function getRowsByTablet(compatibilityRows, tabletDefs, penDefs) {
    const tabletToPens = new Map();

    compatibilityRows.forEach(row => {
        const tabletNode = row.querySelector('tablet');
        const penNode = row.querySelector('pen');
        const tablets = extractItems(tabletNode);
        const pens = extractItems(penNode);

        tablets.forEach(t => {
            if (!tabletToPens.has(t)) tabletToPens.set(t, new Set());
            pens.forEach(p => tabletToPens.get(t).add(p));
        });
    });

    const displayRows = [];
    tabletToPens.forEach((penSet, tabletId) => {
        const sortedTablets = [tabletId];
        const sortedPens = sortItems(Array.from(penSet), penDefs);
        displayRows.push({ tablets: sortedTablets, pens: sortedPens });
    });

    return displayRows.sort((a, b) => compareDeviceIds(a.tablets[0], b.tablets[0], tabletDefs));
}

function getRowsGrouped(compatibilityRows, tabletDefs, penDefs) {
    const displayRows = [];
    compatibilityRows.forEach(row => {
        const tabletNode = row.querySelector('tablet');
        const penNode = row.querySelector('pen');
        const tablets = sortItems(extractItems(tabletNode), tabletDefs);
        const pens = sortItems(extractItems(penNode), penDefs);
        displayRows.push({ tablets, pens });
    });
    return displayRows;
}

function getRowsUngrouped(compatibilityRows, tabletDefs, penDefs) {
    const displayRows = [];
    compatibilityRows.forEach(row => {
        const tabletNode = row.querySelector('tablet');
        const penNode = row.querySelector('pen');
        const tablets = sortItems(extractItems(tabletNode), tabletDefs);
        const pens = sortItems(extractItems(penNode), penDefs);

        tablets.forEach(t => {
            pens.forEach(p => {
                displayRows.push({ tablets: [t], pens: [p] });
            });
        });
    });
    return displayRows;
}

function extractItems(node) {
    if (!node) return [];
    // Get text, replace newlines with spaces, trim, then split by spaces
    const text = node.textContent || '';
    return text.replace(/[\n\r]+/g, ' ').trim().split(/\s+/).filter(s => s.length > 0);
}

function formatItems(items, className, defsMap, showNames, onePerLine) {
    const separator = onePerLine ? '<br>' : '';
    return items.map(item => {
        let label = item;
        if (showNames && defsMap && defsMap.has(item)) {
            const def = defsMap.get(item);
            label = `${def.name} (${item})`;
        }
        return `<span class="${className}">${label}</span>`;
    }).join(separator);
}

function compareDeviceIds(a, b, defsMap) {
    const defA = defsMap.get(a) || { familyId: '', name: '' };
    const defB = defsMap.get(b) || { familyId: '', name: '' };

    if (defA.familyId < defB.familyId) return -1;
    if (defA.familyId > defB.familyId) return 1;

    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
}

function sortItems(items, defsMap) {
    return items.sort((a, b) => {
        const defA = defsMap.get(a) || { familyId: '', name: '' };
        const defB = defsMap.get(b) || { familyId: '', name: '' };

        // Sort by familyId first
        if (defA.familyId < defB.familyId) return -1;
        if (defA.familyId > defB.familyId) return 1;

        // Then by ID
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
    });
}
