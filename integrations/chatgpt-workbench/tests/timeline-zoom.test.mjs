import test from 'node:test';
import assert from 'node:assert/strict';
import {timelineVerticalScale, timelineVerticalMetrics, scaleStoryLayout, timelineYToView, timelineYFromView} from '../vendor/cuigengji/src/client/features/planning/timeline-zoom.mjs';

const track = Object.freeze({id: 'track-a'});
const layout = Object.freeze({line: 252, height: 510, lanes: Object.freeze([
 Object.freeze({id: 'above', track, y: 0, height: 222}),
 Object.freeze({id: 'below', track, y: 322, height: 158}),
])});

test('zoom shrinks lane and card dimensions together and reveals more rows', () => {
 let previous;
 for (const relativeZoom of [1 / 16, .25, .5, 1, 2, 4]) {
  const scale = timelineVerticalScale(relativeZoom), scaled = scaleStoryLayout(layout, scale);
  assert.ok(scaled.cardHeight < scaled.rowHeight);
  assert.ok(scaled.lanes[0].y + scaled.lanes[0].height < scaled.line);
  assert.ok(scaled.line < scaled.lanes[1].y);
  assert.ok(scaled.lanes[1].y + scaled.lanes[1].height <= scaled.height);
  // Three rows in the first lane, two in the second; every card fits its lane.
  for (const [index, count] of [3, 2].entries()) {
   assert.ok(scaled.cardInset + (count - 1) * scaled.rowHeight + scaled.cardHeight <= scaled.lanes[index].height);
  }
  if (previous) for (const key of ['height', 'rowHeight', 'cardHeight']) assert.ok(scaled[key] > previous[key]);
  previous = scaled;
 }
 assert.equal(scaleStoryLayout(layout, timelineVerticalScale(1 / 16)).height, layout.height / 4);
 assert.equal(layout.lanes[0].height, 222);
 assert.equal(scaleStoryLayout(layout, .5).lanes[0].track, track);
 assert.notEqual(scaleStoryLayout(layout, 1).lanes[0], layout.lanes[0]);
});

test('view and model y are exact inverses for dragging after zoom and centering', () => {
 for (const scale of [.125, .25, .5, 1, 2]) for (const offset of [0, 37.5, 150]) for (const y of [-20, 0, 26, 90, 154, 207.25]) {
  assert.equal(timelineYFromView(timelineYToView(y, scale, offset), scale, offset), y);
  const scaled = scaleStoryLayout(layout, scale), row = 2;
  const cardY = offset + scaled.lanes[0].y + scaled.cardInset + row * scaled.rowHeight;
  assert.equal(Math.floor((cardY - offset - scaled.lanes[0].y - scaled.cardInset) / scaled.rowHeight), row);
 }
});

test('narrative card positions and snap rows use the same scaled geometry', () => {
 for (const relativeZoom of [.2, .4, 1, 2]) {
  const geometry = timelineVerticalMetrics(timelineVerticalScale(relativeZoom));
  assert.ok(geometry.cardHeight < geometry.rowHeight);
  assert.ok(geometry.cardInset + geometry.cardHeight <= geometry.minHeight);
  for (let row = 0; row < 8; row++) {
   const y = geometry.cardInset + row * geometry.rowHeight;
   assert.equal(Math.round((y - geometry.cardInset) / geometry.rowHeight), row);
  }
 }
});

test('invalid and extreme zoom inputs remain finite and invertible', () => {
 for (const input of [NaN, Infinity, -1, 0, undefined]) assert.equal(timelineVerticalScale(input), 1);
 assert.equal(timelineVerticalScale(Number.MIN_VALUE), .125);
 assert.equal(timelineVerticalScale(Number.MAX_VALUE), 2);
 assert.equal(timelineYFromView(timelineYToView(123, 0), 0), 123);
 assert.equal(scaleStoryLayout(null, .5), null);
});

test('unscaled ruler and many marker rows remain clear of scaled below lanes', () => {
 for (const markerRows of [0, 1, 4, 12]) {
  const markerSpace = markerRows ? (markerRows - 1) * 34 + 12 : 0;
  const rulerClearance = 70 + markerSpace;
  const source = {line: 252, height: 510 + markerSpace, lanes: [
   {id: 'above', side: 'above', y: 0, height: 222},
   {id: 'below-a', side: 'below', y: 322 + markerSpace, height: 64},
   {id: 'below-b', side: 'below', y: 386 + markerSpace, height: 90},
  ]};
  for (const scale of [.125, .25, .5, 1, 2]) {
   const result = scaleStoryLayout(source, scale, {rulerClearance});
   const [above, below, next] = result.lanes;
   assert.equal(below.y - result.line, rulerClearance * Math.max(1, scale));
   assert.equal(next.y - below.y, below.height);
   assert.ok(next.y + next.height <= result.height);
   assert.equal(above.height, source.lanes[0].height * scale);
   if (markerRows) {
    const lastMarkerBottom = result.line + 37 + (markerRows - 1) * 34 + 44;
    assert.ok(lastMarkerBottom < below.y, 'even a 44px coarse-pointer marker stays above lanes');
   }
   // Snap with actual translated lane geometry, not a global inverse scale.
   const row = 2, y = next.y + result.cardInset + row * result.rowHeight;
   assert.equal(Math.round((y - next.y - result.cardInset) / result.rowHeight), row);
  }
  assert.equal(source.lanes[1].y, 322 + markerSpace);
 }
});

test('fixed origin above the ruler clears scaled cards while lower markers remain clear', () => {
 const source = {line: 252, height: 510, lanes: [
  {id: 'above', side: 'above', y: 0, height: 222},
  {id: 'below', side: 'below', y: 322, height: 158},
 ]};
 for (const scale of [.125, .25, .5, 1, 2]) {
  const result = scaleStoryLayout(source, scale, {rulerClearance: 70, upperRulerClearance: 46});
  const [above, below] = result.lanes;
  const lastCardBottom = above.y + result.cardInset + 2 * result.rowHeight + result.cardHeight;
  assert.equal(result.line - lastCardBottom, 46 * Math.max(1, scale));
  assert.ok(lastCardBottom < result.line - 43, 'origin top stays below final above card');
  assert.equal(below.y - result.line, 70 * Math.max(1, scale));
  assert.ok(below.y + below.height <= result.height);
  assert.equal(above.y, source.lanes[0].y * scale);
  assert.equal(result.height, source.height * scale + 116 * Math.max(0, 1 - scale));
 }
});
