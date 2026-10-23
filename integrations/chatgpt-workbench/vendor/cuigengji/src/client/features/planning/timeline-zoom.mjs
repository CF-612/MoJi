// Scale content geometry, not the surrounding toolbar, sidebar or editor.
// A gentler vertical curve keeps titles usable while revealing lower tracks.
export function timelineVerticalScale(relativeZoom = 1) {
 const zoom = Number.isFinite(relativeZoom) && relativeZoom > 0 ? relativeZoom : 1;
 return Math.max(.125, Math.min(2, Math.sqrt(zoom)));
}

function validScale(scale) {
 return Number.isFinite(scale) && scale > 0 ? scale : 1;
}

// offset is a view-space translation (for example, viewport centering). These
// mappings deliberately retain subpixels so dragging does not accumulate drift.
export function timelineYToView(y, scale = 1, offset = 0) {
 return y * validScale(scale) + offset;
}
export function timelineYFromView(y, scale = 1, offset = 0) {
 return (y - offset) / validScale(scale);
}

export function timelineVerticalMetrics(scale = 1, {rowHeight = 58, cardHeight = 42, cardInset = 36, minHeight = 120} = {}) {
 scale = validScale(scale);
 return {scale, rowHeight: rowHeight * scale, cardHeight: cardHeight * scale, cardInset: cardInset * scale, minHeight: minHeight * scale};
}

// Return fresh geometry only; track/card model references are never edited.
// Apply before viewport centering so any centering offset remains in pixels.
export function scaleStoryLayout(layout, scale = 1, {rulerClearance = 0, upperRulerClearance = 0} = {}) {
 if (!layout) return layout;
 scale = validScale(scale);
 // Ruler labels and marker buttons retain their font/control size. Preserve
 // their reserved band while zooming out, without imposing lane/card minima.
 const clearance = Number.isFinite(rulerClearance) ? Math.max(0, rulerClearance) : 0;
 const upperClearance = Number.isFinite(upperRulerClearance) ? Math.max(0, upperRulerClearance) : 0;
 const upperOffset = upperClearance * Math.max(0, 1 - scale);
 const belowOffset = clearance * Math.max(0, 1 - scale) + upperOffset;
 return {
  ...layout,
  ...timelineVerticalMetrics(scale, {rowHeight: 64, cardHeight: 42, cardInset: 36, minHeight: 320}),
  line: layout.line * scale + upperOffset,
  height: layout.height * scale + belowOffset,
  lanes: layout.lanes.map(lane => ({...lane, y: lane.y * scale + (lane.side === 'below' ? belowOffset : 0), height: lane.height * scale})),
 };
}
