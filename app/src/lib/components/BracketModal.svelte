<script>
  import { bracketModalOpen } from '../stores/ui.js';
  import { bracketGroups, bracketKnockout, bracketLoading } from '../stores/bracket.js';
  import FlagButton from './FlagButton.svelte';

  let open = $derived($bracketModalOpen);

  function close() {
    bracketModalOpen.set(false);
  }

  function onBackdropClick(e) {
    if (e.currentTarget === e.target) close();
  }

  function onKeydown(e) {
    if (e.key === 'Escape') close();
  }

  function showFlag(slot) {
    return slot && !slot.pending && slot.main && !/组第|胜者|负者|小组第|待定/.test(slot.main);
  }
</script>

<svelte:window onkeydown={onKeydown} />

<div
  class="bracket-modal-backdrop"
  class:open
  aria-hidden={!open}
  onclick={onBackdropClick}
  role="presentation"
>
  {#if open}
    <div
      class="bracket-modal"
      role="dialog"
      tabindex="-1"
      aria-labelledby="bracketModalTitle"
      onclick={(e) => e.stopPropagation()}
    >
      <button type="button" class="bracket-modal-close" aria-label="关闭" onclick={close}>✕</button>
      <div class="bracket-modal-header">
        <h2 id="bracketModalTitle">2026 世界杯赛程</h2>
        <p>小组赛 → 决赛 · 横向滑动查看</p>
      </div>

      {#if $bracketLoading}
        <p class="bracket-loading">加载赛程…</p>
      {:else}
        <div class="bracket-viewport">
          <div class="bracket-scroll">
            {#if $bracketGroups.length}
              <section class="bracket-column bracket-column--groups">
                <h3>小组赛</h3>
                <div class="bracket-groups-grid">
                  {#each $bracketGroups as group (group.letter)}
                    <div class="bracket-group-card">
                      <div class="bracket-group-title">{group.label}</div>
                      <ul>
                        {#each group.teams as team}
                          <li>
                            {#if showFlag(team)}
                              <FlagButton name={team.main} className="bracket-flag" />
                            {/if}
                            <span title={team.main}>{team.main}</span>
                          </li>
                        {/each}
                      </ul>
                    </div>
                  {/each}
                </div>
              </section>
            {/if}

            {#each $bracketKnockout as col (col.key)}
              <section class="bracket-column" data-round={col.key}>
                <h3>{col.label}</h3>
                <div class="bracket-matches">
                  {#each col.matches as match (match.id)}
                    <article class="bracket-match">
                      {#if match.num}
                        <div class="bracket-match-num">#{match.num}</div>
                      {/if}
                      <div class="bracket-team" class:pending={match.home.pending}>
                        {#if showFlag(match.home)}
                          <FlagButton name={match.home.main} className="bracket-flag" />
                        {/if}
                        <span class="bracket-team-name" title={match.home.main}>{match.home.main}</span>
                      </div>
                      <div class="bracket-vs">VS</div>
                      <div class="bracket-team" class:pending={match.away.pending}>
                        {#if showFlag(match.away)}
                          <FlagButton name={match.away.main} className="bracket-flag" />
                        {/if}
                        <span class="bracket-team-name" title={match.away.main}>{match.away.main}</span>
                      </div>
                      <div
                        class="bracket-schedule"
                        class:pending={match.schedule.pending}
                        title={match.ground || ''}
                      >
                        {#if match.schedule.top}
                          <span class="bracket-schedule-q">{match.schedule.top}</span>
                        {/if}
                        <span class="bracket-schedule-time">{match.schedule.bottom}</span>
                      </div>
                    </article>
                  {/each}
                </div>
              </section>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>
