<script>
    export let viewMode = "grouped";
    export let organizeByFamily = false;
    export let onePerLine = true;
    export let showIdsOnly = false;
    export let searchTerm = "";

    export let compatibilityRows = [];
    export let tabletDefs = new Map();
    export let penDefs = new Map();
    export let penFamilyDefs = new Map();
    export let tabletFamilyDefs = new Map();

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

    // Reactive structured rows based on view mode
    $: structuredRows = (() => {
        switch (viewMode) {
            case "by-pen":
                return getRowsByPen();
            case "by-tablet":
                return getRowsByTablet();
            case "ungrouped":
                return getRowsUngrouped();
            case "grouped":
            default:
                return getRowsGrouped();
        }
    })();

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

    function getRowsByPen() {
        const penToTablets = new Map();
        compatibilityRows.forEach((row) => {
            row.pens.forEach((p) => {
                if (!penToTablets.has(p)) penToTablets.set(p, new Set());
                row.tablets.forEach((t) => penToTablets.get(p).add(t));
            });
        });
        const result = [];
        penToTablets.forEach((tabletSet, penId) => {
            result.push({
                tablets: sortItems(Array.from(tabletSet), tabletDefs),
                pens: [penId],
            });
        });
        return result.sort((a, b) =>
            compareDeviceIds(a.pens[0], b.pens[0], penDefs),
        );
    }

    function getRowsByTablet() {
        const tabletToPens = new Map();
        compatibilityRows.forEach((row) => {
            row.tablets.forEach((t) => {
                if (!tabletToPens.has(t)) tabletToPens.set(t, new Set());
                row.pens.forEach((p) => tabletToPens.get(t).add(p));
            });
        });
        const result = [];
        tabletToPens.forEach((penSet, tabletId) => {
            result.push({
                tablets: [tabletId],
                pens: sortItems(Array.from(penSet), penDefs),
            });
        });
        return result.sort((a, b) =>
            compareDeviceIds(a.tablets[0], b.tablets[0], tabletDefs),
        );
    }

    function getRowsGrouped() {
        return compatibilityRows.map((row) => ({
            tablets: sortItems(row.tablets, tabletDefs),
            pens: sortItems(row.pens, penDefs),
        }));
    }

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
    function getItemLabel(item, defsMap, showIdsOnlyFlag) {
        if (showIdsOnlyFlag) return item;
        const def = defsMap.get(item);
        if (def && def.name && def.name !== item)
            return `${def.name} (${item})`;
        return item;
    }

    function getGroupedItems(items, defsMap, organizeByFamilyFlag) {
        if (!organizeByFamilyFlag || items.length === 0)
            return [{ label: null, items }];

        const groups = new Map();
        const ungrouped = [];

        items.forEach((item) => {
            const def = defsMap.get(item);
            if (def && def.familyId) {
                if (!groups.has(def.familyId)) groups.set(def.familyId, []);
                groups.get(def.familyId).push(item);
            } else {
                ungrouped.push(item);
            }
        });

        const result = [];
        Array.from(groups.keys())
            .sort()
            .forEach((familyId) => {
                // Look up friendly name for family if it exists, otherwise just use array mapping
                // Family resolution is passed down, but we just want friendly labels if missing falling back to ID.
                // Svelte logic handles this nicely in template
                result.push({ familyId, items: groups.get(familyId) });
            });

        if (ungrouped.length > 0) {
            result.push({ familyId: "Other", items: ungrouped });
        }
        return result;
    }

    function copyRowToClipboard(row) {
        const tabletsText = formatItemsText(row.tablets, tabletDefs, showIdsOnly);
        const pensText = formatItemsText(row.pens, penDefs, showIdsOnly);

        let textToCopy =
            viewMode === "by-pen"
                ? `Pens:\n${pensText}\n\nTablets:\n${tabletsText}`
                : `Tablets:\n${tabletsText}\n\nPens:\n${pensText}`;

        navigator.clipboard
            .writeText(textToCopy)
            .catch((err) => console.error("Clipboard err", err));
    }

    function formatItemsText(items, defsMap, showIdsOnlyFlag) {
        const separator = onePerLine ? `\n  ` : ", ";
        const text = items.map((i) => getItemLabel(i, defsMap, showIdsOnlyFlag)).join(separator);
        return items.length > 0 ? (onePerLine ? `  ${text}` : text) : "";
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
            {#if viewMode === "by-pen"}
                <th>Pens</th>
                <th>Tablets</th>
            {:else}
                <th>Tablets</th>
                <th>Pens</th>
            {/if}
        </tr>
    </thead>
    <tbody>
        {#each filteredRows as row, index}
            <tr>
                <td style="text-align: center; color: #888;">
                    {index + 1}
                    <button
                        class="copy-btn"
                        on:click={() => copyRowToClipboard(row)}>COPY</button
                    >
                </td>

                <!-- First column -->
                <td>
                    {#if viewMode === "by-pen"}
                        {#each getGroupedItems(row.pens, penDefs, organizeByFamily) as group}
                            {#if group.familyId}
                                <div class="family-group">
                                    <div class="family-group-label">
                                        {penFamilyDefs.get(group.familyId) ||
                                            group.familyId}
                                    </div>
                                    {#each group.items as item}
                                        <span class="device-tag"
                                            >{getItemLabel(item, penDefs, showIdsOnly)}</span
                                        >{#if onePerLine}<br />{/if}
                                    {/each}
                                </div>
                            {:else}
                                {#each group.items as item}
                                    <span class="device-tag"
                                        >{getItemLabel(item, penDefs, showIdsOnly)}</span
                                    >{#if onePerLine}<br />{/if}
                                {/each}
                            {/if}
                        {/each}
                    {:else}
                        {#each getGroupedItems(row.tablets, tabletDefs, organizeByFamily) as group}
                            {#if group.familyId}
                                <div class="family-group">
                                    <div class="family-group-label">
                                        {tabletFamilyDefs.get(group.familyId) ||
                                            group.familyId}
                                    </div>
                                    {#each group.items as item}
                                        <span class="device-tag tablet"
                                            >{getItemLabel(
                                                item,
                                                tabletDefs,
                                                showIdsOnly,
                                            )}</span
                                        >{#if onePerLine}<br />{/if}
                                    {/each}
                                </div>
                            {:else}
                                {#each group.items as item}
                                    <span class="device-tag tablet"
                                        >{getItemLabel(item, tabletDefs, showIdsOnly)}</span
                                    >{#if onePerLine}<br />{/if}
                                {/each}
                            {/if}
                        {/each}
                    {/if}
                </td>

                <!-- Second column -->
                <td>
                    {#if viewMode === "by-pen"}
                        {#each getGroupedItems(row.tablets, tabletDefs, organizeByFamily) as group}
                            {#if group.familyId}
                                <div class="family-group">
                                    <div class="family-group-label">
                                        {tabletFamilyDefs.get(group.familyId) ||
                                            group.familyId}
                                    </div>
                                    {#each group.items as item}
                                        <span class="device-tag tablet"
                                            >{getItemLabel(
                                                item,
                                                tabletDefs,
                                                showIdsOnly,
                                            )}</span
                                        >{#if onePerLine}<br />{/if}
                                    {/each}
                                </div>
                            {:else}
                                {#each group.items as item}
                                    <span class="device-tag tablet"
                                        >{getItemLabel(item, tabletDefs, showIdsOnly)}</span
                                    >{#if onePerLine}<br />{/if}
                                {/each}
                            {/if}
                        {/each}
                    {:else}
                        {#each getGroupedItems(row.pens, penDefs, organizeByFamily) as group}
                            {#if group.familyId}
                                <div class="family-group">
                                    <div class="family-group-label">
                                        {penFamilyDefs.get(group.familyId) ||
                                            group.familyId}
                                    </div>
                                    {#each group.items as item}
                                        <span class="device-tag"
                                            >{getItemLabel(item, penDefs, showIdsOnly)}</span
                                        >{#if onePerLine}<br />{/if}
                                    {/each}
                                </div>
                            {:else}
                                {#each group.items as item}
                                    <span class="device-tag"
                                        >{getItemLabel(item, penDefs, showIdsOnly)}</span
                                    >{#if onePerLine}<br />{/if}
                                {/each}
                            {/if}
                        {/each}
                    {/if}
                </td>
            </tr>
        {/each}
    </tbody>
</table>
