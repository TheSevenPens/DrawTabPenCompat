<script>
  import Controls from '../../components/Controls.svelte';
  import DeviceTable from '../../components/DeviceTable.svelte';

  import { matchesDeviceSearch } from '../../lib/device-search.js';

  export let data;

  let searchTerm = '';
  let selectedBrand = '';

  $: filteredFamilies = data.families.filter((family) => {
    if (selectedBrand && family.brand !== selectedBrand) return false;
    return matchesDeviceSearch(family, searchTerm);
  });
</script>

<svelte:head>
  <title>Pen Families | DrawTabData Explorer</title>
</svelte:head>

<div class="penfamilies-page">
  <h1>Pen Families</h1>
  <Controls bind:searchTerm placeholder="Search pen families ..." brands={data.brands} bind:selectedBrand />
  <p class="count">{filteredFamilies.length} of {data.families.length} pen families</p>
  <DeviceTable items={filteredFamilies} itemLabel="Pen Family" familyLabel="Pens" />
</div>

<style>
  .penfamilies-page {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 16px;
    margin: 0 auto;
  }

  .penfamilies-page h1 {
    text-align: left;
    margin-bottom: 8px;
  }

  .count {
    color: #666;
    margin-bottom: 10px;
  }
</style>
