<script>
  import { onMount } from "svelte";
  import { base } from "$app/paths";
  import Controls from "./components/Controls.svelte";
  import CompatTable from "./components/CompatTable.svelte";
  import DisclaimerBanner from "./components/DisclaimerBanner.svelte";
  import { getCompatibilityData } from "./lib/compatibility-data-store.js";

  let compatibilityPairs = [];
  let tabletDefs = new Map();
  let penDefs = new Map();

  let loading = true;
  let errorMsg = "";

  let searchTerm = "";

  onMount(async () => {
    try {
      const data = await getCompatibilityData(base);
      compatibilityPairs = data.pairs;
      tabletDefs = data.tabletDefs;
      penDefs = data.penDefs;
      loading = false;
    } catch (err) {
      console.error("Failed to load data:", err);
      errorMsg = err.message;
      loading = false;
    }
  });
</script>

<div class="app-container">
  <DisclaimerBanner />

  {#if loading}
    <div class="controls">
      <p>Loading <code>data/wacom-pen-compat.json</code>...</p>
    </div>
  {:else if errorMsg}
    <p class="error-msg" style="display: block;">
      Failed to load compatibility data: {errorMsg}
    </p>
  {:else}
    <Controls
      bind:searchTerm
    />

    <CompatTable
      {searchTerm}
      {compatibilityPairs}
      {tabletDefs}
      {penDefs}
    />
  {/if}
</div>

<style>
  /* Base styles imported in main or handled globally, so just component specific styles here if needed */
</style>
