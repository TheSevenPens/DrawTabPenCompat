<script>
  import DeviceTable from '../../components/DeviceTable.svelte';

  export let data;
  let sortKey = 'item';
  let sortDirection = 'asc';

  $: sortedPens = [...data.pens].sort((a, b) => {
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
  <h1>Unique Pens</h1>
  <p class="count">{data.pens.length} unique pens</p>
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
