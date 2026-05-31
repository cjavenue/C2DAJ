/* ============================================================================
 * Nearby — live map + location gate (steps 1 & 2)
 *
 * Stack: MapLibre GL JS + CARTO free dark-matter vector style (no API key).
 *
 * Data-security notes (kept from day one):
 *  - Location is opt-in only (the gate). We never request it automatically.
 *  - Coordinates live in memory only (`state.userLngLat`); nothing is persisted
 *    or sent to any server. The only network calls are map-tile fetches, which
 *    are inherent to rendering a map and carry no user identity.
 *  - "Online" peers are MOCKED locally for now. When a realtime backend is added
 *    (recommended: Supabase Postgres + PostGIS + Realtime), swap `mockPeers()`
 *    for a live presence/geo-query feed and gate it behind consent.
 * ========================================================================== */

// Default view before the user shares location: Nawala, Colombo (matches the
// reference design) — used only as a blurred backdrop behind the gate.
const DEFAULT_CENTER = [79.8895, 6.8780];
const RADIUS_KM = 5;
const MOCK_PEER_COUNT = 19;

const state = {
  userLngLat: null,     // [lng, lat] — in-memory only
  peerMarkers: [],
  userMarker: null,
  manualMode: false,
};

// ---- map -------------------------------------------------------------------
const map = new maplibregl.Map({
  container: 'map',
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  center: DEFAULT_CENTER,
  zoom: 12,
  attributionControl: false,
});
map.addControl(new maplibregl.AttributionControl({ compact: true }));

// ---- element refs ----------------------------------------------------------
const els = {
  mapEl:       document.getElementById('map'),
  hud:         document.getElementById('hud'),
  gate:        document.getElementById('gate'),
  enableBtn:   document.getElementById('enableBtn'),
  manualBtn:   document.getElementById('manualBtn'),
  manualHint:  document.getElementById('manualHint'),
  onlineCount: document.getElementById('onlineCount'),
  locateBtn:   document.getElementById('locateBtn'),
  layersBtn:   document.getElementById('layersBtn'),
  editBtn:     document.getElementById('editBtn'),
  postBtn:     document.getElementById('postBtn'),
  toast:       document.getElementById('toast'),
};

// ---- toast -----------------------------------------------------------------
let toastTimer;
function toast(msg) {
  els.toast.textContent = msg;
  els.toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => els.toast.classList.remove('show'), 2200);
}

// ---- geometry helpers ------------------------------------------------------
// Approx conversions good enough for a 5 km city-scale circle.
function kmToDeg(center, km) {
  return {
    dLng: km / (111.320 * Math.cos(center[1] * Math.PI / 180)),
    dLat: km / 110.574,
  };
}

function circlePolygon(center, radiusKm, points = 72) {
  const { dLng, dLat } = kmToDeg(center, radiusKm);
  const ring = [];
  for (let i = 0; i <= points; i++) {
    const t = (i / points) * 2 * Math.PI;
    ring.push([center[0] + dLng * Math.cos(t), center[1] + dLat * Math.sin(t)]);
  }
  return { type: 'Feature', geometry: { type: 'Polygon', coordinates: [ring] } };
}

// Uniformly random point within a radius (sqrt keeps it area-uniform).
function randomPointWithin(center, radiusKm) {
  const r = radiusKm * Math.sqrt(Math.random());
  const theta = Math.random() * 2 * Math.PI;
  const { dLng, dLat } = kmToDeg(center, r);
  return [center[0] + dLng * Math.cos(theta), center[1] + dLat * Math.sin(theta)];
}

// ---- 5 km radius layer -----------------------------------------------------
function drawRadius(center) {
  const data = circlePolygon(center, RADIUS_KM);
  if (map.getSource('radius')) {
    map.getSource('radius').setData(data);
    return;
  }
  map.addSource('radius', { type: 'geojson', data });
  map.addLayer({
    id: 'radius-fill', type: 'fill', source: 'radius',
    paint: { 'fill-color': '#2ee6c5', 'fill-opacity': 0.07 },
  });
  map.addLayer({
    id: 'radius-line', type: 'line', source: 'radius',
    paint: { 'line-color': '#2ee6c5', 'line-width': 1.5, 'line-opacity': 0.5 },
  });
}

function fitToRadius(center) {
  const { dLng, dLat } = kmToDeg(center, RADIUS_KM);
  map.fitBounds(
    [[center[0] - dLng, center[1] - dLat], [center[0] + dLng, center[1] + dLat]],
    { padding: 60, duration: 900 }
  );
}

// ---- markers ---------------------------------------------------------------
function setUserMarker(lngLat) {
  if (state.userMarker) state.userMarker.remove();
  const el = document.createElement('div');
  el.className = 'user-dot';
  state.userMarker = new maplibregl.Marker({ element: el }).setLngLat(lngLat).addTo(map);
}

// MOCK presence — replace with a realtime feed when a backend exists.
function mockPeers(center) {
  state.peerMarkers.forEach((m) => m.remove());
  state.peerMarkers = [];
  for (let i = 0; i < MOCK_PEER_COUNT; i++) {
    const el = document.createElement('div');
    el.className = 'peer-dot';
    const m = new maplibregl.Marker({ element: el })
      .setLngLat(randomPointWithin(center, RADIUS_KM * 0.95))
      .addTo(map);
    state.peerMarkers.push(m);
  }
  els.onlineCount.textContent = String(state.peerMarkers.length);
}

// ---- activate the map for a given location ---------------------------------
function activateAt(lngLat) {
  state.userLngLat = lngLat;
  setUserMarker(lngLat);
  drawRadius(lngLat);
  mockPeers(lngLat);
  fitToRadius(lngLat);

  // Reveal screen 1, hide the gate.
  els.mapEl.classList.remove('blurred');
  els.hud.classList.add('show');
  els.hud.setAttribute('aria-hidden', 'false');
  els.gate.classList.add('hidden');
  els.manualHint.classList.remove('show');
  state.manualMode = false;
}

// ---- gate actions ----------------------------------------------------------
function requestLocation() {
  if (!('geolocation' in navigator)) {
    toast('Geolocation not supported — set it manually.');
    enableManualMode();
    return;
  }
  els.enableBtn.disabled = true;
  els.enableBtn.textContent = 'Locating…';

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      activateAt([pos.coords.longitude, pos.coords.latitude]);
      els.enableBtn.disabled = false;
      els.enableBtn.textContent = 'Enable Location';
    },
    (err) => {
      els.enableBtn.disabled = false;
      els.enableBtn.textContent = 'Enable Location';
      const msg = err.code === err.PERMISSION_DENIED
        ? 'Permission denied — you can set your location manually.'
        : 'Couldn’t get your location — try manually.';
      toast(msg);
      enableManualMode();
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}

function enableManualMode() {
  state.manualMode = true;
  els.gate.classList.add('hidden');
  els.mapEl.classList.remove('blurred');
  els.manualHint.classList.add('show');
  map.once('click', (e) => {
    activateAt([e.lngLat.lng, e.lngLat.lat]);
    toast('Location set');
  });
}

// ---- wiring ----------------------------------------------------------------
els.enableBtn.addEventListener('click', requestLocation);
els.manualBtn.addEventListener('click', enableManualMode);

els.locateBtn.addEventListener('click', () => {
  if (state.userLngLat) fitToRadius(state.userLngLat);
  else requestLocation();
});

// Honest placeholders until those features are built.
els.layersBtn.addEventListener('click', () => toast('Layers — coming soon'));
els.editBtn.addEventListener('click', () => toast('Edit — coming soon'));
els.postBtn.addEventListener('click', () => toast('Post Status — coming soon'));
