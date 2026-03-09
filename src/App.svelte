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
  let penFamilyDefs = new Map();
  let tabletFamilyDefs = new Map();

  let loading = true;
  let errorMsg = "";

  let viewMode = "grouped";
  let organizeByFamily = false;
  let onePerLine = true;
  let showIdsOnly = false;
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
      penFamilyDefs = data.penFamilyDefs;
      tabletFamilyDefs = data.tabletFamilyDefs;
      loading = false;
    } catch (err) {
      console.error("Failed to load data:", err);
      errorMsg = err.message;
      loading = false;
    }
  });
</script>

<div class="app-container">
  <h1>SevenPens Wacom Pen Compatibility</h1>
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
      bind:viewMode
      bind:organizeByFamily
      bind:onePerLine
      bind:showIdsOnly
      bind:searchTerm
      {compatibilityRows}
      {tabletDefs}
      {penDefs}
    />

    <CompatTable
      {viewMode}
      {organizeByFamily}
      {onePerLine}
      {showIdsOnly}
      {searchTerm}
      {compatibilityRows}
      {tabletDefs}
      {penDefs}
      {penFamilyDefs}
      {tabletFamilyDefs}
    />
  {/if}
</div>

<style>
  /* Base styles imported in main or handled globally, so just component specific styles here if needed */
</style>
