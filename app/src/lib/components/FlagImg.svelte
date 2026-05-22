<script>
  import { flagPath, flagCdnUrl } from '../flags.js';

  let { name, className = 'flag-img' } = $props();

  const src = $derived(flagPath(name));
  const fallback = $derived(flagCdnUrl(name));
  const local = $derived(
    name && flagPath(name).startsWith('assets/') ? flagPath(name) : '',
  );

  function onError(e) {
    const img = e.currentTarget;
    if (img.dataset.fb === '1' || !fallback) return;
    img.dataset.fb = '1';
    img.src = fallback;
  }
</script>

{#if src}
  <img
    class={className}
    {src}
    alt={name}
    title={name}
    loading="lazy"
    onerror={onError}
  />
{/if}
