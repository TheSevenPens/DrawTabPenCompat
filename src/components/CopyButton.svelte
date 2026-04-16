<script>
  export let text = '';
  export let label = 'Copy';

  let copied = false;

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
      setTimeout(() => { copied = false; }, 1500);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      copied = true;
      setTimeout(() => { copied = false; }, 1500);
    }
  }
</script>

<button class="copy-btn" on:click={copyToClipboard} title="Copy to clipboard">
  {copied ? 'Copied!' : label}
</button>

<style>
  .copy-btn {
    display: inline-block;
    padding: 2px 8px;
    cursor: pointer;
    background: #eee;
    border: 1px solid #ccc;
    border-radius: 4px;
    color: #333;
    font-size: 0.85em;
    vertical-align: middle;
  }

  .copy-btn:hover {
    background: #ddd;
  }
</style>
