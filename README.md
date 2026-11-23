# Drive-time search for idealista

[![Tests](https://github.com/aucls1/idealista-drive-time/actions/workflows/test.yml/badge.svg)](https://github.com/aucls1/idealista-drive-time/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A Chrome extension that searches [idealista.pt](https://www.idealista.pt) for homes
**within X minutes' drive** of a point you choose — not within X kilometres.

Pick a place (your work, your kids' school…), choose a time from 5 to 60 minutes, and the
extension opens idealista's own map search restricted to the area you can reach by car.
Towns that are far away but quick by motorway — the ones normal filters miss — show up.

> 🇵🇹 Extensão Chrome que pesquisa casas no idealista.pt a até X minutos de carro de um
> ponto à escolha. A interface está em português.

> **Not affiliated with idealista.** This is an independent open-source project. It only
> builds a link to idealista's public drawn-area search; it does not scrape, store or modify
> anything on idealista.

## How it works

1. You drop a pin (or search an address) and pick the minutes.
2. [OpenRouteService](https://openrouteservice.org/) computes the area reachable by car
   (empty roads, no traffic).
3. The extension turns that area into one outline that always **covers all of it**
   (it may include a little extra, never less) and opens idealista with it.

The popup shows the real reachable area in blue and the outline sent to idealista in
dashed orange, so you can check it before opening the search. Details in
[docs/design.md](docs/design.md).

## Install

The extension is not on the Chrome Web Store yet; load it from source:

1. Download this repository (`git clone` or *Code → Download ZIP*, then unzip).
2. Open `chrome://extensions`, turn on **Developer mode**, click **Load unpacked** and pick
   the repository folder.
3. Get a free API key at [openrouteservice.org](https://openrouteservice.org/dev/#/signup).
4. Right-click the extension icon → **Options**, paste the key, **Save**.

Your key is stored only in your browser (`chrome.storage.local`) and is sent only to
`api.openrouteservice.org`. The free plan allows 500 searches/day and 20/minute.

## Usage

1. Click the extension icon.
2. Search an address or click the map to set the starting point (the pin can be dragged).
3. Set the minutes and click **Calcular área**.
4. Check the shape, then click **Abrir no idealista**.

On idealista you can change rent/buy and property type; the drawn area is kept.

## Limitations

- Portugal (idealista.pt), buy homes, car only, empty-road times, one point, up to 60 min.
- The outline is a bit larger than the real area (shown in the popup as `+X%`).

See [open issues](https://github.com/aucls1/idealista-drive-time/issues) for what's
planned — Spain, Italy and France are mostly a matter of mapping idealista's URL paths.

## Development

No build step and no dependencies. Requires Node.js ≥ 20 for the tests.

```sh
npm test
```

```
manifest.json        Chrome extension manifest (MV3)
popup.html/.js/.css  Map, search and buttons
options.html/.js     API key settings
src/ors.js           OpenRouteService client (geocoding, isochrones)
src/envelope.js      "Grow only" outline of the reachable area
src/polyline.js      Google Encoded Polyline
src/idealista.js     idealista search URL
test/                Unit tests (node:test)
vendor/leaflet/      Leaflet 1.9.4 (BSD-2-Clause), vendored because MV3 forbids remote code
```

After changing code, click ↻ on the extension in `chrome://extensions`.

## Contributing

Contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) and our
[Code of Conduct](CODE_OF_CONDUCT.md). Please report security issues as described in
[SECURITY.md](SECURITY.md).

## Credits

- Routing and geocoding: [OpenRouteService](https://openrouteservice.org/) (HeiGIT)
- Map: [Leaflet](https://leafletjs.com/), tiles © Esri, data © OpenStreetMap contributors

## License

[MIT](LICENSE). Leaflet is distributed under its own
[BSD-2-Clause license](vendor/leaflet/LICENSE).
