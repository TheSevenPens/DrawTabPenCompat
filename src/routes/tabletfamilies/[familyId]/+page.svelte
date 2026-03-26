<script>
  import DeviceTable from '../../../components/DeviceTable.svelte';

  export let data;
</script>

<svelte:head>
  <title>{data.family.name} ({data.family.id}) | SevenPens Wacom Compatibility</title>
</svelte:head>

<div class="tabletfamily-detail-page">
  <h1>{data.family.name}</h1>

  <section class="family-summary">
    <div><strong>Family ID:</strong> {data.family.id}</div>
    <div><strong>Defined Tablets:</strong> {data.tablets.length}</div>
  </section>

  <section class="family-members">
    <h2>Tablets In This Family</h2>
    {#if data.tablets.length === 0}
      <p>No tablets found in this family.</p>
    {:else}
      <DeviceTable items={data.tablets} itemLabel="Tablet" familyLabel="Tablet Family" />
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

  .tabletfamily-detail-page h1 {
    text-align: left;
    margin-bottom: 10px;
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
