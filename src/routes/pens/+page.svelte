<script>
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import DeviceTable from '../../components/DeviceTable.svelte';

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
      const [compatRes, pensRes] = await Promise.all([
        fetch(`${base}/data/wacom-pen-compat.json`),
        fetch(`${base}/data/wacom-pens.json`)
      ]);

      if (!compatRes.ok || !pensRes.ok) {
        throw new Error('Failed to fetch pen data');
      }

      const compatData = await compatRes.json();
      const pensData = await pensRes.json();

      const penDefs = new Map((pensData.pendefs || []).map((def) => [def.id, def]));
      const penFamilyDefs = new Map((pensData.penfamilydefs || []).map((def) => [def.id, def.name]));
      const familyToPens = new Map();

      for (const def of pensData.pendefs || []) {
        if (!def.familyid) continue;
        if (!familyToPens.has(def.familyid)) {
          familyToPens.set(def.familyid, new Set());
        }
        familyToPens.get(def.familyid).add(def.id);
      }

      const uniquePenIds = new Set();
      for (const row of compatData.compatrows || []) {
        for (const penId of row.pens || []) {
          uniquePenIds.add(penId);
        }
        for (const familyId of row.penfamilies || []) {
          const familyPens = familyToPens.get(familyId);
          if (!familyPens) continue;
          for (const penId of familyPens) {
            uniquePenIds.add(penId);
          }
        }
      }

      pens = Array.from(uniquePenIds)
        .map((id) => {
          const def = penDefs.get(id);
          const familyId = def?.familyid || '';
          return {
            id,
            name: def?.name || id,
            family: penFamilyDefs.get(familyId) || familyId || 'Unspecified'
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
