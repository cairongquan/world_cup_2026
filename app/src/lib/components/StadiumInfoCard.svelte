<script>
  import { stadiumBackVisible, activeVenueId } from '../stores/ui.js';
  import { venues } from '../data/venues.js';
  import { getVenueStadiumInfo } from '../data/venueStadiumInfo.js';

  let venue = $derived(venues.find((v) => v.id === $activeVenueId));
  let info = $derived(venue ? getVenueStadiumInfo(venue.id) : null);
  let visible = $derived($stadiumBackVisible && venue && info);
</script>

{#if visible}
  <aside
    class="stadium-info-card"
    style="--stadium-accent: {venue.color}"
    aria-label="{venue.name} 场馆信息"
  >
    <div class="stadium-info-header">
      <h3 class="stadium-info-title">{venue.name}</h3>
      <p class="stadium-info-sub">
        {@html venue.country} · {venue.city}
        <span class="stadium-info-matches">{venue.matchCount} 场</span>
      </p>
      {#if info.nameEn}
        <p class="stadium-info-en">{info.nameEn}</p>
      {/if}
    </div>
    <dl class="stadium-info-grid">
      <div class="stadium-info-row">
        <dt>建成年份</dt>
        <dd>{info.opened}</dd>
      </div>
      <div class="stadium-info-row">
        <dt>可容纳</dt>
        <dd>{info.capacity}</dd>
      </div>
      <div class="stadium-info-row stadium-info-row--full">
        <dt>主队主场</dt>
        <dd>{info.home}</dd>
      </div>
    </dl>
  </aside>
{/if}
