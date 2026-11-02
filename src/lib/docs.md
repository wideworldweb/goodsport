# Noridoc: lib

Path: @/src/lib

### Overview

- Everything the homepage renders and the logic behind it: the Svelte section components in @/src/lib/components, pure helpers for classifying and formatting posts, building ticker text, and the physics for the scroll-driven oval.
- Server-only data fetching lives in the @/src/lib/server subfolder (see @/src/lib/server/docs.md); this folder consumes its `Post` and `Game` shapes.

### How it fits into the larger codebase

```
src/routes/+page.server.ts ──► tickers.ts ──► post.ts
         │                        └─► server/schedule.ts (TEAMS, Game)
         ▼
src/routes/+page.svelte ──► components/* ──► post.ts
src/routes/+layout.svelte ──► components/Oval.svelte ──► swing.ts, morph.ts
                                    │
                                    └─ reads DOM markers placed by the page and
                                       Subscribe: data-swing-section,
                                       data-morph-section, data-oval-target
```

- @/src/lib/tickers.ts is called from the server load and imports `TEAMS` from `$lib/server`, so it is effectively server-only; components receive finished ticker strings as props.
- @/src/lib/post.ts is shared by the page, the components, and the ticker builder so that "issue" and "episode" mean the same thing everywhere.
- Components are styled with the palette and font custom properties from @/src/app.css and use its `layer` class for stacking against the oval.

### Core Implementation

- Post classification (@/src/lib/post.ts): an episode is any post with an `audio` enclosure. An issue is a non-episode whose title starts with the `[Good Sport NYC]` newsletter prefix or ends in a date range (e.g. "Oct 19 - 25"). Everything else is a regular post. `headline` strips the newsletter prefix; `issueLabel` shows the title's date range, else the short publish date; `timeAgo` gives hours or days relative to a supplied `now`.
- Episode card names: `episodeName` uses a hand-written `EPISODE_NAMES` map for titles without a guest, otherwise the text after "with" (dropping a possessive lead-in such as an organization name), else the full title. New episodes without "with X" need a map entry to get a short card name. `episodeSummary` strips Substack's "Listen now ... |" prefix from descriptions.
- Tickers (@/src/lib/tickers.ts) produce three bands of strings:

| Band | Content | Fallback |
| --- | --- | --- |
| Up next | Each team's next non-final game within six weeks, soonest first, as matchup, kickoff and venue | "Team: Back in Month" for teams with nothing scheduled |
| Results | Each team's latest final within three weeks, as a score line | The up-next band if no team has a recent result |
| Good Sport | Newest issue, newest episode, newest regular post | The page falls back to the feed title if a band is empty |

- Ticker rendering (@/src/lib/components/Ticker.svelte) is a pure CSS marquee: several identical copies of the item list sit in a row, and each copy translates by -100% of its own width per loop, so the seam is invisible. A visually hidden paragraph carries the text once for screen readers; the animated track is `aria-hidden`.
- The oval (@/src/lib/components/Oval.svelte) is a fixed, white-rimmed ellipse whose width is computed with CSS trig so its rotated outline touches both viewport edges. Positions where each `data-swing-section` and the `data-morph-section` take over are measured as a quarter of the way into each section (clamped to the furthest reachable reading line); the reading line is the vertical middle of the viewport.
- Swing (@/src/lib/swing.ts): sections alternate the target angle between -17 and +17 degrees, and a damped spring integrated in fixed substeps swings the oval toward it with a small overshoot.
- Morph (@/src/lib/morph.ts): when the reading line passes the subscribe section's trigger, progress runs from 0 to 1 over about a second (and back when scrolling up). For the first three quarters the oval eases from its full-screen shape onto the target card's on-screen position, size and tilt (re-read every frame so it tracks scrolling); the last quarter fades the rim into a cream fill. On landing the oval hides and the card's `data-oval-state` flips from `waiting` to `landed`, which fades the card's content in.
- A single `requestAnimationFrame` loop drives both swing and morph. It starts only when a target changes, uses elapsed time (clamped per frame) so motion is frame-rate independent, stops once both have settled, and pauses while the tab is hidden. Measurements refresh on resize, body size changes, and after web fonts load. Style writes are skipped when a value is unchanged. The approach follows the org's `smooth-web-animation` skill.

### Things to Know

- Under `prefers-reduced-motion` the oval never animates: it sits at the first tilt and jumps straight between not-morphed and landed. Ticker marquees, the hero starburst rotation, and hover transitions also stop.
- The subscribe card is invisible (`waiting`) until the oval lands on it. If the oval script never runs (no JS), the card has no `data-oval-state` and shows normally.
- New sections must carry the `layer` class so their content stays above the oval, and should be wrapped in a `data-swing-section` in @/src/routes/+page.svelte if the oval should swing across them.
- Text in the Minimal 5x7 pixel font (tickers, buttons) must stick to its limited ASCII glyph set at multiples of 16px; `tickers.ts` replaces curly quotes and long dashes, and ticker separators are the font's hyphen stretched with `scaleX` because it has no long dash.
- The Instagram section is placeholder colour tiles linking to the profile; there is no real feed yet. Phone layouts across components are rough and deliberately deferred.
- The animation and ticker helpers are pure and unit tested directly; components are covered by the page render tests in @/src/routes.

Created and maintained by Nori.
