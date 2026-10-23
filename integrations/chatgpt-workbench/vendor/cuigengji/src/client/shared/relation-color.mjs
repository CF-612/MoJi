// Shared by the live graph, relationship cards and SVG/PNG export.
export const DEFAULT_RELATION_COLOR='#8a94a6';
export const relationColor=edge=>/^#[\da-f]{6}$/i.test(edge?.relationColor||'')?edge.relationColor:DEFAULT_RELATION_COLOR;
export const relationName=edge=>edge?.typeName||edge?.name||'';
