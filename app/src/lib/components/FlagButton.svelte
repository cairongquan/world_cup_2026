<script>
  import FlagImg from './FlagImg.svelte';
  import { squadModalTeam } from '../stores/ui.js';

  let { name, className = 'flag-img' } = $props();
</script>

<button
  type="button"
  class="team-flag-btn"
  title="查看{name}阵容"
  onclick={() => squadModalTeam.set(name)}
>
  <FlagImg {name} {className} />
</button>
