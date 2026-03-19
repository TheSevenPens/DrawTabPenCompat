<script>
    export let searchTerm;
</script>

<div class="controls">
    <div id="search-area" style="margin-bottom: 5px;">
        <input
            type="text"
            bind:value={searchTerm}
            placeholder="Search ..."
            style="width: 100%; max-width: 800px; padding: 8px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px;"
        />
    </div>

    <div id="options-area" style="margin-bottom: 0px;">
    </div>
</div>
