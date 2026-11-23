# Design

## Problem

idealista lets you search by city, neighbourhood, a hand-drawn area or "nearby", but none
of those answer the real house-hunting question: *where can I live within X minutes' drive
of a place I care about (work, school, family)?* Places that are far in kilometres but quick
by motorway don't show up with normal filters.

## Approach

The extension builds a link; it never touches idealista's page or internal code.

1. The user picks one point and a time (5–60 min).
2. [OpenRouteService](https://openrouteservice.org/) returns the area reachable by car
   (`driving-car`, empty-road times, no traffic).
3. The area is turned into one simplified outline (see below).
4. The outline is encoded as a Google Encoded Polyline (precision 5, `lat,lng`, closed
   ring) and opened as `https://www.idealista.pt/areas/comprar-casas/?shape=((<polyline>))`.
   idealista then draws and filters it natively.

Alternatives rejected: injecting UI into idealista's map (depends on undocumented,
changing internals) and a standalone web page (awkward API-key handling).

## Outline: "grow only", one contour

Real isochrones have thousands of vertices, several separate pieces and long thin spikes
along motorways — and those spikes are exactly the places worth finding. Plain
Douglas–Peucker simplification cuts them off, so instead `src/envelope.js` builds a
**sector envelope**:

- Split 360° around the start point into N sectors (N = 64).
- In each sector take the farthest reachable distance, from any vertex or any edge crossing
  the sector's boundary rays (the farthest point of a polygon inside a wedge is always one
  of these).
- Emit one arc-like segment per sector at that distance, pushed out by `1/cos(Δ/2)` plus a
  small margin, and round coordinates away from the origin.

Result: a single star-shaped ring with at most 2N vertices that is **guaranteed to cover**
the whole reachable area, including separate pieces. It may include some extra area; the
popup draws both shapes and reports how much bigger the sent one is.

## Constraints

- OpenRouteService free tier: 500 isochrones/day, 20/min, driving range ≤ 1 h.
- Every user brings their own ORS key, stored in `chrome.storage.local`. No key ever ships
  in the code.
- Manifest V3 forbids remote code, so Leaflet is vendored. Map tiles come from Esri
  (tile.openstreetmap.org rejects `chrome-extension://` referers; CARTO needs a key).

## Out of scope (for now)

Traffic-aware times, public transport/bike/walk, several points, countries other than
Portugal, rent vs. buy selection (change it on idealista after the page opens), storing or
scraping listings.
