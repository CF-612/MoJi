import React, {useEffect, useRef, useState} from 'react';

/** Use the textarea's native history, shared with keyboard and system Undo. */
export function ManuscriptHistory({target, content, disabled = false}) {
  const [history, setHistory] = useState({undo: false, redo: false, composing: false});
  const composing = useRef(false);
  useEffect(() => {
    const element = target.current;
    if (!element) return;
    let frame = 0;
    const refresh = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        // Query only this focused editor, never another field's history.
        if (document.activeElement !== element) return;
        setHistory({undo: document.queryCommandEnabled('undo'), redo: document.queryCommandEnabled('redo'), composing: composing.current});
      });
    };
    const start = () => {composing.current = true; setHistory(h => ({...h, composing: true}));};
    const end = () => {composing.current = false; refresh();};
    element.addEventListener('input', refresh);
    element.addEventListener('focus', refresh);
    element.addEventListener('compositionstart', start);
    element.addEventListener('compositionend', end);
    refresh();
    return () => {
      cancelAnimationFrame(frame);
      element.removeEventListener('input', refresh);
      element.removeEventListener('focus', refresh);
      element.removeEventListener('compositionstart', start);
      element.removeEventListener('compositionend', end);
    };
  }, [target, content]);
  const apply = command => {
    const element = target.current;
    if (!element || disabled || history.composing) return;
    element.focus({preventScroll: true});
    // Native input events update the draft through the existing autosave path.
    document.execCommand(command);
    setHistory({undo: document.queryCommandEnabled('undo'), redo: document.queryCommandEnabled('redo'), composing: false});
  };
  return <span className="manuscript-history" role="group" aria-label="正文撤销与重做">
    {['undo', 'redo'].map(command => <button key={command} type="button" className="icon-button"
      aria-label={command === 'undo' ? '撤销正文' : '重做正文'} title={command === 'undo' ? '撤销正文' : '重做正文'}
      disabled={disabled || history.composing || !history[command]}
      onPointerDown={event => event.preventDefault()} onClick={() => apply(command)}>
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={command === 'redo' ? {transform: 'scaleX(-1)'} : undefined}>
        <path d="M9 5 4 10l5 5M4 10h10a6 6 0 0 1 0 12"/>
      </svg>
    </button>)}
  </span>;
}
