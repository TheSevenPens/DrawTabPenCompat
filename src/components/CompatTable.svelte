<script>
    export let searchTerm = "";

    export let compatibilityRows = [];
    export let tabletDefs = new Map();
    export let penDefs = new Map();

    // Reactive parsing of search term
    $: searchRegexes = parseSearchTokens(searchTerm).map(createGlobRegex);

    // Parse search string into tokens respecting quotes
    function parseSearchTokens(input) {
        if (!input) return [];
        const tokens = [];
        const regex = /"([^"]+)"|(\S+)/g;
        let match;
        while ((match = regex.exec(input)) !== null) {
            if (match[1]) tokens.push(match[1]);
            else if (match[2]) tokens.push(match[2]);
        }
        return tokens;
    }

    function createGlobRegex(pattern) {
        const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&");
        const globPattern = escaped.replace(/\*/g, ".*").replace(/\?/g, ".");
        return new RegExp(globPattern, "i");
    }

    // Always render ungrouped rows for browse compatibility.
    $: structuredRows = getRowsUngrouped();

    // Filter structured rows
    $: filteredRows = structuredRows.filter((row) => {
        if (searchRegexes.length === 0) return true;
        const allItems = [...row.tablets, ...row.pens];

        return searchRegexes.every((regex) => {
            return allItems.some((item) => {
                let name = "";
                if (tabletDefs.has(item)) name = tabletDefs.get(item).name;
                else if (penDefs.has(item)) name = penDefs.get(item).name;
                return regex.test(item) || (name && regex.test(name));
            });
        });
    });

    // Calculate Stats
    $: stats = (() => {
        const visibleTablets = new Set();
        const visiblePens = new Set();
        filteredRows.forEach((row) => {
            row.tablets.forEach((t) => visibleTablets.add(t));
            row.pens.forEach((p) => visiblePens.add(p));
        });

        const totalUniqueTablets = new Set();
        const totalUniquePens = new Set();
        compatibilityRows.forEach((row) => {
            row.tablets.forEach((t) => totalUniqueTablets.add(t));
            row.pens.forEach((p) => totalUniquePens.add(p));
        });

        return {
            rowsCount: filteredRows.length,
            visibleTablets: visibleTablets.size,
            totalTablets: totalUniqueTablets.size,
            visiblePens: visiblePens.size,
            totalPens: totalUniquePens.size,
        };
    })();

    function getRowsUngrouped() {
        const result = [];
        compatibilityRows.forEach((row) => {
            const tablets = sortItems(row.tablets, tabletDefs);
            const pens = sortItems(row.pens, penDefs);
            tablets.forEach((t) => {
                pens.forEach((p) => {
                    result.push({ tablets: [t], pens: [p] });
                });
            });
        });
        return result;
    }

    function compareDeviceIds(a, b, defsMap) {
        const defA = defsMap.get(a) || { familyId: "", name: "" };
        const defB = defsMap.get(b) || { familyId: "", name: "" };
        if (defA.familyId < defB.familyId) return -1;
        if (defA.familyId > defB.familyId) return 1;
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
    }

    function sortItems(items, defsMap) {
        return items.sort((a, b) => compareDeviceIds(a, b, defsMap));
    }

    // Format Helpers
    function getItemLabel(item, defsMap) {
        const def = defsMap.get(item);
        if (def && def.name && def.name !== item)
            return `${def.name} (${item})`;
        return item;
    }

</script>

<div id="stats-bar" class="stats-bar">
    {stats.rowsCount} rows | {stats.visibleTablets} of {stats.totalTablets} tablets
    | {stats.visiblePens} of {stats.totalPens} pens
</div>

<table id="compat-table">
    <thead>
        <tr>
            <th>#</th>
            <th>Tablets</th>
            <th>Pens</th>
        </tr>
    </thead>
    <tbody>
        {#each filteredRows as row, index}
            <tr>
                <td style="text-align: center; color: #888;">
                    {index + 1}
                </td>

                <!-- First column -->
                <td>
                    {#each row.tablets as item}
                        <span class="device-tag tablet"
                            >{getItemLabel(item, tabletDefs)}</span
                        ><br />
                    {/each}
                </td>

                <!-- Second column -->
                <td>
                    {#each row.pens as item}
                        <span class="device-tag"
                            >{getItemLabel(item, penDefs)}</span
                        ><br />
                    {/each}
                </td>
            </tr>
        {/each}
    </tbody>
</table>
