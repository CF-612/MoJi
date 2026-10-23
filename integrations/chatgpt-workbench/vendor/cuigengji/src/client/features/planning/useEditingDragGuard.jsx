import {useEffect, useRef} from 'react';
import {observeEditingDrag} from './editing-drag-guard.mjs';

/** Call before card movement starts; a click alone never produces a warning. */
export function useEditingDragGuard({editing, draggedRef, notify}) {
  const cleanup = useRef(null);
  useEffect(() => {
    if (!editing) { cleanup.current?.(); cleanup.current = null; }
    return () => { cleanup.current?.(); cleanup.current = null; };
  }, [editing]);
  return {
    begin(event) {
      if (!editing) return false;
      if (event.button !== 0) return true;
      event.preventDefault(); // Keep focus and text selection in the editor.
      event.stopPropagation();
      cleanup.current?.();
      draggedRef.current = false;
      cleanup.current = observeEditingDrag({pointerId:event.pointerId, clientX:event.clientX, clientY:event.clientY}, {
        target:event.currentTarget.ownerDocument,
        onAttempt:message => { draggedRef.current = true; notify(message); },
      });
      return true;
    },
  };
}
