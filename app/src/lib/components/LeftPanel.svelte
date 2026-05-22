<script>
  import { panelLeftHidden } from '../stores/ui.js';
  import { standingsUpdated, liveUpdated, liveCountLabel } from '../stores/tournament.js';
  import StandingsList from './StandingsList.svelte';
  import LiveMatches from './LiveMatches.svelte';
</script>

<div class="panel panel-left" class:hidden={$panelLeftHidden}>
  <div class="panel-header">
    <h2>赛况 <span>直播</span></h2>
    <button
      class="panel-toggle"
      type="button"
      aria-label="关闭左侧面板"
      onclick={() => panelLeftHidden.update((v) => !v)}
    >
      ✕
    </button>
  </div>
  <div class="standings-section">
    <h3>
      小组赛积分 <span>A–L</span>
      <span class="data-refresh">{$standingsUpdated}</span>
    </h3>
    <StandingsList />
  </div>
  <div class="live-section">
    <h3>
      实时赛况 <span>{$liveCountLabel}</span>
      <span class="data-refresh">{$liveUpdated}</span>
    </h3>
    <LiveMatches />
  </div>
</div>

{#if $panelLeftHidden}
  <button
    type="button"
    class="panel-left-show-btn"
    aria-label="打开赛况面板"
    onclick={() => panelLeftHidden.set(false)}
  >
    ⚡
  </button>
{/if}
