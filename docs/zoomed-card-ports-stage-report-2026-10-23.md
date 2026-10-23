# Zoomed-out card connection targets — implementation stage

## Result

Shared graph connections are hidden **and disabled below 60% zoom**, restored at 60% and above. This applies to the shipped planning/material/character/world graph hook and the legacy shared graph implementation. Existing edges are not hidden or rewritten.

A standard 248 × 168 card is about 149 × 101 screen pixels at the cutoff (planning cards may be taller). This leaves room for the existing 44px touch target without letting four fixed-screen targets dominate small overview cards. Inverse hit scaling is capped at 1 / 0.6; available editing zooms retain the normal 44px material/planning touch target.

- Hidden buttons use `hidden`, `disabled`, `tabIndex=-1`, and explicit `display:none!important` / `pointer-events:none!important`; pseudo-elements cannot retain hit targets.
- Pointer, keyboard, validation and commit handlers check current zoom, including stale event callbacks.
- Crossing below the cutoff cancels an armed wire and invalidates asynchronous connection intent. Zooming back in does not resurrect a cancelled connection.
- Port directions/free-port combinations, card move handlers, and existing edge rendering are unchanged.

## Verification

Passed against the integrated working tree:

- Root `npm test`: **378/378**.
- Workbench `npm test --prefix integrations/chatgpt-workbench`: **298/298**.
- `npm run typecheck`.
- `git diff --check`.
- Real shipped hook handler tests: **19/19**, including all 16 material port combinations, touch connections, overview mouse/touch card movement, 60% boundary restoration, stale handlers and async cancellation.
- Focused zoom geometry tests: **8/8**, covering both shared implementations.
- Standalone browser fixture compiles with production hook and planning/material CSS; visible 10/35/59/60/100% controls and live current route rendering.

`tests/ui-graph-port-zoom.mjs` was added for browser hit-testing, near-port dragging, boundary restore, existing-edge presence, and restored free-port mouse/touch connection checks. **Its headless browser checks did not run:** Chromium startup failed with sandbox `socket() Operation not permitted`; one reviewed escalation failed with `bwrap ... sessions: Read-only file system`. No further shell-browser attempts. Cloud CUA verification subsequently passed in the parallel curve worker (details below); this does not imply the headless runner executed.

Fixture generation only: `node tests/ui-graph-port-zoom.mjs --fixture-only` → `artifacts/graph-port-zoom/index.html` (synthetic cards, real shared hook/styles, not a full account or feature-component acceptance test).

## Scope

Changed the two shared graph hooks, geometry helpers and graph styles; extended `tests/graph-zoom.test.js`, workbench `tests/graph-touch.test.mjs`, and added the browser regression runner. The hook test harness now explicitly starts connection-editing scenarios at 100%; separate tests cover overview zoom.

No commit, push, release build, deployment, or user-computer action. The four pre-existing private modifications were not edited. Parallel routing changes are reported separately.

## Cloud CUA evidence (subsequent verification)

The curve worker verified the compiled fixture using real browser pointer interactions:

- At **35%**, ports absent from the accessibility tree; dragging A moved it from (100,120) to (202.857,260), with **0 connection writes**.
- At **60%**, ports returned; A top → B right completed with **1 connection write**.
- Starting another wire then selecting **59%** cancelled it and hid targets; connection count stayed **1**.
- Planning-style **100%** fixture connected A right → B left.

Screenshots: `artifacts/graph-port-zoom/material-35-cua.png`, `material-60-cua.png`, and `planning-100-cua.png`.

The fixture uses the real shared hook and production styles, but its planning-style mode still uses the material free-port policy. Thus this proves shared pointer/hit-target behavior, not full planning feature semantics. Full planning direction rules and touch flows remain covered by real hook tests, not this CUA pass. A duplicate-React issue in the initial fixture was corrected by aliasing React/ReactDOM to one dependency tree; the regenerated fixture passed the above checks.
