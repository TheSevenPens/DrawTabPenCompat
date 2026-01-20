/**
 * Renders the compatibility table based on the provided data and current UI state.
 * @param {HTMLTableSectionElement} tableBody - The tbody element to populate.
 * @param {Element[]} compatibilityRows - Array of XML compatrow elements.
 * @param {Map} tabletDefs - Map of tablet definitions.
 * @param {Map} penDefs - Map of pen definitions.
 */
function renderCompatTable(tableBody, compatibilityRows, tabletDefs, penDefs, penFamilyDefs, tabletFamilyDefs) {
    const showIdsOnlyCheckbox = document.getElementById('show-ids-only');
    const onePerLineCheckbox = document.getElementById('one-per-line');
    const organizeByFamilyCheckbox = document.getElementById('organize-by-family');
    const searchInput = document.getElementById('search-input');
    const viewModeSelect = document.getElementById('view-mode-select');
    const statsBar = document.getElementById('stats-bar');

    const showNames = showIdsOnlyCheckbox ? !showIdsOnlyCheckbox.checked : true;
    const onePerLine = onePerLineCheckbox ? onePerLineCheckbox.checked : false;
    const organizeByFamily = organizeByFamilyCheckbox ? organizeByFamilyCheckbox.checked : false;
    const viewMode = viewModeSelect ? viewModeSelect.value : 'grouped';
    const rawSearchTerm = searchInput ? searchInput.value.trim() : '';

    // Parse search terms and convert to Regex for glob support
    const searchTerms = parseSearchTokens(rawSearchTerm);
    const searchRegexes = searchTerms.map(createGlobRegex);

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

    // 1. Filter rows
    const filteredRows = displayRows.filter(row => {
        if (searchRegexes.length === 0) return true;

        const allItems = [...row.tablets, ...row.pens];
        // Check if EVERY regex matches AT LEAST ONE item in the row
        return searchRegexes.every(regex => {
            return allItems.some(item => {
                const id = item; // ID is case-sensitive or standard, but regex is 'i'
                let name = '';
                if (tabletDefs.has(item)) name = tabletDefs.get(item).name;
                else if (penDefs.has(item)) name = penDefs.get(item).name;

                return regex.test(id) || (name && regex.test(name));
            });
        });
    });

    // 2. Calculate Stats
    const visibleTablets = new Set();
    const visiblePens = new Set();
    filteredRows.forEach(row => {
        row.tablets.forEach(t => visibleTablets.add(t));
        row.pens.forEach(p => visiblePens.add(p));
    });

    const totalUniqueTablets = new Set();
    const totalUniquePens = new Set();
    compatibilityRows.forEach(row => {
        const tabletNode = row.querySelector('tablet');
        const penNode = row.querySelector('pen');
        extractItems(tabletNode).forEach(t => totalUniqueTablets.add(t));
        extractItems(penNode).forEach(p => totalUniquePens.add(p));
    });

    if (statsBar) {
        statsBar.textContent = `Showing ${filteredRows.length} rows | ${visibleTablets.size} of ${totalUniqueTablets.size} Tablets | ${visiblePens.size} of ${totalUniquePens.size} Pens`;
    }

    // Update Header
    const headerRow = document.querySelector('#compat-table thead tr');
    if (headerRow) {
        if (viewMode === 'by-pen') {
            headerRow.innerHTML = `<th>#</th><th>Pens</th><th>Tablets</th>`;
        } else {
            headerRow.innerHTML = `<th>#</th><th>Tablets</th><th>Pens</th>`;
        }
    }

    // 3. Render
    filteredRows.forEach((row, index) => {
        const tr = document.createElement('tr');

        const tabletCell = formatItems(row.tablets, 'device-tag tablet', tabletDefs, showNames, onePerLine, organizeByFamily, tabletFamilyDefs);
        const penCell = formatItems(row.pens, 'device-tag', penDefs, showNames, onePerLine, organizeByFamily, penFamilyDefs);

        const copyBtn = `<button class="copy-btn" onclick="copyRowToClipboard(${index})">Copy</button>`;

        if (viewMode === 'by-pen') {
            tr.innerHTML = `
                <td style="text-align: center; color: #888;">
                    ${index + 1}
                    ${copyBtn}
                </td>
                <td>${penCell}</td>
                <td>${tabletCell}</td>
            `;
        } else {
            tr.innerHTML = `
                <td style="text-align: center; color: #888;">
                    ${index + 1}
                    ${copyBtn}
                </td>
                <td>${tabletCell}</td>
                <td>${penCell}</td>
            `;
        }
        tableBody.appendChild(tr);
    });

    // Store data for copy function
    window.currentTableData = {
        rows: filteredRows,
        viewMode,
        tabletDefs,
        penDefs,
        showNames,
        onePerLine
    };
}

/**
 * Copies the content of a row to the clipboard.
 * @param {number} index - Index of the row in filteredRows.
 */
function copyRowToClipboard(index) {
    const { rows, viewMode, tabletDefs, penDefs, showNames, onePerLine } = window.currentTableData;
    const row = rows[index];
    if (!row) return;

    const tablets = formatItemsText(row.tablets, tabletDefs, showNames, onePerLine);
    const pens = formatItemsText(row.pens, penDefs, showNames, onePerLine);

    let textToCopy = '';
    if (viewMode === 'by-pen') {
        textToCopy = `Pens:\n${pens}\n\nTablets:\n${tablets}`;
    } else {
        textToCopy = `Tablets:\n${tablets}\n\nPens:\n${pens}`;
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
        // Optional: Visual feedback could be added here
        console.log('Copied to clipboard');
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

/**
 * Formats items as plain text for clipboard.
 */
function formatItemsText(items, defsMap, showNames, onePerLine) {
    const separator = onePerLine ? '\n' : ', ';
    return items.map(item => {
        let label = item;
        if (showNames && defsMap && defsMap.has(item)) {
            const def = defsMap.get(item);
            if (def.name) {
                label = `${def.name} (${item})`;
            }
        }
        return label;
    }).join(separator);
}

/**
 * Parses a search string into tokens, respecting double quotes.
 * @param {string} input 
 * @returns {string[]}
 */
function parseSearchTokens(input) {
    if (!input) return [];
    const tokens = [];
    const regex = /"([^"]+)"|(\S+)/g;
    let match;
    while ((match = regex.exec(input)) !== null) {
        if (match[1]) {
            tokens.push(match[1]);
        } else if (match[2]) {
            tokens.push(match[2]);
        }
    }
    return tokens;
}

/**
 * Creates a RegExp from a glob pattern.
 * @param {string} pattern 
 * @returns {RegExp}
 */
function createGlobRegex(pattern) {
    // Escape special regex chars except * and ?
    // Then replace * with .* and ? with .
    const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    const globPattern = escaped.replace(/\*/g, '.*').replace(/\?/g, '.');
    return new RegExp(globPattern, 'i'); // Case-insensitive
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
    const text = node.textContent || '';
    return text.replace(/[\n\r]+/g, ' ').trim().split(/\s+/).filter(s => s.length > 0);
}

function formatItems(items, className, defsMap, showNames, onePerLine, organizeByFamily, familyDefs) {
    const separator = onePerLine ? '<br>' : '';

    if (organizeByFamily && defsMap && items.length > 0) {
        const groups = new Map();
        const ungrouped = [];

        items.forEach(item => {
            const def = defsMap.get(item);
            if (def && def.familyId) {
                if (!groups.has(def.familyId)) groups.set(def.familyId, []);
                groups.get(def.familyId).push(item);
            } else {
                ungrouped.push(item);
            }
        });

        // If we have groups, render them
        if (groups.size > 0) {
            let html = '';

            // Sort by familyId for consistency
            const sortedFamilies = Array.from(groups.keys()).sort();

            sortedFamilies.forEach(familyId => {
                const groupItems = groups.get(familyId);
                const formattedItems = groupItems.map(item => {
                    let label = item;
                    if (showNames && defsMap.has(item)) {
                        const def = defsMap.get(item);
                        if (def.name) label = `${def.name} (${item})`;
                    }
                    return `<span class="${className}">${label}</span>`;
                }).join(separator);

                html += `<div class="family-group">`;
                const familyName = (familyDefs && familyDefs.has(familyId)) ? familyDefs.get(familyId) : null;
                const familyLabel = familyName || familyId;
                html += `<div class="family-group-label">${familyLabel}</div>`;
                html += formattedItems;
                html += `</div>`;
            });

            if (ungrouped.length > 0) {
                const formattedUngrouped = ungrouped.map(item => {
                    let label = item;
                    if (showNames && defsMap.has(item)) {
                        const def = defsMap.get(item);
                        if (def.name) label = `${def.name} (${item})`;
                    }
                    return `<span class="${className}">${label}</span>`;
                }).join(separator);

                html += `<div class="family-group">`;
                html += `<div class="family-group-label">Other</div>`;
                html += formattedUngrouped;
                html += `</div>`;
            }
            return html;
        }
    }

    return items.map(item => {
        let label = item;
        if (showNames && defsMap && defsMap.has(item)) {
            const def = defsMap.get(item);
            if (def.name) {
                label = `${def.name} (${item})`;
            }
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

        if (defA.familyId < defB.familyId) return -1;
        if (defA.familyId > defB.familyId) return 1;

        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
    });
}
