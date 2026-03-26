<script>
  export let data;

  $: totalWarnings =
    data.diagnostics.pensWithoutTablets.length +
    data.diagnostics.tabletsWithoutPens.length +
    data.diagnostics.duplicatePairs.length;

  $: loadedAtText = data.loadedAtIso
    ? new Date(data.loadedAtIso).toLocaleString()
    : 'Unknown';

  function labelFor(id, defsMap) {
    const def = defsMap.get(id);
    if (def && def.name && def.name !== id) {
      return `${def.name} (${id})`;
    }
    return id;
  }

</script>

<svelte:head>
  <title>Log | SevenPens Wacom Compatibility</title>
</svelte:head>

<div class="log-page">
  <div class="log-header">
    <h1>Data Load Log</h1>
    <span class="warning-badge" aria-label="total warning count">
      {totalWarnings} warnings
    </span>
  </div>

  <p class="loaded-at">Last loaded: {loadedAtText}</p>

    <section class="log-section">
      <h2>Pens Defined But No Tablets Listed</h2>
      {#if data.diagnostics.pensWithoutTablets.length === 0}
        <p class="ok">None found.</p>
      {:else}
        <p>{data.diagnostics.pensWithoutTablets.length} pens found.</p>
        <ul>
          {#each data.diagnostics.pensWithoutTablets as penId}
            <li>{labelFor(penId, data.penDefs)}</li>
          {/each}
        </ul>
      {/if}
    </section>

    <section class="log-section">
      <h2>Tablets Defined But No Pens Listed</h2>
      {#if data.diagnostics.tabletsWithoutPens.length === 0}
        <p class="ok">None found.</p>
      {:else}
        <p>{data.diagnostics.tabletsWithoutPens.length} tablets found.</p>
        <ul>
          {#each data.diagnostics.tabletsWithoutPens as tabletId}
            <li>{labelFor(tabletId, data.tabletDefs)}</li>
          {/each}
        </ul>
      {/if}
    </section>

    <section class="log-section">
      <h2>Duplicate (Tablet, Pen) Pairs In Source</h2>
      {#if data.diagnostics.duplicatePairs.length === 0}
        <p class="ok">None found.</p>
      {:else}
        <p>{data.diagnostics.duplicatePairs.length} duplicate pair keys found.</p>
        <table class="dup-table">
          <thead>
            <tr>
              <th>Tablet</th>
              <th>Pen</th>
              <th>Occurrences</th>
            </tr>
          </thead>
          <tbody>
            {#each data.diagnostics.duplicatePairs as pair}
              <tr>
                <td>{labelFor(pair.tabletId, data.tabletDefs)}</td>
                <td>{labelFor(pair.penId, data.penDefs)}</td>
                <td>{pair.occurrences}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </section>
</div>

<style>
  .log-page {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 16px;
    margin: 0 auto;
  }

  .log-page h1 {
    text-align: left;
    margin: 0;
  }

  .log-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
  }

  .warning-badge {
    background: #ffe8cc;
    color: #7a4500;
    border: 1px solid #ffd09b;
    border-radius: 999px;
    padding: 4px 10px;
    font-size: 0.9rem;
    font-weight: 700;
    white-space: nowrap;
  }

  .loaded-at {
    margin: 0 0 10px;
    color: #666;
    font-size: 0.95rem;
  }

  .log-section {
    margin-top: 16px;
    padding-top: 10px;
    border-top: 1px solid #e5e7eb;
  }

  .log-section:first-of-type {
    margin-top: 0;
    padding-top: 0;
    border-top: 0;
  }

  .log-section h2 {
    margin: 0 0 8px;
    font-size: 1.05rem;
  }

  .ok {
    color: #2e7d32;
    font-weight: 600;
  }

  .dup-table {
    width: 100%;
    border-collapse: collapse;
    background: #fff;
  }

  .dup-table th,
  .dup-table td {
    border: 1px solid #e1e5e9;
    padding: 6px 8px;
    text-align: left;
    vertical-align: top;
  }

  .dup-table th {
    background: #f1f3f5;
  }
</style>
