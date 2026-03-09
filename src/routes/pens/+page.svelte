<script>
  import { onMount } from 'svelte';
  import { base } from '$app/paths';

  let pens = [];
  let loading = true;
  let errorMsg = '';
  let sortKey = 'pen';
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
    <table>
      <thead>
        <tr>
          <th>
            <button class="sort-btn" on:click={() => toggleSort('pen')}>
              Pen{sortIndicator('pen')}
            </button>
          </th>
          <th>
            <button class="sort-btn" on:click={() => toggleSort('family')}>
              Pen Family{sortIndicator('family')}
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        {#each sortedPens as pen}
          <tr>
            <td>
              <strong>{pen.id}</strong>
              {#if pen.name && pen.name !== pen.id}
                <span> - {pen.name}</span>
              {/if}
            </td>
            <td>{pen.family}</td>
          </tr>
        {/each}
      </tbody>
    </table>
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

  .pens-page table {
    box-shadow: none;
  }

  .pens-page th:first-child,
  .pens-page td:first-child {
    width: 72%;
  }

  .pens-page th:last-child,
  .pens-page td:last-child {
    width: 28%;
  }

  .sort-btn {
    text-align: left;
    width: 100%;
    font: inherit;
    color: inherit;
    font-weight: 600;
    border: 0;
    background: transparent;
    padding: 0;
    cursor: pointer;
  }

  .sort-btn:hover {
    text-decoration: underline;
  }
</style>
