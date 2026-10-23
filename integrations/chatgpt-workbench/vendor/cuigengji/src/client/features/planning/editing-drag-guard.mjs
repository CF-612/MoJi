export const editingDragMessage = '请先保存或取消编辑，再移动卡片';

/** Observe a blocked gesture without changing selection, drafts or placement. */
export function observeEditingDrag(start, {target, onAttempt, threshold = 5}) {
  let reported = false;
  const move = event => {
    if (event.pointerId !== start.pointerId || reported) return;
    if (Math.hypot(event.clientX - start.clientX, event.clientY - start.clientY) < threshold) return;
    reported = true;
    onAttempt(editingDragMessage);
  };
  const end = event => {
    if (event.pointerId === start.pointerId) cleanup();
  };
  const cleanup = () => {
    target.removeEventListener('pointermove', move);
    target.removeEventListener('pointerup', end);
    target.removeEventListener('pointercancel', end);
    target.defaultView?.removeEventListener('blur', cleanup);
  };
  target.addEventListener('pointermove', move);
  target.addEventListener('pointerup', end);
  target.addEventListener('pointercancel', end);
  target.defaultView?.addEventListener('blur', cleanup);
  return cleanup;
}
