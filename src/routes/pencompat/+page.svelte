<script>
  import App from '../../App.svelte';

  export let data;
</script>

<svelte:head>
  <title>Browse Compatibility | SevenPens Wacom Compatibility</title>
</svelte:head>

<App
  compatibilityPairs={data.compatibilityPairs}
  tabletDefs={data.tabletDefs}
  penDefs={data.penDefs}
/>
