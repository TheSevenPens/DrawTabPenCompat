<script>
  import { base } from '$app/paths';
  import DisclaimerBanner from '../components/DisclaimerBanner.svelte';
</script>

<svelte:head>
  <title>Home | SevenPens Wacom Compatibility</title>
</svelte:head>

<section class="home-page">
  <h1>Wacom pen compatibility</h1>
  <DisclaimerBanner />

  <div class="home-grid">
    <a class="home-card" href={`${base}/pencompat/`}>
      <h2>Browse compatibility</h2>
      <p>Open the full compatibility list.</p>
    </a>

    <a class="home-card" href={`${base}/tablets/`}>
      <h2>Tablets</h2>
      <p>Browse tablets.</p>
    </a>

    <a class="home-card" href={`${base}/tabletfamilies/`}>
      <h2>Tablet families</h2>
      <p>Browse tablet families.</p>
    </a>

    <a class="home-card" href={`${base}/pens/`}>
      <h2>Pens</h2>
      <p>Browse pens.</p>
    </a>

    <a class="home-card" href={`${base}/penfamilies/`}>
      <h2>Pen families</h2>
      <p>Browse pen families.</p>
    </a>

    <a class="home-card" href={`${base}/log/`}>
      <h2>Log</h2>
      <p>Review data quality warnings from the source JSON load. You don't need to look at this :-)</p>
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
