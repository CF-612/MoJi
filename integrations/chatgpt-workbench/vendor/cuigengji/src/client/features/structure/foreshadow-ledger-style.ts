/** 伏笔台账：一条伏笔 = 埋设 → 推进 → 回收 三阶段轨道 + 各阶段关联的剧情卡。 */
const narrowRules = `
 .cuigengji .cg-fore-ledger .cg-fore-toolbar {gap:8px;}
 .cuigengji .cg-fore-ledger .cg-fore-toolbar h2 {font-size:16px;}
 .cuigengji .cg-fore-ledger .cg-fore-search {order:5;flex:1 1 100%;max-width:none;margin-left:0;}
 .cuigengji .cg-fore-ledger .cg-fore-new {margin-left:auto;}
 .cuigengji .cg-fore-ledger .cg-fore-filters {width:100%;}
 .cuigengji .cg-fore-ledger .cg-fore-filters button {flex:1 0 auto;padding:3px 8px;font-size:11px;}
 .cuigengji .cg-fore-ledger .cg-fore-head {gap:8px;padding:12px 12px 8px;}
 .cuigengji .cg-fore-ledger .cg-fore-sigil {display:none;}
 .cuigengji .cg-fore-ledger .cg-fore-title {font-size:14px;}
 .cuigengji .cg-fore-ledger .cg-fore-actions {margin-left:auto;}
 .cuigengji .cg-fore-ledger .cg-fore-track {grid-template-columns:minmax(0,1fr);padding:0 2px 4px;}
 .cuigengji .cg-fore-ledger .cg-fore-stage {display:grid;grid-template-columns:30px minmax(0,1fr);column-gap:10px;align-items:stretch;}
 .cuigengji .cg-fore-ledger .cg-fore-rail {grid-column:1;grid-row:1;align-self:stretch;align-items:flex-start;justify-content:center;height:auto;}
 .cuigengji .cg-fore-ledger .cg-fore-rail::before,.cuigengji .cg-fore-ledger .cg-fore-rail::after {top:auto;right:auto;bottom:auto;left:50%;width:2px;height:auto;transform:translateX(-1px);}
 .cuigengji .cg-fore-ledger .cg-fore-rail::before {top:0;height:15px;}
 .cuigengji .cg-fore-ledger .cg-fore-rail::after {top:15px;bottom:0;}
 .cuigengji .cg-fore-ledger .cg-fore-stage[data-first=true] .cg-fore-rail::before {display:none;}
 .cuigengji .cg-fore-ledger .cg-fore-stage[data-last=true] .cg-fore-rail::after {display:none;}
 .cuigengji .cg-fore-ledger .cg-fore-stage-body {grid-column:2;grid-row:1;padding:0 0 14px;gap:6px;}
 .cuigengji .cg-fore-ledger .cg-fore-stage-title {justify-content:flex-start;min-height:30px;}
 .cuigengji .cg-fore-ledger .cg-fore-evidence {justify-content:flex-start;}
 .cuigengji .cg-fore-ledger .cg-fore-stage-empty {padding:8px;text-align:left;}
 .cuigengji .cg-fore-ledger .cg-fore-note {margin:10px 12px 12px;}
 .cuigengji .cg-fore-ledger .cg-fore-alerts {padding:0 12px 8px;}
`;
export const foreshadowLedgerStyles = `
.cuigengji .cg-fore-ledger {--fore-planned:light-dark(#5a6b8c,#a9bcd6);--fore-planted:var(--cg-accent);--fore-developing:light-dark(#9a5c0d,#ffbb72);--fore-recovered:light-dark(#2c8359,#5fd39b);--fore-abandoned:var(--cg-muted);--fore-rail:color-mix(in srgb,var(--cg-muted) 28%,transparent);}
.cuigengji .cg-fore-ledger .cg-fore-toolbar {display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:0 0 10px;}
.cuigengji .cg-fore-ledger .cg-fore-toolbar h2 {display:flex;align-items:center;gap:8px;margin:0;font-size:18px;font-weight:650;letter-spacing:.01em;}
.cuigengji .cg-fore-ledger .cg-fore-toolbar h2 .app-icon {width:17px;height:17px;color:var(--cg-orange);}
.cuigengji .cg-fore-ledger .cg-fore-total {flex:none;padding:2px 8px;border:1px solid var(--cg-line);border-radius:20px;font-size:11px;color:var(--cg-muted);white-space:nowrap;}
.cuigengji .cg-fore-ledger .cg-fore-search {display:flex;align-items:center;gap:6px;flex:1 1 170px;min-width:0;max-width:280px;height:32px;margin-left:auto;padding:0 8px;border:1px solid var(--cg-line);border-radius:8px;background:var(--cg-paper);color:var(--cg-muted);transition:border-color 120ms,box-shadow 120ms;}
.cuigengji .cg-fore-ledger .cg-fore-search:focus-within {border-color:color-mix(in srgb,var(--cg-accent) 50%,var(--cg-line));box-shadow:0 0 0 3px color-mix(in srgb,var(--cg-accent) 12%,transparent);color:var(--cg-accent);}
.cuigengji .cg-fore-ledger .cg-fore-search .app-icon {flex:none;width:14px;height:14px;}
.cuigengji .cg-fore-ledger .cg-fore-search input {flex:1;min-width:0;height:100%;padding:0;border:0;border-radius:0;background:transparent;font-size:12px;color:var(--cg-ink);}
.cuigengji .cg-fore-ledger .cg-fore-search input:focus-visible {outline:none;}
.cuigengji .cg-fore-ledger .cg-fore-search-clear {display:grid;place-items:center;flex:none;width:20px;height:20px;min-height:0;padding:0;border:0;border-radius:5px;background:transparent;color:var(--cg-muted);font-size:14px;line-height:1;}
.cuigengji .cg-fore-ledger .cg-fore-search-clear:not(:disabled):hover {background:color-mix(in srgb,var(--cg-muted) 14%,transparent);color:var(--cg-ink);}
.cuigengji .cg-fore-ledger .cg-fore-new {flex:none;min-height:32px;padding:6px 14px;font-size:12px;white-space:nowrap;}
.cuigengji .cg-fore-ledger .cg-fore-filters {display:flex;align-items:center;gap:3px;flex-wrap:wrap;width:fit-content;max-width:100%;margin:0 0 14px;padding:3px;border:1px solid var(--cg-line);border-radius:9px;background:color-mix(in srgb,var(--cg-ink) 3%,var(--cg-paper));}
.cuigengji .cg-fore-ledger .cg-fore-filters button {--state:var(--cg-accent);min-height:26px;padding:3px 10px;border:1px solid transparent;border-radius:6px;background:transparent;color:var(--cg-muted);font-size:12px;white-space:nowrap;}
.cuigengji .cg-fore-ledger .cg-fore-filters button:not(:disabled):hover {background:color-mix(in srgb,var(--state) 9%,transparent);color:var(--state);}
.cuigengji .cg-fore-ledger .cg-fore-filters button[aria-pressed=true] {border-color:color-mix(in srgb,var(--state) 28%,transparent);background:color-mix(in srgb,var(--state) 13%,transparent);color:var(--state);font-weight:600;}
.cuigengji .cg-fore-ledger .cg-fore-filters button[data-status=planned] {--state:var(--fore-planned);}
.cuigengji .cg-fore-ledger .cg-fore-filters button[data-status=planted] {--state:var(--fore-planted);}
.cuigengji .cg-fore-ledger .cg-fore-filters button[data-status=developing] {--state:var(--fore-developing);}
.cuigengji .cg-fore-ledger .cg-fore-filters button[data-status=recovered] {--state:var(--fore-recovered);}
.cuigengji .cg-fore-ledger .cg-fore-filters button[data-status=abandoned] {--state:var(--fore-abandoned);}
.cuigengji .cg-fore-ledger .cg-fore-planning-error {display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 0 12px;padding:8px 10px;border:1px solid color-mix(in srgb,var(--fore-developing) 30%,var(--cg-line));border-radius:8px;background:color-mix(in srgb,var(--fore-developing) 8%,transparent);font-size:11px;line-height:1.7;color:var(--fore-developing);}
.cuigengji .cg-fore-ledger .cg-fore-planning-error button {margin-left:auto;min-height:24px;padding:2px 8px;border:1px solid color-mix(in srgb,var(--fore-developing) 35%,var(--cg-line));border-radius:6px;background:transparent;color:inherit;font-size:11px;}
.cuigengji .cg-fore-ledger .cg-fore-list {display:flex;flex-direction:column;gap:16px;}
.cuigengji .cg-fore-ledger .cg-fore-card {--state-color:var(--fore-planned);position:relative;border:1px solid var(--cg-line);border-radius:14px;background:var(--cg-paper);box-shadow:0 1px 2px var(--cg-shadow);overflow:hidden;transition:border-color 160ms,box-shadow 160ms;}
.cuigengji .cg-fore-ledger .cg-fore-card::before {content:'';position:absolute;inset:0 0 auto;height:3px;background:linear-gradient(90deg,var(--state-color),color-mix(in srgb,var(--state-color) 32%,transparent) 72%,transparent);}
.cuigengji .cg-fore-ledger .cg-fore-card:hover {border-color:color-mix(in srgb,var(--cg-edge) 65%,var(--cg-line));box-shadow:0 10px 26px var(--cg-shadow);}
.cuigengji .cg-fore-ledger .cg-fore-card[data-status=planned] {--state-color:var(--fore-planned);}
.cuigengji .cg-fore-ledger .cg-fore-card[data-status=planted] {--state-color:var(--fore-planted);}
.cuigengji .cg-fore-ledger .cg-fore-card[data-status=developing] {--state-color:var(--fore-developing);}
.cuigengji .cg-fore-ledger .cg-fore-card[data-status=recovered] {--state-color:var(--fore-recovered);}
.cuigengji .cg-fore-ledger .cg-fore-card[data-status=abandoned] {--state-color:var(--fore-abandoned);}
.cuigengji .cg-fore-ledger .cg-fore-card[data-status=abandoned] .cg-fore-title {color:var(--cg-muted);}
.cuigengji .cg-fore-ledger .cg-fore-card[data-status=abandoned] .cg-fore-stage {--stage:var(--cg-muted);}
.cuigengji .cg-fore-ledger .cg-fore-head {display:flex;align-items:flex-start;gap:10px;padding:14px 16px 8px;}
.cuigengji .cg-fore-ledger .cg-fore-sigil {display:grid;place-items:center;flex:none;width:28px;height:28px;margin-top:1px;border:1px solid color-mix(in srgb,var(--state-color) 24%,transparent);border-radius:9px;background:color-mix(in srgb,var(--state-color) 11%,transparent);color:var(--state-color);}
.cuigengji .cg-fore-ledger .cg-fore-sigil .app-icon {width:16px;height:16px;}
.cuigengji .cg-fore-ledger .cg-fore-headline {display:flex;flex:1;flex-direction:column;gap:6px;min-width:0;}
.cuigengji .cg-fore-ledger .cg-fore-title-row {display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-width:0;}
.cuigengji .cg-fore-ledger .cg-fore-title {margin:0;font-size:15px;font-weight:650;line-height:1.5;overflow-wrap:anywhere;}
.cuigengji .cg-fore-ledger .cg-fore-badge {display:inline-flex;flex:none;align-items:center;gap:5px;padding:2px 9px;border:1px solid color-mix(in srgb,var(--state-color) 26%,transparent);border-radius:20px;background:color-mix(in srgb,var(--state-color) 12%,transparent);color:var(--state-color);font-size:11px;font-weight:600;white-space:nowrap;}
.cuigengji .cg-fore-ledger .cg-fore-badge i {width:6px;height:6px;border-radius:50%;background:currentColor;}
.cuigengji .cg-fore-ledger .cg-fore-meta {display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:11px;color:var(--cg-muted);}
.cuigengji .cg-fore-ledger .cg-fore-count {padding:1px 7px;border:1px solid var(--cg-line);border-radius:20px;white-space:nowrap;}
.cuigengji .cg-fore-ledger .cg-fore-meta-item {display:inline-flex;align-items:center;gap:4px;min-width:0;}
.cuigengji .cg-fore-ledger .cg-fore-link {padding:0;border:0;border-radius:3px;background:none;color:var(--cg-accent);font-size:11px;text-decoration:underline;text-underline-offset:2px;text-decoration-color:color-mix(in srgb,var(--cg-accent) 40%,transparent);}
.cuigengji .cg-fore-ledger .cg-fore-link:not(:disabled):hover {background:none;text-decoration-color:currentColor;}
.cuigengji .cg-fore-ledger .cg-fore-memory {max-width:180px;min-height:22px;padding:1px 8px;border:1px solid var(--cg-line);border-radius:20px;background:color-mix(in srgb,var(--cg-ink) 2%,var(--cg-paper));color:var(--cg-muted);font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.cuigengji .cg-fore-ledger .cg-fore-memory:not(:disabled):hover {border-color:color-mix(in srgb,var(--cg-accent) 35%,var(--cg-line));background:color-mix(in srgb,var(--cg-accent) 8%,var(--cg-paper));color:var(--cg-accent);}
.cuigengji .cg-fore-ledger .cg-fore-actions {display:flex;flex:none;align-items:center;gap:4px;}
.cuigengji .cg-fore-ledger .cg-fore-icon-btn {display:grid;place-items:center;width:30px;height:30px;min-height:30px;padding:0;border:1px solid transparent;border-radius:7px;background:transparent;color:var(--cg-muted);}
.cuigengji .cg-fore-ledger .cg-fore-icon-btn:not(:disabled):hover {border-color:var(--cg-line);background:var(--cg-wash);color:var(--cg-accent);}
.cuigengji .cg-fore-ledger .cg-fore-icon-btn .app-icon {width:15px;height:15px;}
.cuigengji .cg-fore-ledger .cg-fore-alerts {display:flex;flex-wrap:wrap;gap:6px;padding:0 16px 8px;}
.cuigengji .cg-fore-ledger .cg-fore-alert {display:inline-flex;align-items:center;gap:5px;margin:0;padding:3px 9px;border-radius:7px;font-size:11px;line-height:1.6;}
.cuigengji .cg-fore-ledger .cg-fore-alert::before {content:'';flex:none;width:5px;height:5px;border-radius:50%;background:currentColor;}
.cuigengji .cg-fore-ledger .cg-fore-alert[data-kind=due] {border:1px solid color-mix(in srgb,var(--fore-developing) 28%,transparent);background:color-mix(in srgb,var(--fore-developing) 10%,transparent);color:var(--fore-developing);}
.cuigengji .cg-fore-ledger .cg-fore-alert[data-kind=review] {border:1px solid color-mix(in srgb,var(--fore-planted) 28%,transparent);background:color-mix(in srgb,var(--fore-planted) 10%,transparent);color:var(--fore-planted);}
.cuigengji .cg-fore-ledger .cg-fore-alert[data-kind=abandon] {border:1px dashed color-mix(in srgb,var(--cg-muted) 32%,var(--cg-line));background:color-mix(in srgb,var(--cg-muted) 8%,transparent);color:var(--cg-muted);}
.cuigengji .cg-fore-ledger .cg-fore-track {display:grid;grid-template-columns:repeat(3,minmax(0,1fr));align-items:start;padding:2px 12px 6px;}
.cuigengji .cg-fore-ledger .cg-fore-stage {--stage:var(--cg-muted);display:flex;flex-direction:column;min-width:0;}
.cuigengji .cg-fore-ledger .cg-fore-stage[data-stage=plant] {--stage:var(--fore-planted);}
.cuigengji .cg-fore-ledger .cg-fore-stage[data-stage=progress] {--stage:var(--fore-developing);}
.cuigengji .cg-fore-ledger .cg-fore-stage[data-stage=recover] {--stage:var(--fore-recovered);}
.cuigengji .cg-fore-ledger .cg-fore-rail {position:relative;display:flex;align-items:center;justify-content:center;height:34px;}
.cuigengji .cg-fore-ledger .cg-fore-rail::before,.cuigengji .cg-fore-ledger .cg-fore-rail::after {content:'';position:absolute;top:16px;width:50%;height:2px;border-radius:2px;background:var(--fore-rail);transition:background 200ms;}
.cuigengji .cg-fore-ledger .cg-fore-rail::before {left:0;}
.cuigengji .cg-fore-ledger .cg-fore-rail::after {left:50%;}
.cuigengji .cg-fore-ledger .cg-fore-stage[data-first=true] .cg-fore-rail::before {display:none;}
.cuigengji .cg-fore-ledger .cg-fore-stage[data-last=true] .cg-fore-rail::after {display:none;}
.cuigengji .cg-fore-ledger .cg-fore-stage[data-left=on] .cg-fore-rail::before {background:var(--stage);}
.cuigengji .cg-fore-ledger .cg-fore-stage[data-right=on] .cg-fore-rail::after {background:var(--stage);}
.cuigengji .cg-fore-ledger .cg-fore-dot {position:relative;z-index:1;display:grid;place-items:center;width:30px;height:30px;border:2px solid var(--cg-line);border-radius:50%;background:var(--cg-paper);color:var(--cg-muted);font-size:12px;font-weight:600;font-variant-numeric:tabular-nums;transition:border-color 200ms,background 200ms,color 200ms,box-shadow 200ms;}
.cuigengji .cg-fore-ledger .cg-fore-stage[data-state=done] .cg-fore-dot {border-color:var(--stage);background:var(--stage);color:var(--dsw-alias-label-on-color,#fff);}
.cuigengji .cg-fore-ledger .cg-fore-stage[data-state=current] .cg-fore-dot {border-color:var(--stage);background:color-mix(in srgb,var(--stage) 14%,var(--cg-paper));color:var(--stage);animation:cg-fore-pulse 2.6s ease-in-out infinite;}
.cuigengji .cg-fore-ledger .cg-fore-stage[data-state=next] .cg-fore-dot {border-style:dashed;border-color:color-mix(in srgb,var(--stage) 60%,var(--cg-line));background:color-mix(in srgb,var(--stage) 5%,var(--cg-paper));color:var(--stage);}
.cuigengji .cg-fore-ledger .cg-fore-stage[data-state=todo] .cg-fore-dot {border-style:dashed;border-color:color-mix(in srgb,var(--cg-muted) 38%,var(--cg-line));}
@keyframes cg-fore-pulse {0%,100% {box-shadow:0 0 0 4px color-mix(in srgb,var(--stage) 13%,transparent);}50% {box-shadow:0 0 0 7px color-mix(in srgb,var(--stage) 6%,transparent);}}
.cuigengji .cg-fore-ledger .cg-fore-stage-body {display:flex;flex-direction:column;gap:8px;min-width:0;padding:6px 6px 0;}
.cuigengji .cg-fore-ledger .cg-fore-stage-title {display:flex;align-items:center;justify-content:center;gap:6px;font-size:12px;font-weight:650;letter-spacing:.02em;color:var(--cg-muted);}
.cuigengji .cg-fore-ledger .cg-fore-stage[data-state=done] .cg-fore-stage-title,.cuigengji .cg-fore-ledger .cg-fore-stage[data-state=current] .cg-fore-stage-title,.cuigengji .cg-fore-ledger .cg-fore-stage[data-state=next] .cg-fore-stage-title {color:var(--stage);}
.cuigengji .cg-fore-ledger .cg-fore-stage-count {padding:1px 6px;border-radius:10px;background:color-mix(in srgb,var(--stage) 13%,transparent);color:var(--stage);font-size:10px;font-weight:600;}
.cuigengji .cg-fore-ledger .cg-fore-evidence {display:flex;flex-wrap:wrap;gap:4px;justify-content:center;}
.cuigengji .cg-fore-ledger .cg-fore-evidence button {max-width:100%;min-height:20px;padding:1px 7px;border:1px solid var(--cg-line);border-radius:10px;background:color-mix(in srgb,var(--cg-ink) 2%,var(--cg-paper));color:var(--cg-muted);font-size:10px;line-height:1.5;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.cuigengji .cg-fore-ledger .cg-fore-evidence button:not(:disabled):hover {border-color:color-mix(in srgb,var(--stage) 38%,var(--cg-line));background:color-mix(in srgb,var(--stage) 8%,var(--cg-paper));color:var(--stage);}
.cuigengji .cg-fore-ledger .cg-fore-evidence button[data-kind=target] {border-style:dashed;}
.cuigengji .cg-fore-ledger .cg-fore-plan-list {display:flex;flex-direction:column;gap:6px;}
.cuigengji .cg-fore-ledger .cg-fore-plan {display:flex;flex-direction:column;align-items:flex-start;gap:3px;width:100%;min-width:0;padding:8px 10px;border:1px solid var(--cg-line);border-radius:9px;background:color-mix(in srgb,var(--stage) 4%,var(--cg-paper));color:var(--cg-ink);font-size:12px;line-height:1.5;text-align:left;transition:border-color 120ms,background 120ms,box-shadow 120ms,transform 120ms;}
.cuigengji .cg-fore-ledger .cg-fore-plan:not(:disabled):hover {border-color:color-mix(in srgb,var(--stage) 45%,var(--cg-line));background:color-mix(in srgb,var(--stage) 9%,var(--cg-paper));box-shadow:0 4px 12px var(--cg-shadow);transform:translateY(-1px);}
.cuigengji .cg-fore-ledger .cg-fore-plan:disabled {opacity:1;cursor:default;}
.cuigengji .cg-fore-ledger .cg-fore-plan-top {display:flex;align-items:baseline;gap:6px;width:100%;min-width:0;}
.cuigengji .cg-fore-ledger .cg-fore-plan-title {flex:1;min-width:0;font-size:12px;font-weight:600;overflow-wrap:anywhere;}
.cuigengji .cg-fore-ledger .cg-fore-plan-status {flex:none;padding:0 5px;border-radius:8px;background:color-mix(in srgb,var(--cg-muted) 13%,transparent);color:var(--cg-muted);font-size:10px;white-space:nowrap;}
.cuigengji .cg-fore-ledger .cg-fore-plan-status[data-state=selected] {background:color-mix(in srgb,var(--cg-accent) 13%,transparent);color:var(--cg-accent);}
.cuigengji .cg-fore-ledger .cg-fore-plan-status[data-state=written] {background:color-mix(in srgb,var(--fore-recovered) 13%,transparent);color:var(--fore-recovered);}
.cuigengji .cg-fore-ledger .cg-fore-plan-status[data-state=dropped] {opacity:.7;text-decoration:line-through;}
.cuigengji .cg-fore-ledger .cg-fore-plan-meta {font-size:10px;color:var(--cg-muted);overflow-wrap:anywhere;}
.cuigengji .cg-fore-ledger .cg-fore-plan-summary {display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:11px;line-height:1.6;color:var(--cg-muted);}
.cuigengji .cg-fore-ledger .cg-fore-stage-empty {margin:0;padding:10px 8px;border:1px dashed color-mix(in srgb,var(--cg-muted) 30%,var(--cg-line));border-radius:9px;background:color-mix(in srgb,var(--cg-ink) 1.5%,var(--cg-paper));color:var(--cg-muted);font-size:11px;line-height:1.6;text-align:center;}
.cuigengji .cg-fore-ledger .cg-fore-note {margin:12px 16px 14px;padding:10px 12px;border:1px solid var(--cg-line);border-left:2px solid color-mix(in srgb,var(--state-color) 45%,var(--cg-line));border-radius:10px;background:color-mix(in srgb,var(--cg-ink) 3%,var(--cg-paper));}
.cuigengji .cg-fore-ledger .cg-fore-note-body .markdown-reading {font-size:12px;line-height:1.8;color:var(--cg-muted);}
.cuigengji .cg-fore-ledger .cg-fore-note-body .markdown-reading > :first-child {margin-top:0;}
.cuigengji .cg-fore-ledger .cg-fore-note-body .markdown-reading > :last-child {margin-bottom:0;}
.cuigengji .cg-fore-ledger .cg-fore-note[data-open=false] .cg-fore-note-body {max-height:5em;overflow:hidden;mask-image:linear-gradient(180deg,#000 52%,transparent);}
.cuigengji .cg-fore-ledger .cg-fore-note-toggle {margin-top:4px;min-height:0;padding:2px 0;border:0;background:none;color:var(--cg-accent);font-size:11px;}
.cuigengji .cg-fore-ledger .cg-fore-empty {display:flex;flex-direction:column;align-items:center;gap:8px;padding:48px 20px;border:1px dashed color-mix(in srgb,var(--cg-muted) 32%,var(--cg-line));border-radius:14px;background:color-mix(in srgb,var(--cg-ink) 2%,var(--cg-paper));color:var(--cg-muted);text-align:center;}
.cuigengji .cg-fore-ledger .cg-fore-empty .app-icon {width:26px;height:26px;color:color-mix(in srgb,var(--cg-accent) 55%,var(--cg-muted));}
.cuigengji .cg-fore-ledger .cg-fore-empty strong {color:var(--cg-ink);font-size:13px;font-weight:600;}
.cuigengji .cg-fore-ledger .cg-fore-empty p {margin:0;font-size:12px;line-height:1.8;}
@container(max-width:480px){${narrowRules}}
@media(max-width:480px){${narrowRules}}
`;
