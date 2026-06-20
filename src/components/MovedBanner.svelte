<script>
  import { onMount } from 'svelte';

  const NEW_URL = 'https://thesevenpens.github.io/DrawTabDataExplorer/';
  const STORAGE_KEY = 'drawtabpencompat-moved-banner-dismissed';

  let dismissed = true; // start hidden to avoid SSR flash

  onMount(() => {
    try {
      dismissed = localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      dismissed = false;
    }
  });

  function dismiss() {
    dismissed = true;
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // ignore
    }
  }
</script>

{#if !dismissed}
  <div class="moved-banner" role="status">
    <div class="moved-banner-text">
      This site has moved. Visit
      <a href={NEW_URL}>DrawTabDataExplorer</a>
      for the new, more comprehensive UI.
    </div>
    <button class="moved-banner-dismiss" on:click={dismiss} aria-label="Dismiss">
      ×
    </button>
  </div>
{/if}

<style>
  .moved-banner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    background: #fff3cd;
    color: #664d03;
    border: 1px solid #ffe69c;
    border-radius: 6px;
    padding: 8px 12px;
    margin: 8px 0;
    font-weight: 500;
  }

  .moved-banner-text {
    text-align: center;
  }

  .moved-banner a {
    color: #0d47a1;
    font-weight: 600;
  }

  .moved-banner-dismiss {
    background: transparent;
    border: 0;
    color: #664d03;
    font-size: 1.4em;
    line-height: 1;
    cursor: pointer;
    padding: 0 6px;
  }

  .moved-banner-dismiss:hover {
    color: #000;
  }
</style>
