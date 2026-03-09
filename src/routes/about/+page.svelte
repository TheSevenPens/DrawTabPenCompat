<script>
  import { base } from '$app/paths';
</script>

<svelte:head>
  <title>About | SevenPens Wacom Compatibility</title>
</svelte:head>

<div class="about-page">
  <h1>About This Project</h1>
  <p>
    This site helps cross-reference Wacom pens and tablets using published compatibility
    data files.
  </p>
  <p>
    <a href={`${base}/`}>Pen compatibility</a>
  </p>
</div>

<style>
  .about-page {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 16px;
    margin: 0 auto;
  }

  .about-page h1 {
    text-align: left;
    margin-bottom: 8px;
  }
</style>
