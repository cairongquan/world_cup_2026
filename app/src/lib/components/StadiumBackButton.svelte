<script>
  import { stadiumBackVisible } from '../stores/ui.js';

  let { onBack } = $props();
</script>

<button
  type="button"
  class="stadium-back-btn"
  class:visible={$stadiumBackVisible}
  aria-label="返回区域地图"
  onclick={onBack}
>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
  返回地图
</button>
