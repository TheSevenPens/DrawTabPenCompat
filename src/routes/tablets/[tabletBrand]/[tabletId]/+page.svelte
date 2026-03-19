<script>
  import DisclaimerBanner from '../../../../components/DisclaimerBanner.svelte';
  import DeviceTable from '../../../../components/DeviceTable.svelte';

  export let data;

  $: pageTitle = data.tablet.name && data.tablet.name !== data.tablet.id
    ? `${data.tablet.name} (${data.tablet.id})`
    : data.tablet.id;
</script>

<svelte:head>
  <title>{pageTitle} | SevenPens Wacom Compatibility</title>
</svelte:head>

<div class="tablet-detail-page">
  <h1>{pageTitle}</h1>
  <DisclaimerBanner />

  <section class="tablet-summary">
    <div><strong>Tablet ID:</strong> {data.tablet.id}</div>
    <div><strong>Tablet Family:</strong> {data.tablet.family}</div>
    <div><strong>Compatible Pens:</strong> {data.pens.length}</div>
  </section>

  <section class="tablet-pens">
    <h2>Compatible Pens</h2>
    {#if data.pens.length === 0}
      <p>No compatible pens found for this tablet.</p>
    {:else}
      <DeviceTable items={data.pens} itemLabel="Pen" familyLabel="Pen Family" />
    {/if}
  </section>
</div>

<style>
  .tablet-detail-page {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 16px;
    margin: 0 auto;
  }

  .tablet-detail-page h1 {
    text-align: left;
    margin-bottom: 10px;
  }

  .tablet-summary {
    display: grid;
    gap: 6px;
    margin-bottom: 16px;
    color: #333;
  }

  .tablet-pens h2 {
    margin: 0 0 8px;
    font-size: 1.05rem;
  }
</style>
