<script>
  import { onMount, onDestroy } from 'svelte';
  import { createMapController } from '../map/mapController.js';
  import { mapControllerApi } from '../stores/map.js';
  import { panelRightHidden } from '../stores/ui.js';

  let mapEl;
  /** @type {ReturnType<createMapController>|null} */
  let controller = null;

  onMount(() => {
    controller = createMapController(mapEl, {
      onMobileHideVenuePanel: () => {
        panelRightHidden.set(true);
      },
    });
    mapControllerApi.set({
      flyToVenue: (id) => controller?.flyToVenue(id),
      exitStadiumView: () => controller?.exitStadiumView(),
    });
  });

  onDestroy(() => {
    mapControllerApi.set(null);
    controller?.destroy();
  });
</script>

<div id="map" bind:this={mapEl}></div>
