import mapboxgl from 'mapbox-gl';
import { get } from 'svelte/store';
import {
  MAPBOX_STYLE_GLOBE,
  MAPBOX_STYLE_3D,
  HOST_REGION_BOUNDS,
  HOST_OVERVIEW,
  STADIUM_VIEW,
  STADIUM_ORBIT,
  STADIUM_FLY_MS,
  STADIUM_LOADING_MAX_MS,
  getMapboxToken,
} from '../constants.js';
import { venues } from '../data/venues.js';
import { flagImgHtml } from '../flags.js';
import { activeVenueId, stadiumBackVisible, squadModalTeam, globalMapLoading } from '../stores/ui.js';

const MAP_LOADING_TIMEOUT_MS = 12000;

/**
 * @param {HTMLElement} container
 * @param {{ onMobileHideVenuePanel?: () => void }} options
 */
export function createMapController(container, options = {}) {
  const token = getMapboxToken();
  if (!token) {
    alert('请先复制 config.example.js 为 config.js 并填入 Mapbox Access Token');
  }
  mapboxgl.accessToken = token;

  const map = new mapboxgl.Map({
    container,
    style: MAPBOX_STYLE_GLOBE,
    projection: 'globe',
    center: HOST_OVERVIEW.center,
    zoom: HOST_OVERVIEW.zoom,
    bearing: HOST_OVERVIEW.bearing,
    pitch: HOST_OVERVIEW.pitch,
    minZoom: 0,
    maxZoom: 22,
    maxBounds: HOST_REGION_BOUNDS,
    maxPitch: 85,
    attributionControl: true,
  });

  let venuesLayerReady = false;
  let mapStyleMode = 'globe';
  let styleSwitching = false;
  let styleSwitchGen = 0;
  let mapLoadingSeq = 0;
  /** @type {mapboxgl.Popup|null} */
  let activePopup = null;
  /** @type {mapboxgl.Marker[]} */
  let stadiumTeamMarkers = [];
  /** @type {number|null} */
  let stadiumOrbitRaf = null;
  let stadiumOrbitBearing = 0;
  let stadiumOrbitLastTs = 0;
  let stadium3dWarmed = false;

  function setStadiumBackBtn(show) {
    stadiumBackVisible.set(show);
  }

  function setActiveVenue(id) {
    activeVenueId.set(id || null);
  }

  function clearStadiumTeamMarkers() {
    stadiumTeamMarkers.forEach((m) => m.remove());
    stadiumTeamMarkers = [];
  }

  function stadiumTeamsPopupHTML(v) {
    return `
    <div class="popup-title">${v.name}</div>
    <div class="popup-city">${v.country} · ${v.city}</div>
    <div class="popup-label">参赛球队 · 点击国旗查看阵容</div>
    <div class="stadium-teams-popup-grid">
      ${v.teams
        .map(
          (t) => `
        <button type="button" class="stadium-teams-popup-item team-flag-btn" data-team="${t.name}">
          <div class="team-flag-wrap">${flagImgHtml(t.name)}</div>
          <span class="team-name">${t.name}</span>
        </button>
      `,
        )
        .join('')}
    </div>
  `;
  }

  function openStadiumTeamsPopup(v) {
    if (activePopup) activePopup.remove();
    activePopup = new mapboxgl.Popup({
      offset: 14,
      closeButton: true,
      closeOnClick: true,
      maxWidth: '320px',
    })
      .setLngLat([v.lng, v.lat])
      .setHTML(stadiumTeamsPopupHTML(v))
      .addTo(map);
    activePopup.on('close', () => {
      activePopup = null;
    });
  }

  function stopStadiumOrbit() {
    if (stadiumOrbitRaf != null) cancelAnimationFrame(stadiumOrbitRaf);
    stadiumOrbitRaf = null;
    stadiumOrbitLastTs = 0;
  }

  /** 用 setBearing + rAF 环绕，避免连续 easeTo 造成卡顿 */
  function startStadiumOrbit() {
    stopStadiumOrbit();
    if (mapStyleMode !== 'stadium3d') return;

    map.stop();
    stadiumOrbitBearing = map.getBearing();

    const tick = (ts) => {
      if (mapStyleMode !== 'stadium3d') {
        stopStadiumOrbit();
        return;
      }
      if (!stadiumOrbitLastTs) stadiumOrbitLastTs = ts;
      const dt = Math.min(ts - stadiumOrbitLastTs, 48);
      stadiumOrbitLastTs = ts;
      stadiumOrbitBearing += STADIUM_ORBIT.degPerSec * (dt / 1000);
      map.setBearing(stadiumOrbitBearing);
      stadiumOrbitRaf = requestAnimationFrame(tick);
    };

    stadiumOrbitRaf = requestAnimationFrame(tick);
  }

  function showStadiumTeamDot(venue) {
    clearStadiumTeamMarkers();
    if (!venue || mapStyleMode !== 'stadium3d') return;

    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'stadium-teams-dot';
    el.style.background = venue.color;
    el.style.position = 'relative';
    el.style.zIndex = '30';
    el.title = '点击查看参赛球队';
    el.setAttribute('aria-label', `${venue.name} 参赛球队`);
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      openStadiumTeamsPopup(venue);
    });

    const marker = new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
      offset: [0, -12],
      pitchAlignment: 'viewport',
      rotationAlignment: 'viewport',
    })
      .setLngLat([venue.lng, venue.lat])
      .addTo(map);
    stadiumTeamMarkers = [marker];
  }

  const USER_INTERACTIONS = [
    'scrollZoom',
    'boxZoom',
    'doubleClickZoom',
    'touchZoomRotate',
    'touchPitch',
    'dragPan',
    'dragRotate',
    'keyboard',
  ];

  function setUserInteractionsEnabled(enabled) {
    USER_INTERACTIONS.forEach((key) => {
      if (enabled) map[key].enable();
      else map[key].disable();
    });
  }

  /** 进入 3D 前必须先放开缩放上限，否则 flyTo 会被锁在全球 zoom */
  function unlockZoomForTransition() {
    map.setMaxBounds(null);
    map.setMinZoom(0);
    map.setMaxZoom(22);
  }

  function beginStadiumLoading() {
    mapLoadingSeq += 1;
    const seq = mapLoadingSeq;
    globalMapLoading.set(true);
    const timer = setTimeout(() => endStadiumLoading(seq), MAP_LOADING_TIMEOUT_MS);
    return { seq, timer };
  }

  function endStadiumLoading(seq, timer) {
    if (seq !== mapLoadingSeq) return;
    if (timer) clearTimeout(timer);
    globalMapLoading.set(false);
  }

  /** 飞入结束后尽快关 loading；地形在空闲时再挂上以降低峰值压力 */
  function finishStadiumLoading(seq, timer, venue) {
    let settled = false;
    const done = () => {
      if (settled || seq !== mapLoadingSeq) return;
      settled = true;
      showStadiumTeamDot(venue);
      endStadiumLoading(seq, timer);
      startStadiumOrbit();
      const addTerrain = () => {
        if (seq !== mapLoadingSeq || mapStyleMode !== 'stadium3d') return;
        setupStadium3DTerrain();
      };
      if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(addTerrain, { timeout: 800 });
      } else {
        setTimeout(addTerrain, 120);
      }
    };
    map.once('idle', done);
    setTimeout(done, STADIUM_LOADING_MAX_MS);
  }

  function setMapInteractionForMode(mode) {
    if (mode === 'globe') {
      const z = HOST_OVERVIEW.zoom;
      map.setMinZoom(z);
      map.setMaxZoom(z);
      map.setMaxBounds(HOST_REGION_BOUNDS);
      setUserInteractionsEnabled(false);
      map.jumpTo({ ...HOST_OVERVIEW });
      return;
    }

    if (mode === 'stadium3d') {
      map.setMaxBounds(null);
      map.setMinZoom(STADIUM_VIEW.minZoom);
      map.setMaxZoom(STADIUM_VIEW.maxZoom);
      setUserInteractionsEnabled(false);
    }
  }

  function removeVenueLayers() {
    ['venues-point', 'venues-glow'].forEach((id) => {
      if (map.getLayer(id)) map.removeLayer(id);
    });
    if (map.getSource('venues')) map.removeSource('venues');
    venuesLayerReady = false;
  }

  function buildVenueGeoJSON() {
    return {
      type: 'FeatureCollection',
      features: venues.map((v) => ({
        type: 'Feature',
        id: v.id,
        properties: {
          id: v.id,
          name: v.name,
          city: v.city,
          color: v.color,
          matchCount: v.matchCount,
        },
        geometry: { type: 'Point', coordinates: [v.lng, v.lat] },
      })),
    };
  }

  function onVenueClick(e) {
    flyToVenue(e.features[0].properties.id);
  }

  function attachGlobeVenueLayers() {
    if (mapStyleMode !== 'globe' || !map.isStyleLoaded()) return false;

    try {
      removeVenueLayers();
      map.addSource('venues', { type: 'geojson', data: buildVenueGeoJSON() });

      map.addLayer({
        id: 'venues-glow',
        type: 'circle',
        source: 'venues',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 14, 6, 22, 14, 30],
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.45,
          'circle-blur': 0.5,
          'circle-pitch-alignment': 'map',
        },
      });

      map.addLayer({
        id: 'venues-point',
        type: 'circle',
        source: 'venues',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 6, 12, 14, 16, 18],
          'circle-color': ['get', 'color'],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 1,
          'circle-pitch-alignment': 'map',
        },
      });

      map.off('click', 'venues-point', onVenueClick);
      map.on('click', 'venues-point', onVenueClick);
      map.off('mouseenter', 'venues-point');
      map.off('mouseleave', 'venues-point');
      map.on('mouseenter', 'venues-point', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'venues-point', () => {
        map.getCanvas().style.cursor = '';
      });
      venuesLayerReady = true;
      return true;
    } catch (err) {
      console.warn('场馆图层加载失败', err);
      venuesLayerReady = false;
      return false;
    }
  }

  function scheduleGlobeVenueLayers() {
    const tryAttach = () => {
      if (mapStyleMode !== 'globe') return;
      attachGlobeVenueLayers();
    };
    tryAttach();
    map.once('idle', tryAttach);
    [150, 400, 900].forEach((ms) => setTimeout(tryAttach, ms));
  }

  function setupStadium3DLight() {
    try {
      if (typeof map.setConfigProperty === 'function') {
        map.setConfigProperty('basemap', 'lightPreset', 'dusk');
        map.setConfigProperty('basemap', 'theme', 'faded');
      }
    } catch (_) {}
    map.setFog({
      color: 'rgb(32, 42, 62)',
      'high-color': 'rgb(58, 72, 98)',
      'horizon-blend': 0.22,
      'space-color': 'rgb(22, 28, 42)',
      'star-intensity': 0.2,
    });
  }

  function setupStadium3DTerrain() {
    if (mapStyleMode !== 'stadium3d') return;
    try {
      if (!map.getSource('mapbox-dem')) {
        map.addSource('mapbox-dem', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
          tileSize: 512,
          maxzoom: 12,
        });
      }
      map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.12 });
    } catch (_) {}
  }

  function warmupStadium3DStyle() {
    if (stadium3dWarmed || !token) return;
    stadium3dWarmed = true;
    fetch(
      `https://api.mapbox.com/styles/v1/mapbox/standard?sdk=js-3.9.4&access_token=${encodeURIComponent(token)}`,
      { mode: 'cors' },
    ).catch(() => {});
  }

  function applyGlobeStyle(done) {
    const finish = () => {
      mapStyleMode = 'globe';
      stopStadiumOrbit();
      clearStadiumTeamMarkers();
      setStadiumBackBtn(false);
      setActiveVenue(null);
      try {
        map.setTerrain(null);
        map.setFog({
          color: 'rgb(6, 11, 24)',
          'high-color': 'rgb(15, 25, 50)',
          'horizon-blend': 0.3,
          'space-color': 'rgb(4, 8, 18)',
          'star-intensity': 0.8,
        });
      } catch (_) {}
      try {
        map.setProjection('globe');
      } catch (_) {}
      setMapInteractionForMode('globe');
      styleSwitching = false;
      scheduleGlobeVenueLayers();
      done?.();
    };

    if (mapStyleMode === 'globe' && map.isStyleLoaded() && !styleSwitching) {
      finish();
      return;
    }
    if (styleSwitching) return;

    styleSwitching = true;
    venuesLayerReady = false;

    if (MAPBOX_STYLE_GLOBE === MAPBOX_STYLE_3D) {
      finish();
      return;
    }

    const gen = ++styleSwitchGen;
    map.setStyle(MAPBOX_STYLE_GLOBE);
    map.once('style.load', () => {
      if (gen !== styleSwitchGen) return;
      finish();
    });
  }

  function apply3DStyle(done) {
    const finish = () => {
      mapStyleMode = 'stadium3d';
      setStadiumBackBtn(true);
      setMapInteractionForMode('stadium3d');
      try {
        map.setProjection('mercator');
      } catch (_) {}
      setupStadium3DLight();
      styleSwitching = false;
      done?.();
    };

    if (mapStyleMode === 'stadium3d' && map.isStyleLoaded() && !styleSwitching) {
      finish();
      return;
    }
    if (styleSwitching) return;

    styleSwitching = true;
    venuesLayerReady = false;
    const gen = ++styleSwitchGen;
    map.setStyle(MAPBOX_STYLE_3D);
    map.once('style.load', () => {
      if (gen !== styleSwitchGen) return;
      finish();
    });
  }

  function flyToVenue(id) {
    const v = venues.find((x) => x.id === id);
    if (!v) return;
    if (styleSwitching) {
      if (!get(globalMapLoading)) beginStadiumLoading();
      map.once('idle', () => flyToVenue(id));
      return;
    }

    setActiveVenue(id);
    if (activePopup) activePopup.remove();

    const { seq, timer } = beginStadiumLoading();
    unlockZoomForTransition();

    const fly3D = () => {
      if (seq !== mapLoadingSeq) return;
      unlockZoomForTransition();
      setMapInteractionForMode('stadium3d');
      map.stop();

      const camera = {
        center: [v.lng, v.lat],
        zoom: STADIUM_VIEW.zoom,
        pitch: STADIUM_VIEW.pitch,
        bearing: STADIUM_VIEW.bearing,
      };

      map.easeTo({
        ...camera,
        duration: STADIUM_FLY_MS,
        essential: true,
        easing: (t) => t * (2 - t),
      });

      const afterFlyIn = () => {
        if (seq !== mapLoadingSeq) return;
        finishStadiumLoading(seq, timer, v);
      };

      map.once('moveend', () => {
        if (seq !== mapLoadingSeq) return;
        if (map.getZoom() < STADIUM_VIEW.minZoom - 0.5) {
          map.once('moveend', afterFlyIn);
          map.jumpTo(camera);
        } else {
          afterFlyIn();
        }
      });
    };

    try {
      apply3DStyle(fly3D);
    } catch (err) {
      console.warn('进入 3D 失败', err);
      endStadiumLoading(seq, timer);
    }

    if (window.innerWidth <= 768) options.onMobileHideVenuePanel?.();
  }

  function exitStadiumView() {
    if (mapStyleMode !== 'stadium3d' || styleSwitching) return;
    stopStadiumOrbit();
    map.stop();
    clearStadiumTeamMarkers();
    if (activePopup) activePopup.remove();
    setActiveVenue(null);
    unlockZoomForTransition();
    applyGlobeStyle();
  }

  function initGlobeFeatures() {
    try {
      map.setTerrain(null);
      map.setFog({
        color: 'rgb(6, 11, 24)',
        'high-color': 'rgb(15, 25, 50)',
        'horizon-blend': 0.3,
        'space-color': 'rgb(4, 8, 18)',
        'star-intensity': 0.8,
      });
    } catch (_) {}
    scheduleGlobeVenueLayers();
  }

  function handlePopupFlagClick(e) {
    const btn = e.target.closest('.team-flag-btn');
    if (!btn?.dataset.team) return;
    e.stopPropagation();
    e.preventDefault();
    squadModalTeam.set(btn.dataset.team);
  }

  map.on('load', () => {
    initGlobeFeatures();
    setMapInteractionForMode('globe');
    warmupStadium3DStyle();
  });

  map.on('style.load', () => {
    if (mapStyleMode === 'globe' && !styleSwitching) scheduleGlobeVenueLayers();
  });

  container.addEventListener('click', handlePopupFlagClick);

  return {
    map,
    flyToVenue,
    exitStadiumView,
    destroy() {
      stopStadiumOrbit();
      map.stop();
      container.removeEventListener('click', handlePopupFlagClick);
      clearStadiumTeamMarkers();
      map.remove();
    },
  };
}
