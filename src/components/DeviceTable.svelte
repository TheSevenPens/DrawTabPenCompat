<script>
  export let items = [];
  export let itemLabel = 'Device';
  export let familyLabel = 'Family';

  export let hideFamily = false;
  export let sortable = false;
  export let onToggleSort = () => {};
  export let sortIndicator = () => '';
</script>

<table>
  <thead>
    <tr>
      <th>
        {#if sortable}
          <button class="sort-btn" on:click={() => onToggleSort('item')}>
            {itemLabel}{sortIndicator('item')}
          </button>
        {:else}
          {itemLabel}
        {/if}
      </th>
      {#if !hideFamily}
      <th>
        {#if sortable}
          <button class="sort-btn" on:click={() => onToggleSort('family')}>
            {familyLabel}{sortIndicator('family')}
          </button>
        {:else}
          {familyLabel}
        {/if}
      </th>
      {/if}
    </tr>
  </thead>
  <tbody>
    {#each items as item}
      <tr>
        <td>
          {#if item.href}
            <a class="item-link" href={item.href}>{item.name || item.id}</a>
          {:else}
            {item.name || item.id}
          {/if}
        </td>
        {#if !hideFamily}<td>{item.family}</td>{/if}
      </tr>
    {/each}
  </tbody>
</table>

<style>
  table {
    box-shadow: none;
  }

  th:first-child,
  td:first-child {
    width: 72%;
  }

  th:first-child {
    text-align: left;
  }

  th:last-child,
  td:last-child {
    width: 28%;
  }

  .sort-btn {
    text-align: left;
    width: 100%;
    font: inherit;
    color: inherit;
    font-weight: 600;
    border: 0;
    background: transparent;
    padding: 0;
    cursor: pointer;
  }

  .sort-btn:hover {
    text-decoration: underline;
  }

  .item-link {
    color: #0d47a1;
    text-decoration: none;
  }

  .item-link:hover {
    text-decoration: underline;
  }
</style>
