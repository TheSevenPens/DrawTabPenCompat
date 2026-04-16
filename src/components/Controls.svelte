<script>
    export let searchTerm;
    export let placeholder = "Search ...";
    export let brands = [];
    export let selectedBrand = '';
    export let groupBy = 'none';
    export let showGroupBy = false;
</script>

<div class="controls">
    <div class="controls-row">
        <input
            type="text"
            bind:value={searchTerm}
            placeholder={placeholder}
            class="search-input"
        />
        {#if brands.length > 1}
            <select bind:value={selectedBrand} class="brand-select">
                <option value="">All brands</option>
                {#each brands as brand}
                    <option value={brand}>{brand.charAt(0).toUpperCase() + brand.slice(1)}</option>
                {/each}
            </select>
        {/if}
        {#if showGroupBy}
            <select bind:value={groupBy} class="group-select">
                <option value="none">No grouping</option>
                <option value="brand">Group by brand</option>
                <option value="family">Group by family</option>
            </select>
        {/if}
    </div>
</div>

<style>
    .controls-row {
        display: flex;
        gap: 8px;
        align-items: center;
        flex-wrap: wrap;
    }

    .search-input {
        flex: 1;
        min-width: 200px;
        padding: 8px;
        box-sizing: border-box;
        border: 1px solid #ccc;
        border-radius: 4px;
    }

    .brand-select,
    .group-select {
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        background: white;
    }
</style>
