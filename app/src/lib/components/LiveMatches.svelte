<script>
  import { liveMatches } from '../stores/tournament.js';
  import LiveTeamBlock from './LiveTeamBlock.svelte';
</script>

{#if $liveMatches.length === 0}
  <p class="live-empty">暂无比赛 · 数据源 TheSportsDB</p>
{:else}
  {#each $liveMatches as ev (ev.metaLeft + ev.home + ev.away)}
    <article class="live-match" class:is-live={ev.live}>
      <div class="meta">
        <span>{ev.metaLeft}</span>
        <span class:status-live={ev.live}>{ev.statusText}</span>
      </div>
      <div class="scoreline">
        <LiveTeamBlock name={ev.home} />
        <div class="score">{ev.homeScore} : {ev.awayScore}</div>
        <LiveTeamBlock name={ev.away} />
      </div>
      {#if ev.venue}
        <div class="venue">{ev.venue}</div>
      {/if}
    </article>
  {/each}
{/if}
