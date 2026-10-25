// Shared capability contract. Actor policy remains in the host and Store.
export const isReadAction = action => action==='writing.review.preview'||/\.(get|read|list|groups|pages|decorations|history|search|changes|handoff|candidates)$/.test(action);
export const changesProse = (action, args) => ['chapter.restore', 'chapter.delete','writing.prose.replace'].includes(action)
  || (action === 'volume.delete' && args.chapterPolicy === 'delete')
  || (['chapter.create', 'chapter.update'].includes(action)
    && ['content', 'append', 'patch'].some(key => args[key] !== undefined));
export const TOOL_ACTIONS = Object.freeze({
  moji_structure: Object.freeze(['writing.search','writing.review.preview','writing.review.submit','writing.review.list','writing.review.get','writing.review.apply','writing.review.dismiss','writing.board.get','writing.stage.get','writing.card.create','writing.organizations.list','writing.cardRelations.get','writing.affiliation.set','writing.relationship.create','writing.relationship.list','writing.relationshipType.list','writing.relationshipType.create','writing.relationshipType.update','writing.relationshipType.delete','writing.fields.list','writing.field.create','writing.field.update','writing.card.get','writing.card.update','writing.link.list','writing.link.candidates','writing.link.create','writing.link.delete','writing.stats.get','writing.goal.set','writing.foreshadow.list','writing.foreshadow.get','writing.foreshadow.create','writing.foreshadow.update','writing.history','writing.restore','writing_context.get']),
  moji_project: Object.freeze(['novel.get','novel.handoff','volume.list','volume.create','volume.update','volume.delete','chapter.list','chapter.search','chapter.create','chapter.get','chapter.update','chapter.delete','chapter.history','chapter.restore']),
  moji_memory: Object.freeze(['graph.list','graph.get','graph.groups','graph.group.create','graph.group.update','graph.group.delete','graph.move','graph.layout','graph.continue','graph.duplicate','graph.remove','graph.create','graph.update','graph.delete','edge.list','edge.get','edge.create','edge.update','edge.delete','edge.disconnect']),
  moji_plan: Object.freeze(['story.get','story.apply']),
  moji_context: Object.freeze(['context.get','binding.get','preset.read']),
});
export const MEMORY_ACTIONS = Object.freeze([...TOOL_ACTIONS.moji_memory, 'context.get']);
export const HUMAN_ACTIONS = Object.freeze([...new Set([
  ...Object.values(TOOL_ACTIONS).flat(), 'novel.list','novel.create','novel.import',
  'novel.export','novel.update','novel.archive','binding.set','settings.get','legacy.preview','tavern.preview','tavern.import',
  'preset.get','preset.preview','preset.set',
  // Author-only, read-only access to retained upstream planning archives.
  'planning.list','planning.get','planning.pages','planning.groups','planning.decorations',
  'story.selection.apply','story.foreshadow.save','story.backup','story.restore','story.undo','story.redo','graph.history','graph.restore','writing.prose.search','writing.prose.replace','writing.selection.apply','chapter.move','timeline.layout.get','timeline.layout.save',
  'workspace.status','workspace.export','workspace.preview','workspace.import',
  'transfer.catalog','transfer.inspect','transfer.preview','transfer.import','transfer.exportPreview','transfer.export',
  'maintenance.status','maintenance.verify',
])]);
