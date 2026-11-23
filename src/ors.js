// OpenRouteService client. Key is the user's own, from chrome.storage.local.
const ORS = 'https://api.openrouteservice.org';

async function check(res) {
  if (res.ok) return res.json();
  let msg = `${res.status}`;
  try { const j = await res.json(); msg = j.error?.message || j.error || j.message || msg; } catch {}
  if (res.status === 401 || res.status === 403) throw new Error('Chave ORS inválida (verifique nas opções).');
  if (res.status === 429) throw new Error('Limite da ORS atingido (20/min, 500/dia). Tente mais tarde.');
  throw new Error(`Erro ORS: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
}

export async function geocode(key, text) {
  const u = new URL(`${ORS}/geocode/search`);
  u.search = new URLSearchParams({ api_key: key, text, 'boundary.country': 'PT', size: '5' });
  const j = await check(await fetch(u));
  return j.features.map((f) => ({ label: f.properties.label, lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0] }));
}

export async function isochrone(key, { lat, lng }, minutes) {
  const res = await fetch(`${ORS}/v2/isochrones/driving-car`, {
    method: 'POST',
    headers: { Authorization: key, 'Content-Type': 'application/json', Accept: 'application/geo+json' },
    body: JSON.stringify({ locations: [[lng, lat]], range: [minutes * 60], range_type: 'time' }),
  });
  const fc = await check(res);
  if (!fc.features?.length) throw new Error('A ORS não devolveu nenhuma área para este ponto.');
  return fc;
}
