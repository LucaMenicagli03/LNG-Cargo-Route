# GasLane — LNG Cargo Route Terminal

A Bloomberg-inspired dark terminal for visualizing LNG (Liquefied Natural Gas) shipping routes and cargoes around the globe. This is an **experiment** — the goal is to study how global LNG trade flows look on a 3D map and to recreate the look-and-feel of a professional commodities trading terminal in pure HTML/CSS/JS.

> ⚠️ **This is a design prototype, not a production tool.** Vessel positions, prices, ETAs, and most numbers shown in the UI are **synthetic / simulated**. See the "Known limitations" section below before reading anything into the data.


## What it is

A single-page web app that renders:

- A rotating **3D orthographic globe** with real-world coastlines.
- ~40 of the largest **LNG export and import terminals** with accurate latitude/longitude (Ras Laffan, Sabine Pass, Gorgon, Yamal, Bintulu, Bonny, Idku, Futtsu, Incheon, Dahej, Zeebrugge, Gate Rotterdam, etc.).
- **Major shipping routes** colour-coded by direction (green = export/loading, red = import/discharge, amber = at port).
- 30 illustrative LNG carriers in transit, each clickable for a Bloomberg-style detail panel: operator, capacity, voyage progress, fuel, boil-off, JKM netback, AIS events, sparkline.
- A **scrolling ticker** with TTF / JKM / HH / Brent quotes.
- Drag-to-rotate, scroll-to-zoom, auto-spin, hover tooltips on vessels.

## Why

I wanted to:

1. Map the **physical reality of global gas trade** — which ports send cargoes where, and what the dominant corridors look like (Qatar → NE Asia, US Gulf → NW Europe, Australia → Japan, Yamal → Europe / Asia).
2. Practice building a dense, information-rich UI in the **Bloomberg Terminal aesthetic** (monospaced type, ticker tape, multi-pane layout, status chrome, dark palette with green/red/amber accents).
3. Have a sandbox to later plug in real data sources.

## Stack

- Pure **HTML + CSS + vanilla JavaScript**. No framework, no build step, no dependencies.
- Single self-contained file: just open `LNG Terminal.html`.
- Orthographic projection, great-circle interpolation, and waypoint chaining are written from scratch (~400 lines of geometry).
- Coastlines: [`world-atlas/countries-110m`](https://unpkg.com/world-atlas@2.0.2/countries-110m.json) loaded at runtime, with a hand-coded schematic fallback if the CDN fails.

## Known limitations & criticalities

This section is intentionally honest. **Do not use this app to make trading decisions.**

### Data is simulated

- **Vessel names, IMO numbers, operators, flags, capacities, speeds, and positions** along their routes are illustrative. Real LNG carriers exist with similar names, but the live state shown here is **not** real-world AIS data.
- **Prices** (TTF, JKM, Henry Hub, Brent in the top ticker; the per-vessel JKM sparkline in the detail panel) are **random walks** seeded by IMO. They update every ~1.8 seconds with a small stochastic delta. They are **not** connected to Platts, ICE, S&P Global Commodity Insights, EIA, FRED, Refinitiv, or Bloomberg.
- **ETAs, fuel %, boil-off %, day rates, netback values, and the events feed** are all generated client-side from `Math.random()`.

### Why no live feed?

Real LNG market data is heavily paywalled:
- **JKM** is a Platts / S&P Global proprietary assessment.
- **TTF** futures are an **ICE** product.
- **AIS vessel positions** filtered by LNG vessel type require commercial subscriptions to MarineTraffic, VesselFinder, Spire, or Kpler.
- **EIA** publishes Henry Hub spot but only **weekly**, not intraday.
- Free public APIs that aggregate commodity prices (oilpriceapi.com, commodities-api.com) require user-specific API keys, have low rate limits, and ultimately resell the same paid sources.

To wire real data, you'd need to obtain at least one paid or free-tier API key and replace the `genSeries(...)` and `VESSELS` arrays in the code with feed-driven values.

### Geographic / routing approximations

- Routes use **chained great-circle segments** with manually placed shipping-lane waypoints (Hormuz, Bab el-Mandeb, Suez, Gibraltar, Malacca, Lombok, Panama, Cape of Good Hope, North Cape). This avoids most land crossings but is **not** a true marine routing engine — it does not account for:
  - Real ECDIS lanes / IMO traffic separation schemes.
  - Seasonal ice (Northern Sea Route, Baltic).
  - Canal transit slots, draft restrictions, beam limits.
  - Port pilotage / berth queues.
  - Geopolitical exclusion zones (Red Sea diversions around the Cape, etc., which fluctuate weekly in the real market).
- Some less-common port pairs may still produce visually awkward paths because no waypoint rule was written for them — those fall back to a naïve great circle.
- The **orthographic projection** is fine for a globe view but distorts route lengths visually near the limb. Distances quoted in the detail panel are **not** computed from the projected path.

### UI / UX caveats

- Mobile / touch is **not** supported. Drag, zoom, and hover assume a desktop pointing device.
- The detail panel sparkline is per-vessel but the ticker prices at the top are global and not tied to any specific ship.
- Vessels on the back hemisphere of the globe are hidden — you must rotate the globe (drag, or click a list row to auto-rotate to that ship) to see them.
- No persistence: every reload re-seeds the random data.
- Tooltips assume small-to-medium vessels; very long names may overflow.

### Technical caveats

- All logic is in a single ~1100-line HTML file. It works but it is not modular — splitting into ES modules would help for future contributors.
- Coastline rendering uses TopoJSON's countries-110m, which is **low resolution**. Small islands and peninsulas are missing, which is partly why some routes look like they "cut" land near small archipelagos.
- The auto-rotation runs on `requestAnimationFrame` but the projection re-computes for every coastline polygon every frame. Performance is fine on modern desktops; a Canvas/WebGL rewrite would be needed for thousands of vessels.

## Run

Just open the HTML file in any modern browser:

```bash
open "LNG Terminal.html"
```

Or serve it:

```bash
python3 -m http.server 8000
# → http://localhost:8000/LNG%20Terminal.html
```

## Project structure

```
LNG Terminal.html   # Single-file app (HTML + inlined CSS + inlined JS)
README.md           # This file
.gitignore
```

(Earlier iterations had separate `data.js`, `globe.js`, and `app.js` — these were inlined into the HTML so the file works fully offline with no relative-path issues.)

## Roadmap / open questions

- [ ] Plug real Henry Hub / TTF / JKM via a free-tier commodity API.
- [ ] Static integration of the EIA weekly LNG export report (real US departures, capacities, destinations).
- [ ] Optional Mercator / equirectangular projection toggle.
- [ ] Touch-screen support.
- [ ] Vessel filter by operator / flag / capacity class.
- [ ] Persisted UI state (selected vessel, rotation) across reloads.

## License

MIT — use, fork, and modify freely. If you wire it to real data, please clearly disclose data sources and any delays.

## Disclaimer

This project is an independent experiment with no affiliation to Bloomberg L.P., S&P Global, ICE, Platts, EIA, or any LNG operator named in the data. The "Bloomberg-style" reference describes the visual aesthetic only.

