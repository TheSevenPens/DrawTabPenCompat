<script>
    export let viewMode;
    export let organizeByFamily;
    export let onePerLine;
    export let showIdsOnly;
    export let searchTerm;
</script>

<div class="controls">
    <div id="search-area" style="margin-bottom: 5px;">
        <input
            type="text"
            bind:value={searchTerm}
            placeholder="Search ..."
            style="width: 100%; max-width: 800px; padding: 8px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px;"
        />
    </div>

    <div id="options-area" style="margin-bottom: 0px;">
        <label
            for="view-mode-select"
            style="margin-left: 15px; padding-left: 15px;">View:</label
        >
        <select
            id="view-mode-select"
            bind:value={viewMode}
            style="margin-left: 5px; padding: 4px;"
        >
            <option value="grouped">Compact Grouped</option>
            <option value="by-tablet">Group by tablet</option>
            <option value="by-pen">Group by pen</option>
            <option value="ungrouped">Ungrouped</option>
        </select>

        <input
            type="checkbox"
            id="organize-by-family"
            bind:checked={organizeByFamily}
            style="margin-left: 15px;"
        />
        <label for="organize-by-family">Organize by family</label>

        <input type="checkbox" id="one-per-line" bind:checked={onePerLine} />
        <label for="one-per-line">One item per line</label>

        <input type="checkbox" id="show-ids-only" bind:checked={showIdsOnly} />
        <label for="show-ids-only" style="margin-right: 15px;"
            >Show IDs only</label
        >
    </div>
</div>
