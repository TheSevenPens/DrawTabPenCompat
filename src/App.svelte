<script>
  import { onMount } from "svelte";
  import { base } from "$app/paths";
  import Controls from "./components/Controls.svelte";
  import CompatTable from "./components/CompatTable.svelte";
  import DisclaimerBanner from "./components/DisclaimerBanner.svelte";
  import { fetchAndParseJSON } from "./lib/data-loader.js";

  let compatibilityRows = [];
  let tabletDefs = new Map();
  let penDefs = new Map();

  let loading = true;
  let errorMsg = "";

  let searchTerm = "";

  onMount(async () => {
    try {
      const data = await fetchAndParseJSON(
        `${base}/data/wacom-pen-compat.json`,
        `${base}/data/wacom-tablets.json`,
        `${base}/data/wacom-pens.json`,
      );
      compatibilityRows = data.rows;
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
      {compatibilityRows}
      {tabletDefs}
      {penDefs}
    />

    <CompatTable
      {searchTerm}
      {compatibilityRows}
      {tabletDefs}
      {penDefs}
    />
  {/if}
</div>

<style>
  /* Base styles imported in main or handled globally, so just component specific styles here if needed */
</style>
