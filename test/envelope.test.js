import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sectorEnvelope, ringsFromGeoJSON, pointInRing, ringAreaM2 } from '../src/envelope.js';

const origin = { lat: 41.15, lng: -8.61 };

// GeoJSON ring ([lng,lat]) of a spiky star: long thin "motorway" spikes
function spikyRing(cx, cy, spikes = 7, rIn = 0.02, rOut = 0.4, steps = 400) {
  const ring = [];
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * 2 * Math.PI;
    const phase = (a * spikes / (2 * Math.PI)) % 1;
    const r = phase < 0.03 ? rOut : rIn + 0.01 * Math.sin(a * 37);
    ring.push([cx + r * Math.cos(a), cy + r * Math.sin(a) * 0.75]);
  }
  ring.push(ring[0]);
  return ring;
}

// envelope is [[lat,lng],...]; convert to [lng,lat] ring for pointInRing
const toLngLat = (env) => env.map(([la, ln]) => [ln, la]);

function samplesOf(rings) {
  const out = [];
  for (const ring of rings) {
    for (let i = 0; i < ring.length - 1; i++) {
      const [x1, y1] = ring[i], [x2, y2] = ring[i + 1];
      for (const t of [0, 0.25, 0.5, 0.75]) out.push([x1 + t * (x2 - x1), y1 + t * (y2 - y1)]);
    }
  }
  return out;
}

test('covers every boundary point of a spiky isochrone (grow only)', () => {
  const rings = [spikyRing(origin.lng, origin.lat)];
  const env = toLngLat(sectorEnvelope(origin, rings, 64));
  const missed = samplesOf(rings).filter((p) => !pointInRing(p, env));
  assert.equal(missed.length, 0, `missed ${missed.length} points`);
});

test('covers separate pieces with one closed ring', () => {
  const main = spikyRing(origin.lng, origin.lat, 5, 0.05, 0.2);
  const island = [[-8.2, 41.3], [-8.15, 41.3], [-8.15, 41.34], [-8.2, 41.34], [-8.2, 41.3]];
  const rings = [main, island];
  const env = sectorEnvelope(origin, rings, 64);
  assert.deepEqual(env[0], env[env.length - 1], 'ring is closed');
  const ll = toLngLat(env);
  assert.equal(samplesOf(rings).filter((p) => !pointInRing(p, ll)).length, 0);
});

test('vertex count bounded by 2N+1', () => {
  const env = sectorEnvelope(origin, [spikyRing(origin.lng, origin.lat)], 48);
  assert.ok(env.length <= 2 * 48 + 1, `got ${env.length}`);
});

test('overshoot on a near-circle is small', () => {
  const circle = [];
  for (let i = 0; i <= 360; i++) {
    const a = (i / 360) * 2 * Math.PI;
    circle.push([origin.lng + 0.1 * Math.cos(a) / Math.cos(origin.lat * Math.PI / 180), origin.lat + 0.1 * Math.sin(a)]);
  }
  const env = toLngLat(sectorEnvelope(origin, [circle], 64));
  const ratio = ringAreaM2(env) / ringAreaM2(circle);
  assert.ok(ratio > 1 && ratio < 1.03, `ratio ${ratio}`);
});

test('ringsFromGeoJSON takes outer rings of Polygon and MultiPolygon', () => {
  const fc = {
    type: 'FeatureCollection',
    features: [
      { geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]], [[0.1, 0.1], [0.2, 0.1], [0.2, 0.2], [0.1, 0.1]]] } },
      { geometry: { type: 'MultiPolygon', coordinates: [[[[5, 5], [6, 5], [6, 6], [5, 5]]], [[[7, 7], [8, 7], [8, 8], [7, 7]]]] } },
    ],
  };
  const rings = ringsFromGeoJSON(fc);
  assert.equal(rings.length, 3);
  assert.deepEqual(rings[0][0], [0, 0]);
});
