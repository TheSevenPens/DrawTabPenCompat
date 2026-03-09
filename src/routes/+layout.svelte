<script>
  import '../app.css';
  import { base } from '$app/paths';
</script>

<nav class="site-nav">
  <a href={`${base}/`}>Compatibility Table</a>
  <a href={`${base}/about/`}>About</a>
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
