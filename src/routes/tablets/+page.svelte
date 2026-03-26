<script>
  import Controls from '../../components/Controls.svelte';
  import DeviceTable from '../../components/DeviceTable.svelte';
  import { matchesDeviceSearch } from '../../lib/device-search.js';

  export let data;

  let searchTerm = '';

  $: filteredTablets = data.tablets.filter((tablet) =>
    matchesDeviceSearch(tablet, searchTerm)
  );
</script>

<svelte:head>
  <title>Tablets | SevenPens Wacom Compatibility</title>
</svelte:head>

<div class="tablets-page">
  <h1>Tablets</h1>
  <Controls bind:searchTerm placeholder="Search tablets ..." />
  <p class="count">{filteredTablets.length} of {data.tablets.length} tablets</p>
  <DeviceTable items={filteredTablets} itemLabel="Tablet" familyLabel="Tablet Family" />
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
