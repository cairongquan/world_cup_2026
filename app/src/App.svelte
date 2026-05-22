<script>
  import { onMount, onDestroy } from "svelte";
  import { get } from "svelte/store";
  import Header from "./lib/components/Header.svelte";
  import MapContainer from "./lib/components/MapContainer.svelte";
  import LeftPanel from "./lib/components/LeftPanel.svelte";
  import VenuePanel from "./lib/components/VenuePanel.svelte";
  import StadiumBackButton from "./lib/components/StadiumBackButton.svelte";
  import StadiumInfoCard from "./lib/components/StadiumInfoCard.svelte";
  import SquadModal from "./lib/components/SquadModal.svelte";
  import BracketModal from "./lib/components/BracketModal.svelte";
  import GlobalLoading from "./lib/components/GlobalLoading.svelte";
  import { mapControllerApi } from "./lib/stores/map.js";
  import { loadSquads } from "./lib/services/squads.js";
  import {
    initTournamentBootstrap,
    refreshTournamentData,
  } from "./lib/services/tournament.js";

  let refreshTimer;

  function onSelectVenue(id) {
    get(mapControllerApi)?.flyToVenue(id);
  }

  function onStadiumBack() {
    get(mapControllerApi)?.exitStadiumView();
  }

  onMount(() => {
    loadSquads();
    initTournamentBootstrap();
    refreshTimer = setInterval(refreshTournamentData, 60_000);
  });

  onDestroy(() => {
    if (refreshTimer) clearInterval(refreshTimer);
  });
</script>

<Header />
<MapContainer />
<LeftPanel />
<VenuePanel {onSelectVenue} />
<StadiumInfoCard />
<StadiumBackButton onBack={onStadiumBack} />
<SquadModal />
<BracketModal />
<GlobalLoading />
