<script>
  import { standingsGroups } from '../stores/tournament.js';
  import FlagButton from './FlagButton.svelte';
</script>

{#if $standingsGroups.length === 0}
  <p class="live-empty">暂无小组数据</p>
{:else}
  {#each $standingsGroups as group (group.letter)}
    <div class="group-block">
      <h4>小组 {group.letter}</h4>
      <table class="standings-table">
        <thead>
          <tr>
            <th>#</th><th>球队</th><th>赛</th><th>胜</th><th>平</th><th>负</th><th>进</th><th>失</th><th>分</th>
          </tr>
        </thead>
        <tbody>
          {#each group.rows as row (row.zh)}
            <tr class:top2={row.rank <= 2}>
              <td class="rank">{row.rank}</td>
              <td>
                <div class="team-cell">
                  <FlagButton name={row.zh} />
                  <span>{row.zh}</span>
                </div>
              </td>
              <td>{row.played}</td>
              <td>{row.win}</td>
              <td>{row.draw}</td>
              <td>{row.loss}</td>
              <td>{row.gf}</td>
              <td>{row.ga}</td>
              <td class="pts">{row.pts}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/each}
{/if}
