import { encodePolyline, decodePolyline } from './polyline.js';

// MVP: Portugal, buy homes. Path to be confirmed against a real idealista.pt drawn area.
export const IDEALISTA_BASE = 'https://www.idealista.pt/areas/comprar-casas/';

// ring: [[lat, lng], ...]
export function buildSearchUrl(ring) {
  const pts = ring.slice();
  const [a, b] = [pts[0], pts[pts.length - 1]];
  if (a[0] !== b[0] || a[1] !== b[1]) pts.push(a);
  return `${IDEALISTA_BASE}?shape=${encodeURIComponent(`((${encodePolyline(pts)}))`)}`;
}

export function parseShapeFromUrl(url) {
  const shape = new URL(url).searchParams.get('shape');
  return decodePolyline(shape.replace(/^\(\(/, '').replace(/\)\)$/, ''));
}
