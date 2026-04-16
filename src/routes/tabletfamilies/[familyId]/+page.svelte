<script>
  import DeviceTable from '../../../components/DeviceTable.svelte';
  import CopyButton from '../../../components/CopyButton.svelte';

  export let data;

  $: familySummaryText = `${data.family.name} (${data.family.id})\nTablets: ${data.tablets.map(t => t.id).join(', ')}`;
</script>

<svelte:head>
  <title>{data.family.name} ({data.family.id}) | DrawTabData Explorer</title>
</svelte:head>

<div class="tabletfamily-detail-page">
  <div class="title-row">
    <h1>{data.family.name}</h1>
    <CopyButton text={familySummaryText} label="Copy" />
  </div>

  <section class="family-members">
    <h2>Tablets In This Family ({data.tablets.length})</h2>
    {#if data.tablets.length === 0}
      <p>No tablets found in this family.</p>
    {:else}
      <DeviceTable items={data.tablets} itemLabel="Tablet" hideFamily />
    {/if}
  </section>
</div>

<style>
  .tabletfamily-detail-page {
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

  .tabletfamily-detail-page h1 {
    text-align: left;
    margin-bottom: 0;
  }

  .family-summary {
    display: grid;
    gap: 6px;
    margin-bottom: 16px;
    color: #333;
  }

  .family-members h2 {
    margin: 0 0 8px;
    font-size: 1.05rem;
  }
</style>
