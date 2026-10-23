# Natural card connections — implementation stage report

## User intent
Natural Bézier curves take priority. Crossing cards is permitted. Correct only extreme folds, acute reversals and loops; do not force connections onto obstacle-avoiding rectangular buses.

## Changes
- Removed visibility-grid search, rectangular detours and collision rejection from shared planning/material routing.
- Ordinary links remain a single cubic; unrelated card positions no longer affect them.
- Backward-facing handles are bounded. Near-cusped/reversed links use two tangent-continuous cubics with a bounded bend, not a whole-canvas perimeter route.
- Explicit material ports remain fixed. Planning sequence/containment styles and character-undirected semantics were not changed.
- Preview, canvas and SVG exports continue using the same geometry. PNG export rasterizes that SVG (source verified; no new PNG download test performed).

## Verification
- 26 focused routing tests passed: diagonal, fan-out, unrelated obstacles, overlapping cards, reverse row/column, near-coincident and acute geometry, sampled self-intersection sweep, all 16 material port pairs, label placement, preview/export parity and arrow/color/dash semantics.
- Typecheck and workbench build passed.
- Final integrated workbench rerun passed 300/300 (`/tmp/natural-curves-final-suite.log`). Parallel zoom-port worker reported root suite 378/378 passed.
- Cloud browser visually inspected generated before/after production geometry in a synthetic regression scene. Evidence: `artifacts/natural-curves/before-after.png`; fixture: `artifacts/natural-curves/comparison.html`. This is not the user's private story data or a claim of full application interaction coverage.
- Original screenshot inspected via Library materialization.

## Boundaries
Cloud checkout only. No commit, push, release, deployment or user-local change. Private handoff/report/native-probe/PowerShell modifications were not touched. Test fixtures/server routes are isolated development artifacts.

## Integrated cloud-browser check
After the zoom fixture's duplicate React dependency was corrected, CUA verified production shared-hook behavior in its synthetic wrapper: at 35% zoom, ports disappear and dragging moves the card without adding a link; at 60%, selected top-to-right connection succeeds; lowering an active wire to 59% cancels it without adding another link. The planning-styled wrapper also connects at 100%. These fixtures use material connection policy, so this does not substitute for full planning-domain UI tests. Screenshots are in `artifacts/graph-port-zoom/{material-35-cua,material-60-cua,planning-100-cua}.png`.
