<script>
    import { base } from '$app/paths';
    import { buildTabletDetailHref } from '../lib/tablet-url.js';
    import { buildPenDetailHref } from '../lib/pen-url.js';


    export let searchTerm = "";
    export let selectedBrand = "";

    export let compatibilityPairs = [];
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

    // Browse compatibility always uses the flat tablet-pen pair source.
    $: structuredRows = compatibilityPairs.map(({ tabletId, penId }) => ({
        tablets: [tabletId],
        pens: [penId],
    }));

    // Filter structured rows
    $: filteredRows = structuredRows.filter((row) => {
        // Brand filter: row matches if any tablet or pen belongs to the selected brand
        if (selectedBrand) {
            const hasBrand = [...row.tablets, ...row.pens].some((item) => {
                const def = tabletDefs.get(item) || penDefs.get(item);
                return def?.brand === selectedBrand;
            });
            if (!hasBrand) return false;
        }

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
        compatibilityPairs.forEach(({ tabletId, penId }) => {
            totalUniqueTablets.add(tabletId);
            totalUniquePens.add(penId);
        });

        return {
            rowsCount: filteredRows.length,
            visibleTablets: visibleTablets.size,
            totalTablets: totalUniqueTablets.size,
            visiblePens: visiblePens.size,
            totalPens: totalUniquePens.size,
        };
    })();

    // Format Helpers
    function getItemLabel(item, defsMap) {
        const def = defsMap.get(item);
        return def?.fullName || def?.name || item;
    }

    function getTabletHref(id) {
        const def = tabletDefs.get(id);
        return buildTabletDetailHref(base, { id, brand: def?.brand || '', name: def?.name || id });
    }

    function getPenHref(id) {
        const def = penDefs.get(id);
        return buildPenDetailHref(base, { id, brand: def?.brand || '', name: def?.name || id });
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
                        <a class="item-link" href={getTabletHref(item)}>{getItemLabel(item, tabletDefs)}</a>
                    {/each}
                </td>

                <!-- Second column -->
                <td>
                    {#each row.pens as item}
                        <a class="item-link" href={getPenHref(item)}>{getItemLabel(item, penDefs)}</a>
                    {/each}
                </td>
            </tr>
        {/each}
    </tbody>
</table>

<style>
  .item-link {
    color: #0d47a1;
    text-decoration: none;
  }

  .item-link:hover {
    text-decoration: underline;
  }
</style>
