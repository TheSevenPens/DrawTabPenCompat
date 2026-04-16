<script>
  import Controls from '../../components/Controls.svelte';
  import DeviceTable from '../../components/DeviceTable.svelte';
  import { matchesDeviceSearch } from '../../lib/device-search.js';

  export let data;
  let searchTerm = '';
  let selectedBrand = '';
  let groupBy = 'none';
  let sortKey = 'item';
  let sortDirection = 'asc';

  $: filteredPens = data.pens.filter((pen) => {
    if (selectedBrand && pen.brand !== selectedBrand) return false;
    return matchesDeviceSearch(pen, searchTerm);
  });

  $: sortedPens = [...filteredPens].sort((a, b) => {
    let left = '';
    let right = '';

    if (sortKey === 'family') {
      left = a.family;
      right = b.family;
    } else {
      left = getPenSortValue(a);
      right = getPenSortValue(b);
    }

    const compared = left.localeCompare(right, undefined, { numeric: true, sensitivity: 'base' });
    return sortDirection === 'asc' ? compared : -compared;
  });

  $: groups = buildGroups(sortedPens, groupBy);

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

  function getPenSortValue(pen) {
    return `${pen.id} ${pen.name || ''}`;
  }

  function toggleSort(nextKey) {
    if (sortKey === nextKey) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      return;
    }
    sortKey = nextKey;
    sortDirection = 'asc';
  }

  function sortIndicator(columnKey) {
    if (sortKey !== columnKey) return '';
    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  }
</script>

<svelte:head>
  <title>Pens | DrawTabData Explorer</title>
</svelte:head>

<div class="pens-page">
  <h1>Pens</h1>
  <Controls
    bind:searchTerm
    placeholder="Search pens ..."
    brands={data.brands}
    bind:selectedBrand
    bind:groupBy
    showGroupBy={true}
  />
  <p class="count">{filteredPens.length} of {data.pens.length} pens</p>

  {#each groups as group}
    {#if group.label}
      <h2 class="group-heading">{group.label} <span class="group-count">({group.items.length})</span></h2>
    {/if}
    <DeviceTable
      items={group.items}
      itemLabel="Pen"
      familyLabel="Pen Family"
      sortable={groupBy === 'none'}
      onToggleSort={toggleSort}
      {sortIndicator}
    />
  {/each}
</div>

<style>
  .pens-page {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 16px;
    margin: 0 auto;
  }

  .pens-page h1 {
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
