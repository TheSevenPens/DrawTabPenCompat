<script>
  import Controls from '../../components/Controls.svelte';
  import DeviceTable from '../../components/DeviceTable.svelte';
  import { matchesDeviceSearch } from '../../lib/device-search.js';

  export let data;

  let searchTerm = '';
  let selectedBrand = '';
  let groupBy = 'none';

  $: filteredTablets = data.tablets.filter((tablet) => {
    if (selectedBrand && tablet.brand !== selectedBrand) return false;
    return matchesDeviceSearch(tablet, searchTerm);
  });

  $: groups = buildGroups(filteredTablets, groupBy);

  function buildGroups(items, mode) {
    if (mode === 'none') return [{ label: '', items }];
    const map = new Map();
    for (const item of items) {
      const key = mode === 'brand'
        ? (item.brand ? item.brand.charAt(0).toUpperCase() + item.brand.slice(1) : 'Unknown')
        : (item.family || 'Unspecified');
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, items]) => ({ label, items }));
  }
</script>

<svelte:head>
  <title>Tablets | DrawTabData Explorer</title>
</svelte:head>

<div class="tablets-page">
  <h1>Tablets</h1>
  <Controls
    bind:searchTerm
    placeholder="Search tablets ..."
    brands={data.brands}
    bind:selectedBrand
    bind:groupBy
    showGroupBy={true}
  />
  <p class="count">{filteredTablets.length} of {data.tablets.length} tablets</p>

  {#each groups as group}
    {#if group.label}
      <h2 class="group-heading">{group.label} <span class="group-count">({group.items.length})</span></h2>
    {/if}
    <DeviceTable items={group.items} itemLabel="Tablet" familyLabel="Tablet Family" />
  {/each}
</div>

<style>
  .tablets-page {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 16px;
    margin: 0 auto;
  }

  .tablets-page h1 {
    text-align: left;
    margin-bottom: 8px;
  }

  .count {
    color: #666;
    margin-bottom: 10px;
  }

  .group-heading {
    font-size: 1.1em;
    margin: 16px 0 4px;
    color: #2c3e50;
    border-bottom: 1px solid #dee2e6;
    padding-bottom: 4px;
  }

  .group-count {
    font-weight: normal;
    color: #888;
    font-size: 0.9em;
  }
</style>
