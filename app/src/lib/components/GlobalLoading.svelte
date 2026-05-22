<script>
  import { globalMapLoading } from '../stores/ui.js';
</script>

{#if $globalMapLoading}
  <div
    class="global-loading"
    role="status"
    aria-live="polite"
    aria-busy="true"
    aria-label="加载球场"
  >
    <div class="loader" aria-hidden="true"></div>
  </div>
{/if}
