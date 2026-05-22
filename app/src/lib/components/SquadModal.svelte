<script>
  import { squadModalTeam } from '../stores/ui.js';
  import { squadsData } from '../stores/squads.js';
  import { fixPlayerPhotoUrl } from '../services/squads.js';
  import { formatSquadAnnouncedAt } from '../formatSquadDate.js';
  import FlagImg from './FlagImg.svelte';

  let team = $derived($squadModalTeam);
  let squad = $derived(team ? $squadsData?.[team] : null);
  let open = $derived(!!team);
  let hasSquadPoster = $derived(!!squad?.squadPoster);
  let announcedLabel = $derived(
    squad?.announcedAt ? formatSquadAnnouncedAt(squad.announcedAt) : '',
  );

  function close() {
    squadModalTeam.set(null);
  }

  function onBackdropClick(e) {
    if (e.currentTarget === e.target) close();
  }

  function onKeydown(e) {
    if (e.key === 'Escape') close();
  }

  function playerFallback(name) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e3a5f&color=e8edf5&size=128&bold=true`;
  }

  const sections = $derived(
    squad
      ? [
          ['重点关注球员', squad.keyPlayers],
          ['门将', squad.goalkeepers],
          ['后卫', squad.defenders],
          ['中场', squad.midfielders],
          ['前锋', squad.forwards],
        ]
      : [],
  );
</script>

<svelte:window onkeydown={onKeydown} />

<div
  class="squad-modal-backdrop"
  class:open
  aria-hidden={!open}
  onclick={onBackdropClick}
  role="presentation"
>
  {#if team}
    <div
      class="squad-modal"
      class:has-poster={hasSquadPoster}
      role="dialog"
      aria-labelledby="squadModalTitle"
    >
      <button type="button" class="squad-modal-close" aria-label="关闭" onclick={close}>✕</button>
      {#if hasSquadPoster}
        <div class="squad-poster-pane" aria-hidden="true">
          <img src={squad.squadPoster} alt="" loading="lazy" decoding="async" />
        </div>
      {/if}
      <div class="squad-modal-main">
      <div class="squad-modal-header">
        <FlagImg name={team} className="flag-img" />
        <div class="squad-modal-header-text">
          <h3 id="squadModalTitle">{team}</h3>
          {#if squad}
            <div class="coach">
              主教练：<span>{squad.coachZh || squad.coach}</span>
              {#if squad.coach && squad.coachZh}
                ({squad.coach})
              {/if}
            </div>
            {#if announcedLabel}
              <div class="announced-at">📅 {announcedLabel}</div>
            {/if}
            {#if squad.squadStatusLabel}
              <div class="status">{squad.squadStatusLabel}</div>
            {/if}
            {#if squad.marketValueZh}
              <div class="squad-market-value">全队身价：{squad.marketValueZh}</div>
            {/if}
          {:else}
            <div class="coach">暂无阵容数据</div>
          {/if}
        </div>
      </div>
      <div class="squad-modal-body">
        {#if !squad}
          <p class="squad-note">请稍后刷新，或运行 node scripts/sync-squads-online.mjs 更新数据。</p>
        {:else}
          {#if squad.note && !announcedLabel}
            <p class="squad-note">{squad.note}</p>
          {/if}
          {#each sections as [title, players]}
            {#if players?.length}
              <div class="squad-section">
                <h4>{title}</h4>
                <ul>
                  {#each players as p}
                    {@const pl = typeof p === 'string' ? { nameZh: p } : p}
                    {@const name = pl.nameZh || pl.nameEn || '—'}
                    {@const meta = [pl.clubZh, pl.nameEn && pl.nameZh ? pl.nameEn : ''].filter(Boolean).join(' · ')}
                    {@const photo = fixPlayerPhotoUrl(pl.photo) || playerFallback(name)}
                    <li class="squad-player">
                      <img
                        class="squad-player-avatar"
                        src={photo}
                        alt=""
                        loading="lazy"
                        referrerpolicy="no-referrer"
                        onerror={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = playerFallback(name);
                        }}
                      />
                      <div class="squad-player-info">
                        <div class="squad-player-name">{name}</div>
                        {#if meta}
                          <div class="squad-player-meta">{meta}</div>
                        {/if}
                      </div>
                      {#if pl.valueZh}
                        <span class="squad-player-value">{pl.valueZh}</span>
                      {/if}
                    </li>
                  {/each}
                </ul>
              </div>
            {/if}
          {/each}
          <p class="squad-source">阵容来源：Sky Sports / 各国足协 · 身价：Transfermarkt 估算</p>
        {/if}
      </div>
      </div>
    </div>
  {/if}
</div>
