import { geocode, isochrone } from './src/ors.js';
import { ringsFromGeoJSON, sectorEnvelope, ringAreaM2 } from './src/envelope.js';
import { buildSearchUrl } from './src/idealista.js';

const SECTORS = 64; // → at most 128 vertices in the idealista shape
const $ = (id) => document.getElementById(id);
const store = chrome.storage.local;

const saved = await store.get(['orsKey', 'point', 'minutes']);
let point = saved.point || { lat: 41.1579, lng: -8.6291 }; // Porto
if (saved.minutes) $('minutes').value = saved.minutes;

const map = L.map('map').setView([point.lat, point.lng], 10);
// tile.openstreetmap.org blocks requests whose Referer is chrome-extension:// ("Access
// blocked") and CARTO wants a key, so use Esri's street map and send no Referer.
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
  maxZoom: 19, referrerPolicy: 'no-referrer', attribution: 'Tiles © Esri',
}).addTo(map);
L.Icon.Default.imagePath = 'vendor/leaflet/images/';
const marker = L.marker([point.lat, point.lng], { draggable: true }).addTo(map);
let layers = [];
let url = null;

function status(msg, isError = false) {
  $('status').textContent = msg;
  $('status').className = isError ? 'error' : '';
}

function needKey() {
  $('status').className = 'error';
  $('status').innerHTML = 'Falta a chave da OpenRouteService. <a href="#" id="opt">Abrir opções</a>';
  $('opt').onclick = (e) => { e.preventDefault(); chrome.runtime.openOptionsPage(); };
}

function setPoint(p, pan = false) {
  point = { lat: p.lat, lng: p.lng };
  marker.setLatLng(point);
  if (pan) map.setView(point, 11);
  store.set({ point });
  clearArea();
}

function clearArea() {
  layers.forEach((l) => l.remove());
  layers = [];
  url = null;
  $('open').disabled = true;
}

map.on('click', (e) => setPoint(e.latlng));
marker.on('dragend', () => setPoint(marker.getLatLng()));

$('search').onsubmit = async (e) => {
  e.preventDefault();
  const key = (await store.get('orsKey')).orsKey;
  if (!key) return needKey();
  const q = $('q').value.trim();
  if (!q) return;
  status('A procurar…');
  try {
    const found = await geocode(key, q);
    const ul = $('results');
    ul.replaceChildren(...found.map((r) => {
      const li = document.createElement('li');
      li.textContent = r.label;
      li.onclick = () => { setPoint(r, true); ul.hidden = true; status(''); };
      return li;
    }));
    ul.hidden = !found.length;
    status(found.length ? '' : 'Nenhum resultado.', !found.length);
  } catch (err) { status(err.message, true); }
};

$('calc').onclick = async () => {
  const key = (await store.get('orsKey')).orsKey;
  if (!key) return needKey();
  const minutes = Math.min(60, Math.max(5, Math.round(+$('minutes').value || 45)));
  $('minutes').value = minutes;
  store.set({ minutes });
  clearArea();
  status('A calcular a área…');
  $('calc').disabled = true;
  try {
    const fc = await isochrone(key, point, minutes);
    const rings = ringsFromGeoJSON(fc);
    const env = sectorEnvelope(point, rings, SECTORS);
    url = buildSearchUrl(env);

    const real = L.geoJSON(fc, { style: { color: '#1565c0', weight: 1, fillOpacity: 0.25 } }).addTo(map);
    const sent = L.polygon(env, { color: '#e65100', weight: 2, dashArray: '5 4', fill: false }).addTo(map);
    layers = [real, sent];
    map.fitBounds(sent.getBounds(), { padding: [10, 10] });

    const realArea = rings.reduce((s, r) => s + ringAreaM2(r), 0);
    const sentArea = ringAreaM2(env.map(([la, ln]) => [ln, la]));
    const extra = Math.round((sentArea / realArea - 1) * 100);
    const pieces = rings.length > 1 ? ` · ${rings.length} pedaços juntos num contorno` : '';
    status(`Azul: até ${minutes} min de carro. Laranja: área enviada ao idealista (+${extra}% de área)${pieces}.`);
    $('open').disabled = false;
  } catch (err) {
    status(err.message, true);
  } finally {
    $('calc').disabled = false;
  }
};

$('open').onclick = () => { if (url) chrome.tabs.create({ url }); };

if (!saved.orsKey) needKey();
