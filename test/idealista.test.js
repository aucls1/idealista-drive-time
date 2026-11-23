import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSearchUrl, parseShapeFromUrl } from '../src/idealista.js';

const ring = [[41.1, -8.6], [41.2, -8.6], [41.2, -8.5], [41.1, -8.6]];

test('builds an idealista.pt drawn-area URL that round-trips', () => {
  const url = buildSearchUrl(ring);
  assert.match(url, /^https:\/\/www\.idealista\.pt\/areas\/comprar-casas\/\?shape=/);
  assert.deepEqual(parseShapeFromUrl(url), ring);
});

test('closes an open ring', () => {
  const open = ring.slice(0, 3);
  assert.deepEqual(parseShapeFromUrl(buildSearchUrl(open)), ring);
});
