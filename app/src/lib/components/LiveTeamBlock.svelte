<script>
  import FlagButton from './FlagButton.svelte';

  let { name } = $props();
</script>

<div class="team">
  <div class="team-flag-wrap">
    <FlagButton {name} />
  </div>
  <span class="team-name">{name}</span>
</div>
