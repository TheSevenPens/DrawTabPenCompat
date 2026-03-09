<script>
  import { onMount } from 'svelte';
  import { base } from '$app/paths';

  let tablets = [];
  let loading = true;
  let errorMsg = '';

  onMount(async () => {
    try {
      const [compatRes, tabletsRes] = await Promise.all([
        fetch(`${base}/data/wacom-pen-compat.json`),
        fetch(`${base}/data/wacom-tablets.json`)
      ]);

      if (!compatRes.ok || !tabletsRes.ok) {
        throw new Error('Failed to fetch tablet data');
      }

      const compatData = await compatRes.json();
      const tabletsData = await tabletsRes.json();

      const tabletFamilyDefs = new Map(
        (tabletsData.tabletfamilydefs || []).map((def) => [def.id, def.name])
      );
      const tabletDefs = new Map(
        (tabletsData.tabletdefs || []).map((def) => [def.id, def])
      );

      const uniqueTabletIds = new Set();
      for (const row of compatData.compatrows || []) {
        for (const tabletId of row.tablets || []) {
          uniqueTabletIds.add(tabletId);
        }
      }

      tablets = Array.from(uniqueTabletIds)
        .map((id) => {
          const def = tabletDefs.get(id);
          const familyId = def?.familyid || '';
          return {
            id,
            name: def?.name || id,
            family: tabletFamilyDefs.get(familyId) || familyId || 'Unspecified'
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
    <table>
      <thead>
        <tr>
          <th>Tablet</th>
          <th>Tablet Family</th>
        </tr>
      </thead>
      <tbody>
        {#each tablets as tablet}
          <tr>
            <td>
              <strong>{tablet.id}</strong>
              {#if tablet.name && tablet.name !== tablet.id}
                <span> - {tablet.name}</span>
              {/if}
            </td>
            <td>{tablet.family}</td>
          </tr>
        {/each}
      </tbody>
    </table>
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

  .tablets-page table {
    box-shadow: none;
  }

  .tablets-page th:first-child,
  .tablets-page td:first-child {
    width: 72%;
  }

  .tablets-page th:first-child {
    text-align: left;
  }

  .tablets-page th:last-child,
  .tablets-page td:last-child {
    width: 28%;
  }
</style>
