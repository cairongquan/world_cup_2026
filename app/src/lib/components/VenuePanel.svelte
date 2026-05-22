<script>
  import { panelRightHidden } from '../stores/ui.js';
  import VenueList from './VenueList.svelte';

  let { onSelectVenue } = $props();
</script>

<div class="panel" class:hidden={$panelRightHidden}>
  <div class="panel-header">
    <h2>比赛场馆 <span>(16)</span></h2>
    <button
      class="panel-toggle"
      type="button"
      onclick={() => panelRightHidden.update((v) => !v)}
    >
      ✕
    </button>
  </div>
  <VenueList {onSelectVenue} />
</div>

{#if $panelRightHidden}
  <button
    class="panel-show-btn"
    type="button"
    onclick={() => panelRightHidden.set(false)}
  >
    ☰
  </button>
{/if}
