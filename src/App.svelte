<script>
  import Controls from "./components/Controls.svelte";
  import CompatTable from "./components/CompatTable.svelte";
  import DisclaimerBanner from "./components/DisclaimerBanner.svelte";

  export let compatibilityPairs = [];
  export let tabletDefs = new Map();
  export let penDefs = new Map();
  export let brands = [];

  let searchTerm = "";
  let selectedBrand = "";
</script>

<div class="app-container">
  <DisclaimerBanner />
  <Controls
    bind:searchTerm
    {brands}
    bind:selectedBrand
  />

  <CompatTable
    {searchTerm}
    {selectedBrand}
    {compatibilityPairs}
    {tabletDefs}
    {penDefs}
  />
</div>

<style>
  /* Base styles imported in main or handled globally, so just component specific styles here if needed */
</style>
