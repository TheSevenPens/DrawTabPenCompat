<script>
  import { onMount } from 'svelte';
  import '../app.css';
  import { base } from '$app/paths';
  import { getCompatibilityData } from '../lib/compatibility-data-store.js';

  onMount(() => {
    getCompatibilityData(base).catch((err) => {
      // Page-level loaders/components still handle their own error states.
      console.warn('Background compatibility prefetch failed', err);
    });
  });
</script>

<nav class="site-nav">
  <a href={`${base}/`}>Home</a>
  <a href={`${base}/tabletspens/`}>Browse compatibility</a>
  <a href={`${base}/tablets/`}>Tablets</a>
  <a href={`${base}/pens/`}>Pens</a>
  <a href={`${base}/log/`}>Log</a>
</nav>

<slot />

<style>
  .site-nav {
    display: flex;
    gap: 12px;
    justify-content: center;
    align-items: center;
    margin: 10px 0;
    padding: 6px;
    border-bottom: 1px solid #e9ecef;
  }

  .site-nav a {
    color: #0d47a1;
    text-decoration: none;
    font-weight: 600;
  }

  .site-nav a:hover {
    text-decoration: underline;
  }
</style>
