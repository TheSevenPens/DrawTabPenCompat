<script>
  import DeviceTable from '../../../../components/DeviceTable.svelte';

  export let data;

  $: pageTitle = data.pen.name && data.pen.name !== data.pen.id
    ? `${data.pen.name} (${data.pen.id})`
    : data.pen.id;
</script>

<svelte:head>
  <title>{pageTitle} | SevenPens Wacom Compatibility</title>
</svelte:head>

<div class="pen-detail-page">
  <h1>{pageTitle}</h1>

  <section class="pen-summary">
    <div><strong>Pen ID:</strong> {data.pen.id}</div>
    <div><strong>Pen Family:</strong> {data.pen.family}</div>
    <div><strong>Compatible Tablets:</strong> {data.tablets.length}</div>
  </section>

  <section class="pen-tablets">
    <h2>Compatible Tablets</h2>
    {#if data.tablets.length === 0}
      <p>No compatible tablets found for this pen.</p>
    {:else}
      <DeviceTable items={data.tablets} itemLabel="Tablet" familyLabel="Tablet Family" />
    {/if}
  </section>
</div>

<style>
  .pen-detail-page {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 16px;
    margin: 0 auto;
  }

  .pen-detail-page h1 {
    text-align: left;
    margin-bottom: 10px;
  }

  .pen-summary {
    display: grid;
    gap: 6px;
    margin-bottom: 16px;
    color: #333;
  }

  .pen-tablets h2 {
    margin: 0 0 8px;
    font-size: 1.05rem;
  }
</style>
