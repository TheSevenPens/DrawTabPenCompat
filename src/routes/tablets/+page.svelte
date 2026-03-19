<script>
  import DeviceTable from '../../components/DeviceTable.svelte';

  export let data;
</script>

<svelte:head>
  <title>Tablets | SevenPens Wacom Compatibility</title>
</svelte:head>

<div class="tablets-page">
  <h1>Unique Tablets</h1>
  <p class="count">{data.tablets.length} unique tablets</p>
  <DeviceTable items={data.tablets} itemLabel="Tablet" familyLabel="Tablet Family" />
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
