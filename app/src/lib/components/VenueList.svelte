<script>
  import FlagButton from './FlagButton.svelte';
  import { venues } from '../data/venues.js';
  import { activeVenueId } from '../stores/ui.js';

  let { onSelectVenue } = $props();
</script>

{#each venues as v (v.id)}
  <div
    class="venue-item"
    class:active={$activeVenueId === v.id}
    role="button"
    tabindex="0"
    onclick={(e) => {
      if (e.target.closest('.team-flag-btn')) return;
      onSelectVenue(v.id);
    }}
    onkeydown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelectVenue(v.id);
      }
    }}
  >
    <div class="dot" style="background:{v.color};box-shadow:0 0 8px {v.color}40"></div>
    <div class="info">
      <div class="name">{v.name}</div>
      <div class="city">
        {@html v.country} · {v.city}
        <span class="match-count">{v.matchCount}场</span>
      </div>
      <div class="teams">
        {#each v.teams as t, i (`${v.id}-${i}-${t.name}`)}
          <span><FlagButton name={t.name} /></span>
        {/each}
      </div>
    </div>
  </div>
{/each}
