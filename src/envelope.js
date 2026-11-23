// "Grow only" outline of an isochrone, as one ring with a bounded number of vertices.
//
// Split 360° around the start point into N equal sectors. In each sector take the
// farthest reachable distance (from any vertex, or any edge crossing the sector's
// boundary rays — the farthest point of a polygon inside a wedge is always one of
// those). The region inside a wedge is then within that distance, so a stepped
// star made of one arc-like segment per sector covers everything. The chord of each
// segment is pushed out by 1/cos(Δ/2) so the arc itself is covered too.
//
// Input rings are GeoJSON order [lng, lat]. Output ring is [lat, lng], closed.

const M_PER_DEG_LAT = 110574;

function projector(origin) {
  const kx = 111320 * Math.cos((origin.lat * Math.PI) / 180);
  return {
    fwd: ([lng, lat]) => [(lng - origin.lng) * kx, (lat - origin.lat) * M_PER_DEG_LAT],
    inv: ([x, y]) => [origin.lat + y / M_PER_DEG_LAT, origin.lng + x / kx],
  };
}

export function ringsFromGeoJSON(fc) {
  const rings = [];
  const feats = fc.type === 'FeatureCollection' ? fc.features : [fc];
  for (const f of feats) {
    const g = f.geometry || f;
    if (g.type === 'Polygon') rings.push(g.coordinates[0]);
    else if (g.type === 'MultiPolygon') for (const poly of g.coordinates) rings.push(poly[0]);
  }
  return rings;
}

export function sectorEnvelope(origin, rings, n = 64, { marginM = 25 } = {}) {
  const { fwd, inv } = projector(origin);
  const step = (2 * Math.PI) / n;
  const maxR = new Array(n).fill(0);
  const sectorOf = (x, y) => {
    let a = Math.atan2(y, x);
    if (a < 0) a += 2 * Math.PI;
    return Math.min(n - 1, Math.floor(a / step));
  };
  const rays = Array.from({ length: n }, (_, k) => [Math.cos(k * step), Math.sin(k * step)]);

  for (const ring of rings) {
    const pts = ring.map(fwd);
    for (let i = 0; i < pts.length; i++) {
      const [x, y] = pts[i];
      const r = Math.hypot(x, y);
      const s = sectorOf(x, y);
      if (r > maxR[s]) maxR[s] = r;
      if (i === pts.length - 1) continue;
      // crossings of edge (p→q) with each sector boundary ray
      const [qx, qy] = pts[i + 1];
      const dx = qx - x, dy = qy - y;
      for (let k = 0; k < n; k++) {
        const [cx, cy] = rays[k];
        const den = dx * cy - dy * cx;
        if (Math.abs(den) < 1e-12) continue;
        const t = (y * cx - x * cy) / den; // p + t·d lies on the ray's line
        if (t < 0 || t > 1) continue;
        const ix = x + t * dx, iy = y + t * dy;
        const along = ix * cx + iy * cy;
        if (along < 0) continue;
        const prev = (k - 1 + n) % n;
        if (along > maxR[k]) maxR[k] = along;
        if (along > maxR[prev]) maxR[prev] = along;
      }
    }
  }

  const inflate = 1 / Math.cos(step / 2);
  const out = [];
  const push = (p) => {
    const last = out[out.length - 1];
    if (!last || last[0] !== p[0] || last[1] !== p[1]) out.push(p);
  };
  for (let s = 0; s < n; s++) {
    const r = Math.max(maxR[s], marginM) * inflate + marginM;
    for (const a of [s * step, (s + 1) * step]) {
      const ll = inv([r * Math.cos(a), r * Math.sin(a)]);
      // round to the polyline grid (1e-5°), always away from the origin
      push([roundAway(ll[0], origin.lat), roundAway(ll[1], origin.lng)]);
    }
  }
  if (out.length && (out[0][0] !== out[out.length - 1][0] || out[0][1] !== out[out.length - 1][1])) out.push(out[0]);
  return out;
}

function roundAway(v, center) {
  const f = 1e5;
  return v >= center ? Math.ceil(v * f) / f : Math.floor(v * f) / f;
}

// Ray-casting point-in-polygon. p and ring in [lng, lat] (or any consistent x,y).
export function pointInRing([px, py], ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

// Approximate area in m² of a [lng, lat] ring (local equirectangular projection).
export function ringAreaM2(ring) {
  const lat0 = ring.reduce((s, p) => s + p[1], 0) / ring.length;
  const { fwd } = projector({ lat: lat0, lng: ring[0][0] });
  const p = ring.map(fwd);
  let a = 0;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) a += (p[j][0] + p[i][0]) * (p[j][1] - p[i][1]);
  return Math.abs(a / 2);
}
