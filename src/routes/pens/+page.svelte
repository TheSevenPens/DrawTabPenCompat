<script>
  import Controls from '../../components/Controls.svelte';
  import DeviceTable from '../../components/DeviceTable.svelte';
  import { matchesDeviceSearch } from '../../lib/device-search.js';

  export let data;
  let searchTerm = '';
  let sortKey = 'item';
  let sortDirection = 'asc';

  $: filteredPens = data.pens.filter((pen) => matchesDeviceSearch(pen, searchTerm));

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

  function getPenSortValue(pen) {
    // Sort by id first, then name for stable and intuitive ordering.
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
  <title>Pens | SevenPens Wacom Compatibility</title>
</svelte:head>

<div class="pens-page">
  <h1>Pens</h1>
  <Controls bind:searchTerm placeholder="Search pens ..." />
  <p class="count">{filteredPens.length} of {data.pens.length} pens</p>
  <DeviceTable
    items={sortedPens}
    itemLabel="Pen"
    familyLabel="Pen Family"
    sortable={true}
    onToggleSort={toggleSort}
    {sortIndicator}
  />
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
</style>
