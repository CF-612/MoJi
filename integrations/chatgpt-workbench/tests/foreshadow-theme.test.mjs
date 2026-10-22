import test from 'node:test';
import assert from 'node:assert/strict';
import {foreshadowStyle} from '../vendor/cuigengji/src/client/features/planning/story-foreshadow-style.mjs';
import {studioStyles} from '../vendor/cuigengji/src/client/studio-style.ts';

// Source and palette regressions, not a replacement for browser layout/interaction QA.
const rule = selector => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return foreshadowStyle.match(new RegExp(`${escaped}\\{([^}]+)\\}`))?.[1] || '';
};
const rgb = hex => {
  const raw = hex.slice(1);
  const full = raw.length === 3 ? [...raw].map(value => value + value).join('') : raw;
  return [0, 2, 4].map(at => parseInt(full.slice(at, at + 2), 16));
};
const mix = (tint, percent, base) => base.map((channel, index) => channel * (1 - percent / 100) + tint[index] * percent / 100);
const luminance = color => color.map(channel => {
  const value = channel / 255;
  return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
}).reduce((total, value, index) => total + value * [.2126, .7152, .0722][index], 0);
const contrast = (a, b) => {
  const values = [luminance(a), luminance(b)].sort((a, b) => b - a);
  return (values[0] + .05) / (values[1] + .05);
};
const palettes = ['light', 'dark'].map((name, index) => ({name, ...Object.fromEntries(['paper', 'ink', 'muted', 'wash', 'accent', 'orange'].map(token => {
  const choices = studioStyles.match(new RegExp(`--cg-${token}:light-dark\\((#[a-f\\d]+),(#[a-f\\d]+)\\)`));
  assert.ok(choices, `studio palette defines ${token}`);
  return [token, rgb(choices[index + 1])];
}))}));

// A theme-only fix must cover standalone modal surfaces too, not only descendants of .sf-page.
test('foreshadow page, dialog and linked-card section share real workbench theme tokens', () => {
  const shared = rule('.sf-page,.sf-dialog,.sf-plot-section');
  for (const [alias, token] of [['line', 'line'], ['muted', 'muted'], ['surface', 'paper']]) {
    assert.ok(shared.includes(`--sf-${alias}:var(--cg-${token})`));
  }
  assert.ok(shared.includes('color:var(--cg-ink)'));
  assert.doesNotMatch(foreshadowStyle, /var\(--(?:panel|ink|muted)(?:,|\))/);
  assert.doesNotMatch(foreshadowStyle, /background(?:-color)?:#[a-f\d]+/i);
});

test('search, cards and editor fields no longer fall back to white in dark mode', () => {
  for (const selector of ['.sf-controls>input', '.sf-card', '.sf-form input:not([type=radio]),.sf-form textarea,.sf-form select', '.sf-mode button[aria-pressed=true]']) {
    assert.match(rule(selector), /background:var\(--sf-surface\)/, selector);
  }
  assert.match(rule('.sf-controls>input'), /color:var\(--cg-ink\)/);
  assert.match(rule('.sf-title h3'), /color:var\(--cg-ink\)/);
  assert.match(rule('.sf-controls>input::placeholder'), /color:var\(--sf-muted\);opacity:1/);
  assert.doesNotMatch(rule('.sf-empty-stage'), /opacity:/);
});

test('semantic stage and status labels retain at least 4.5:1 contrast in both studio palettes', () => {
  for (const palette of palettes) {
    assert.ok(contrast(palette.ink, palette.paper) >= 4.5, `${palette.name} body`);
    assert.ok(contrast(palette.muted, palette.paper) >= 4.5, `${palette.name} descriptions`);
    for (const [token, backgroundPercent] of [['stage', 5], ['sf-state', 11]]) {
      const labelMix = foreshadowStyle.match(new RegExp(`--${token}-ink:color-mix\\(in srgb,var\\(--${token}\\) (\\d+)%,var\\(--cg-ink\\)\\)`));
      assert.ok(labelMix, `${token} has a theme-adaptive label color`);
      const hues = [...foreshadowStyle.matchAll(new RegExp(`--${token}:(#[a-f\\d]{6})`, 'g'))].map(match => rgb(match[1]));
      assert.ok(hues.length >= 3);
      for (const hue of hues) {
        const ratio = contrast(mix(hue, Number(labelMix[1]), palette.ink), mix(hue, backgroundPercent, palette.paper));
        assert.ok(ratio >= 4.5, `${palette.name} ${token} label ratio ${ratio.toFixed(2)}`);
      }
    }
  }
  for (const selector of ['.sf-stage h4', '.sf-node-meta', '.sf-node .sf-evidence-link']) {
    assert.match(rule(selector), /color:var\(--stage-ink\)/, selector);
  }
  assert.match(rule('.sf-summary .sf-status'), /color:var\(--sf-state-ink\)/);
});

test('selected filters and review notices remain legible without light-only fills', () => {
  assert.match(rule('.sf-filters button[aria-pressed=true]'), /background:var\(--cg-wash\);color:var\(--sf-accent-ink\)/);
  const accent = foreshadowStyle.match(/--sf-accent-ink:color-mix\(in srgb,var\(--cg-accent\) (\d+)%,var\(--cg-ink\)\)/);
  assert.ok(accent);
  const warning = foreshadowStyle.match(/--sf-warning:color-mix\(in srgb,(#[a-f\d]+) (\d+)%,var\(--cg-ink\)\)/);
  assert.ok(warning);
  for (const palette of palettes) {
    assert.ok(contrast(mix(palette.accent, Number(accent[1]), palette.ink), palette.wash) >= 4.5, `${palette.name} selected filter`);
    const warningInk = mix(rgb(warning[1]), Number(warning[2]), palette.ink);
    assert.ok(contrast(warningInk, mix(palette.orange, 12, palette.paper)) >= 4.5, `${palette.name} warning badge`);
    assert.ok(contrast(warningInk, palette.wash) >= 4.5, `${palette.name} proof help`);
  }
  for (const selector of ['.sf-review', '.sf-review-badge']) {
    assert.match(rule(selector), /color:var\(--sf-warning\)/, selector);
    assert.match(rule(selector), /background:color-mix\(in srgb,var\(--cg-orange\) 12%,var\(--sf-surface\)\)/, selector);
  }
});
