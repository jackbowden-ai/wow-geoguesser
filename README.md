# Azeroth GeoGuessr

A GeoGuessr-style quiz for the World of Warcraft Classic world map, built with Next.js (App Router) and TypeScript. No map or animation libraries.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
```

## The map

The game uses the Classic world map at `public/maps/azeroth.png` (1002 x 668). To swap in a different image, replace that file and set `MAP_ASPECT` in `lib/geo.ts` to its width divided by its height.

The map is Blizzard artwork, so check its terms before publishing the game publicly.

## Nudge an answer position

Answers are normalised coordinates (`0,0` top-left to `1,1` bottom-right) in `data/questions.ts`. I measured them by eye against the artwork, so a few may be off by a little (the Eastern Kingdoms zones are the least certain). To adjust one:

1. Open `http://localhost:3000/?debug=1`.
2. Click the true location. The card shows its `x`/`y`.
3. Copy those values into that question's `answer`.

In debug mode the reveal card also prints the stored answer coordinates.

## How it plays

- 5 random questions drawn from a pool of 22 (`data/questions.ts`). Add more by appending to the array.
- Click to drop a pin, then "Lock in guess" (or press Enter).
- Distance is shown in approximate yards. `YARDS_PER_MAP_WIDTH` in `lib/geo.ts` controls the scale.
- Score is up to 5,000 per round with exponential falloff. Tune it in `scoreFor`.
- On reveal the map flies out to frame both points, draws the line, then zooms in on the true location.
- Mouse drag/wheel and touch drag/pinch are supported, plus on-screen zoom buttons.
- The end screen gives a rating and a copyable emoji summary.

## Structure

```
app/            layout, page, global styles
components/     Game.tsx (state, HUD, cards, results), MapView.tsx (pan/zoom/fly-to)
data/           questions.ts
lib/            geo.ts (distance, scoring, helpers)
public/maps/    azeroth.png (the world map)
```
