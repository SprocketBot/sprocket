# Changelog — Evidence (April 13–26, 2026)

## Dynamic Playoff Bracket & Tiebreaker Engine ([PR #143](https://github.com/Minor-League-Esports/evidence/pull/143), [PR #145](https://github.com/Minor-League-Esports/evidence/pull/145))

- **New Playoff Picture page** — Added a dedicated Playoff Picture page with league/game mode filters, SQL queries for playoff seeding and bracket matchups.
- **Full tiebreaker engine** — Implements the complete MLE Season 19 tiebreaker procedure (Win% → H2H → Series% → Division% → Goal Difference → Goals For) with multi-team H2H elimination.
- **Dynamic playoff bracket** — Interactive bracket component (`PlayoffBracket.svelte`) that renders both 16-team layouts (Foundation/Premier: SF → CF → Championship) and 32-team layouts (Academy/Champion/Master: QF → SF → CF → GF).
- **Projection-to-actual replacement** — Bracket builder functions now properly replace projected matchups with actual game results as playoffs progress.
- **Tiebreaker bug fixes** — Fixed playoff tiebreakers to compute division winners in JavaScript with full H2H rules; applied Rule 1.9 cross-division procedure for multi-division ties.

## Site-Wide Improvements ([PR #142](https://github.com/Minor-League-Esports/evidence/pull/142))

- **Dynamic player eligibility shading** — Eligibility status shading is now computed dynamically per league instead of being hardcoded.
- **NCP matches in series records** — Non-Championship Play (NCP) matches now count toward team series records.
- **Clickable Week and Record links** — Week numbers and records on the franchise S19 Records tab are now clickable for easier navigation.

## Franchise Page Improvements ([PR #140](https://github.com/Minor-League-Esports/evidence/pull/140))

- Added Overall Win% column to the franchise index.
- Fixed alternate row coloring on franchise page columns.

## Visual Updates ([PR #144](https://github.com/Minor-League-Esports/evidence/pull/144))

- **Dark/light mode header logos** — Header logo now adapts to the active theme (LIGHT 10.png in light mode, DARK 10.png in dark mode).
- Added remaining new logo assets (10LOGOMLEB2x, 10LOGOMLEW2x, DARK MLE, LIGHT MLE, MLE_TM).

## Data Corrections

- **Overall Win% casing** — Matched `Overall_Win_Pct` column casing to other column names for consistency.
- **Overall Win% sorting** — Kept Overall Win % as a numeric value for proper sorting behavior.
