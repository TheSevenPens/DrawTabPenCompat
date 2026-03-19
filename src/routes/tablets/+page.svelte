<script>
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import DeviceTable from '../../components/DeviceTable.svelte';
  import { getCompatibilityData } from '../../lib/compatibility-data-store.js';

  let tablets = [];
  let loading = true;
  let errorMsg = '';

  onMount(async () => {
    try {
      const data = await getCompatibilityData(base);

      const uniqueTabletIds = new Set();
      for (const pair of data.pairs) {
        uniqueTabletIds.add(pair.tabletId);
      }

      tablets = Array.from(uniqueTabletIds)
        .map((id) => {
          const def = data.tabletDefs.get(id);
          const familyId = def?.familyId || '';
          return {
            id,
            name: def?.name || id,
            family: data.tabletFamilyDefs.get(familyId) || familyId || 'Unspecified'
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
  <title>Tablets | SevenPens Wacom Compatibility</title>
</svelte:head>

<div class="tablets-page">
  <h1>Unique Tablets</h1>

  {#if loading}
    <p>Loading tablet list...</p>
  {:else if errorMsg}
    <p class="error-msg">Failed to load tablets: {errorMsg}</p>
  {:else}
    <p class="count">{tablets.length} unique tablets</p>
    <DeviceTable items={tablets} itemLabel="Tablet" familyLabel="Tablet Family" />
  {/if}
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
</style>
