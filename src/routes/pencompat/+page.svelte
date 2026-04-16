<script>
  import App from '../../App.svelte';

  export let data;
</script>

<svelte:head>
  <title>Browse Compatibility | DrawTabData Explorer</title>
</svelte:head>

<App
  compatibilityPairs={data.compatibilityPairs}
  tabletDefs={data.tabletDefs}
  penDefs={data.penDefs}
  brands={data.brands}
/>
