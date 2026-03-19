<script>
  import { base } from '$app/paths';
</script>

<svelte:head>
  <title>Home | SevenPens Wacom Compatibility</title>
</svelte:head>

<section class="home-page">
  <h1>Welcome to SevenPens Wacom Compatibility</h1>
  <p class="intro">
    Explore Wacom pen and tablet compatibility data with dedicated views for the full matrix,
    individual tablets, and individual pens.
  </p>

  <div class="home-grid">
    <a class="home-card" href={`${base}/tabletspens/`}>
      <h2>Browse compatibility</h2>
      <p>Open the full compatibility matrix with search and grouping controls.</p>
    </a>

    <a class="home-card" href={`${base}/tablets/`}>
      <h2>Tablets</h2>
      <p>Browse unique tablets and their family groupings.</p>
    </a>

    <a class="home-card" href={`${base}/pens/`}>
      <h2>Pens</h2>
      <p>Browse unique pens and sort by pen or family.</p>
    </a>
  </div>
</section>

<style>
  .home-page {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 18px;
    margin: 0 auto;
  }

  .home-page h1 {
    margin: 0 0 8px;
    text-align: left;
  }

  .intro {
    color: #444;
    margin: 0 0 14px;
  }

  .home-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 10px;
  }

  .home-card {
    display: block;
    padding: 12px;
    border: 1px solid #d8dee4;
    border-radius: 8px;
    text-decoration: none;
    color: inherit;
    background: #fff;
  }

  .home-card:hover {
    border-color: #0d47a1;
  }

  .home-card h2 {
    margin: 0 0 6px;
    font-size: 1.05rem;
    color: #0d47a1;
  }

  .home-card p {
    margin: 0;
    color: #333;
  }
</style>
