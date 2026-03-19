<script>
  import Controls from '../../components/Controls.svelte';
  import DeviceTable from '../../components/DeviceTable.svelte';
  import DisclaimerBanner from '../../components/DisclaimerBanner.svelte';
  import { matchesDeviceSearch } from '../../lib/device-search.js';

  export let data;

  let searchTerm = '';

  $: filteredFamilies = data.families.filter((family) =>
    matchesDeviceSearch(family, searchTerm)
  );
</script>

<svelte:head>
  <title>Tablet Families | SevenPens Wacom Compatibility</title>
</svelte:head>

<div class="tabletfamilies-page">
  <h1>Tablet Families</h1>
  <DisclaimerBanner />
  <Controls bind:searchTerm placeholder="Search tablet families ..." />
  <p class="count">{filteredFamilies.length} of {data.families.length} tablet families</p>
  <DeviceTable items={filteredFamilies} itemLabel="Tablet Family" familyLabel="Tablets" />
</div>

<style>
  .tabletfamilies-page {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 16px;
    margin: 0 auto;
  }

  .tabletfamilies-page h1 {
    text-align: left;
    margin-bottom: 8px;
  }

  .count {
    color: #666;
    margin-bottom: 10px;
  }
</style>
