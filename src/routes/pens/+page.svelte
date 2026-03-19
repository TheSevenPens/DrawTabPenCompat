<script>
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import DeviceTable from '../../components/DeviceTable.svelte';
  import { getCompatibilityData } from '../../lib/compatibility-data-store.js';

  let pens = [];
  let loading = true;
  let errorMsg = '';
  let sortKey = 'item';
  let sortDirection = 'asc';

  $: sortedPens = [...pens].sort((a, b) => {
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

  onMount(async () => {
    try {
      const data = await getCompatibilityData(base);

      const uniquePenIds = new Set();
      for (const pair of data.pairs) {
        uniquePenIds.add(pair.penId);
      }

      pens = Array.from(uniquePenIds)
        .map((id) => {
          const def = data.penDefs.get(id);
          const familyId = def?.familyId || '';
          return {
            id,
            name: def?.name || id,
            family: data.penFamilyDefs.get(familyId) || familyId || 'Unspecified'
          };
        })
        .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
    } catch (err) {
      errorMsg = err?.message || 'Unknown error';
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head>
  <title>Pens | SevenPens Wacom Compatibility</title>
</svelte:head>

<div class="pens-page">
  <h1>Unique Pens</h1>

  {#if loading}
    <p>Loading pen list...</p>
  {:else if errorMsg}
    <p class="error-msg">Failed to load pens: {errorMsg}</p>
  {:else}
    <p class="count">{pens.length} unique pens</p>
    <DeviceTable
      items={sortedPens}
      itemLabel="Pen"
      familyLabel="Pen Family"
      sortable={true}
      onToggleSort={toggleSort}
      {sortIndicator}
    />
  {/if}
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
