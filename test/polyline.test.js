import { test } from 'node:test';
import assert from 'node:assert/strict';
import { encodePolyline, decodePolyline } from '../src/polyline.js';

const pts = [[38.5, -120.2], [40.7, -120.95], [43.252, -126.453]];

test('encodes Google reference example', () => {
  assert.equal(encodePolyline(pts), '_p~iF~ps|U_ulLnnqC_mqNvxq`@');
});

test('decode inverts encode', () => {
  assert.deepEqual(decodePolyline('_p~iF~ps|U_ulLnnqC_mqNvxq`@'), pts);
});

test('handles negative/rounding values', () => {
  const p = [[41.14961, -8.61099], [38.72225, -9.13933], [0, 0], [-0.00001, 0.00001]];
  assert.deepEqual(decodePolyline(encodePolyline(p)), p);
});
