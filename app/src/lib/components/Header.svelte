<script>
  import { bracketModalOpen } from '../stores/ui.js';
  import { refreshBracketViews } from '../services/bracketViews.js';

  async function openBracket() {
    bracketModalOpen.set(true);
    await refreshBracketViews();
  }
</script>

<header class="header">
  <h1>🌐 2026 世界杯 <span>场馆地图</span></h1>
  <p>16 座城市 · 48 支球队 · 点击国旗查看阵容</p>
  <button type="button" class="header-schedule-btn" onclick={openBracket}>📅 赛程图</button>
</header>
