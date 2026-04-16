<script>
  import DisclaimerBanner from '../../../../components/DisclaimerBanner.svelte';
  import DeviceTable from '../../../../components/DeviceTable.svelte';
  import CopyButton from '../../../../components/CopyButton.svelte';

  export let data;

  $: pageTitle = data.pen.name && data.pen.name !== data.pen.id
    ? `${data.pen.name} (${data.pen.id})`
    : data.pen.id;

  $: penSummaryText = `${pageTitle}\nPen ID: ${data.pen.id}\nPen Family: ${data.pen.family}\nCompatible Tablets: ${data.tablets.map(t => t.id).join(', ')}`;
</script>

<svelte:head>
  <title>{pageTitle} | DrawTabData Explorer</title>
</svelte:head>

<div class="pen-detail-page">
  <div class="title-row">
    <h1>{pageTitle}</h1>
    <CopyButton text={penSummaryText} label="Copy" />
  </div>

  <section class="pen-summary">
    <div><strong>Pen ID:</strong> {data.pen.id}</div>
    <div><strong>Pen Family:</strong> {data.pen.family}</div>
  </section>

  <section class="pen-tablets">
    <h2>Compatible Tablets ({data.tablets.length})</h2>
    <DisclaimerBanner />
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

  .title-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
  }

  .pen-detail-page h1 {
    text-align: left;
    margin-bottom: 0;
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
