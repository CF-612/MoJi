/** Cast avatars on scene cards and the search-based cast picker. Positioning stays with the host card. */
export const castStyles = `
.cuigengji .cast-avatars {display:inline-flex;align-items:center;max-width:100%;min-width:0;flex:none;}
.cuigengji .cast-avatar {position:relative;flex:none;display:inline-flex;padding:0;border:0;background:transparent;min-height:0;line-height:1;border-radius:50%;overflow:hidden;cursor:pointer;touch-action:manipulation;}
.cuigengji .cast-avatars .cast-avatar + .cast-avatar {margin-left:-8px;}
.cuigengji .cast-avatar:hover,.cuigengji .cast-avatar:focus-visible {z-index:2;}
.cuigengji .cast-face {flex:none;display:grid;place-items:center;width:28px;height:28px;border-radius:50%;overflow:hidden;background:var(--cg-wash);color:var(--cg-accent);font-size:12px;line-height:1;font-weight:600;text-transform:uppercase;}
.cuigengji .cast-avatars .cast-face {border:1.5px solid var(--cg-paper);transition:border-color 120ms;}
.cuigengji .cast-face.is-sm {width:20px;height:20px;font-size:10px;font-weight:500;}
.cuigengji .cast-face img {width:100%;height:100%;object-fit:cover;display:block;}
.cuigengji .cast-avatar:hover .cast-face {border-color:var(--cg-accent);}
.cuigengji .cast-avatars.size-sm .cast-face {width:22px;height:22px;font-size:10px;}
.cuigengji .cast-avatars.size-sm .cast-avatar + .cast-avatar {margin-left:-6px;}
.cuigengji .cast-avatar.cast-more {display:grid;place-items:center;width:28px;height:28px;border:1.5px solid var(--cg-line);border-radius:50%;background:var(--cg-paper);color:var(--cg-muted);font-size:10px;font-variant-numeric:tabular-nums;letter-spacing:-.3px;}
.cuigengji .cast-avatars.size-sm .cast-avatar.cast-more {width:22px;height:22px;font-size:9px;}
.cuigengji .cast-avatar.cast-more:hover,.cuigengji .cast-avatar.cast-more:focus-visible {border-color:var(--cg-accent);color:var(--cg-accent);}
.cuigengji .cast-tone.tone-0 {background:light-dark(#e2ecff,#2d4059);color:light-dark(#2b4c86,#c6dbff);}
.cuigengji .cast-tone.tone-1 {background:light-dark(#ffeeda,#4b3a28);color:light-dark(#8a5420,#ffd9a8);}
.cuigengji .cast-tone.tone-2 {background:light-dark(#e0f3e6,#28402f);color:light-dark(#1f6b45,#bfe6cf);}
.cuigengji .cast-tone.tone-3 {background:light-dark(#fde6ef,#46283a);color:light-dark(#8d3760,#ffc8de);}
.cuigengji .cast-tone.tone-4 {background:light-dark(#e8e6ff,#33304f);color:light-dark(#4b41a8,#d3ccff);}
.cuigengji .cast-tone.tone-5 {background:light-dark(#e0f5f4,#26403e);color:light-dark(#166f68,#b6e7e2);}
.cuigengji .cast-tone.tone-6 {background:light-dark(#fdf0d8,#483a22);color:light-dark(#7d5a12,#f5ddaa);}
.cuigengji .cast-tone.tone-7 {background:light-dark(#ecf0f6,#2f3a46);color:light-dark(#3f5364,#cbd8e6);}
.cuigengji .cast-picker {display:flex;flex-direction:column;gap:9px;min-width:0;max-width:100%;margin:10px 0;}
.cuigengji .cast-picker .cast-search {width:100%;min-height:36px;margin:0;padding:7px 10px;border:1px solid var(--cg-line);border-radius:7px;background:var(--cg-paper);font-size:12px;}
.cuigengji .cast-selected {display:flex;flex-wrap:wrap;align-items:center;gap:6px;min-width:0;}
.cuigengji .cast-pill {display:inline-flex;align-items:center;gap:5px;min-width:0;max-width:100%;padding:2px 3px 2px 2px;border:1px solid var(--cg-line);border-radius:999px;background:var(--cg-paper);}
.cuigengji .cast-pill .cast-face {border:0;box-shadow:0 0 0 1px color-mix(in srgb,var(--cg-line) 70%,transparent);}
.cuigengji .cast-pill-name {min-width:0;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;font-weight:500;color:var(--cg-ink);}
.cuigengji .cast-pill button.cast-pill-name {border:0;background:transparent;padding:0 2px;min-height:0;line-height:1.5;text-align:left;cursor:pointer;}
.cuigengji .cast-pill button.cast-pill-name:hover {color:var(--cg-accent);text-decoration:underline;}
.cuigengji .cast-kind {flex:none;border:0;border-radius:999px;padding:2px 8px;min-height:22px;font-size:10px;line-height:1.5;background:var(--cg-wash);color:var(--cg-accent);cursor:pointer;white-space:nowrap;}
.cuigengji .cast-kind.kind-mention {background:color-mix(in srgb,var(--cg-muted) 14%,var(--cg-paper));color:var(--cg-muted);}
.cuigengji .cast-pill .cast-kind:hover {background:color-mix(in srgb,var(--cg-accent) 16%,var(--cg-paper));}
.cuigengji .cast-remove {flex:none;border:0;background:transparent;color:var(--cg-muted);font-size:14px;line-height:1;padding:2px 6px;min-width:22px;min-height:22px;cursor:pointer;}
.cuigengji .cast-remove:hover {color:var(--cg-orange);}
.cuigengji .cast-candidates {display:flex;flex-direction:column;gap:1px;max-height:180px;overflow:auto;overscroll-behavior:contain;scrollbar-width:thin;padding:3px;border:1px solid var(--cg-line);border-radius:8px;background:var(--cg-paper);}
.cuigengji .cast-candidates.is-empty {padding:0;border:0;background:transparent;}
.cuigengji .cast-candidate {display:flex;align-items:center;gap:8px;width:100%;min-height:34px;padding:4px 7px;border:0;border-radius:6px;background:transparent;text-align:left;white-space:normal;cursor:pointer;}
.cuigengji .cast-candidates button.cast-candidate:hover {background:var(--cg-wash);}
.cuigengji .cast-candidate-name {flex:1;min-width:0;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.cuigengji .cast-candidate small {flex:none;font-size:10px;color:var(--cg-muted);}
.cuigengji .cast-empty {margin:0;font-size:11px;line-height:1.6;color:var(--cg-muted);}
@container(max-width:480px) {
 .cuigengji .cast-avatars.size-md .cast-face {width:22px;height:22px;font-size:10px;}
 .cuigengji .cast-avatars.size-md .cast-avatar + .cast-avatar {margin-left:-6px;}
 .cuigengji .cast-avatars.size-md .cast-avatar.cast-more {width:22px;height:22px;font-size:9px;}
 .cuigengji .cast-avatar.cast-more {letter-spacing:0;}
 .cuigengji .cast-pill-name {max-width:104px;}
 .cuigengji .cast-candidates {max-height:160px;}
}
@media(max-width:480px) {
 .cuigengji .cast-avatars.size-md .cast-face {width:22px;height:22px;font-size:10px;}
 .cuigengji .cast-avatars.size-md .cast-avatar + .cast-avatar {margin-left:-6px;}
 .cuigengji .cast-avatars.size-md .cast-avatar.cast-more {width:22px;height:22px;font-size:9px;}
 .cuigengji .cast-avatar.cast-more {letter-spacing:0;}
 .cuigengji .cast-pill-name {max-width:104px;}
 .cuigengji .cast-candidates {max-height:160px;}
}
@media(prefers-reduced-motion:reduce) {.cuigengji .cast-avatars .cast-face {transition:none;}}
.cuigengji[data-motion=reduce] .cast-avatars .cast-face {transition:none;}
/* 剧情卡：头像组常驻右上角。卡片不再放齿轮按钮（桌面右键、手机长按打开菜单），
   把整个右上角留给头像，并放大、加白边与投影，保证与卡片底色区分开。 */
.cuigengji .scene-card .cast-avatars {position:absolute;right:10px;top:8px;z-index:4;filter:drop-shadow(0 1px 2px rgba(0,0,0,.22));}
.cuigengji .scene-card .cast-avatars .cast-avatar + .cast-avatar {margin-left:-9px;}
.cuigengji .scene-card .cast-avatars.size-sm .cast-face {width:28px;height:28px;border-width:2px;font-size:12px;font-weight:700;box-shadow:inset 0 0 0 1px rgba(0,0,0,.10);}
.cuigengji .scene-card .cast-avatars.size-sm .cast-avatar.cast-more {width:28px;height:28px;font-size:10px;border-width:2px;}
.cuigengji .scene-card .planning-title {padding-right:88px;}
.cuigengji .scene-card .scene-card-footer {padding-right:2px;}
.cuigengji .cast-list-modal {display:flex;flex-direction:column;gap:2px;max-height:60vh;overflow:auto;}
.cuigengji .cast-list-row {display:flex;align-items:center;gap:9px;width:100%;padding:6px 8px;border:0;border-radius:8px;background:transparent;text-align:left;cursor:pointer;}
.cuigengji .cast-list-row:hover {background:var(--cg-wash);}
.cuigengji .cast-list-row .cast-face {width:32px;height:32px;font-size:14px;}
.cuigengji .cast-list-row strong {flex:1;min-width:0;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.cuigengji .cast-list-row small {flex:none;color:var(--cg-muted);font-size:11px;}
/* 事件／规划等关联资料：与人物选择器一致的头像胶囊 + 搜索即添加。 */
.cuigengji .pick-refs {display:flex;flex-direction:column;gap:8px;margin:10px 0;padding:12px;border:1px solid var(--cg-line);border-radius:10px;background:var(--cg-paper);}
.cuigengji .pick-refs header {display:flex;align-items:baseline;justify-content:space-between;gap:10px;}
.cuigengji .pick-refs header h3 {margin:0;font-size:13px;font-weight:600;}
.cuigengji .pick-refs header small {color:var(--cg-muted);font-size:11px;}
.cuigengji .pick-refs-chosen {display:flex;flex-wrap:wrap;align-items:center;gap:6px;}
.cuigengji .pick-ref-pill {display:inline-flex;align-items:center;gap:6px;min-width:0;padding:3px 4px 3px 3px;border:1px solid color-mix(in srgb,var(--cg-line) 80%,transparent);border-radius:999px;background:var(--cg-wash);}
.cuigengji .pick-ref-face {flex:none;display:grid;place-items:center;width:22px;height:22px;border-radius:50%;overflow:hidden;font-size:11px;font-weight:600;line-height:1;}
.cuigengji .pick-ref-face img {width:100%;height:100%;object-fit:cover;display:block;}
.cuigengji .pick-ref-name {min-width:0;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;}
.cuigengji .pick-ref-pill button {flex:none;border:0;background:transparent;padding:0 4px;min-height:0;min-width:18px;line-height:1;font-size:14px;color:var(--cg-muted);cursor:pointer;}
.cuigengji .pick-ref-pill button:hover {color:var(--cg-orange);}
.cuigengji .pick-refs-search {width:100%;min-height:34px;margin:0;}
.cuigengji .pick-refs-results {display:flex;flex-direction:column;gap:1px;max-height:180px;overflow:auto;padding:3px;border:1px solid var(--cg-line);border-radius:8px;background:var(--cg-paper);}
.cuigengji .pick-refs-results button {display:flex;align-items:center;gap:8px;min-height:32px;padding:4px 7px;border:0;border-radius:6px;background:transparent;text-align:left;cursor:pointer;}
.cuigengji .pick-refs-results button:hover {background:var(--cg-wash);}
.cuigengji .pick-refs-results .muted {margin:6px;font-size:12px;}
.cuigengji .planning-overview.is-outline {overflow:hidden;min-height:0;display:flex;flex-direction:column;}
.cuigengji .planning-overview.is-foreshadow {overflow:auto;min-height:0;display:block;}
`;
