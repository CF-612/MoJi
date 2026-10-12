export const cardLabels = Object.freeze({character:'角色卡',world:'世界书',idea:'讨论中',selected:'准备采用',written:'已写入正文',dropped:'暂不采用'});
export const defaultCardColors = Object.freeze({character:'#8b5cf6',world:'#0d9488',idea:'#3b82f6',selected:'#d97706',written:'#16a34a',dropped:'#a85c6a'});
// Only accept CSS hex colors from stored preferences; old or damaged preferences stay readable.
export function normalizeCardColors(value) {
  return Object.fromEntries(Object.entries(defaultCardColors).map(([key,fallback])=>[key,
    typeof value?.[key]==='string'&&/^#[\da-f]{6}$/i.test(value[key])?value[key].toLowerCase():fallback]));
}
export function cardColorVariables(colors) {
  return Object.fromEntries(Object.entries(normalizeCardColors(colors)).map(([key,value])=>[`--card-${key}`,value]));
}
