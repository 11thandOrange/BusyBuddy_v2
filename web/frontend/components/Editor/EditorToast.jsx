import React from 'react';

/**
 * EditorToast - visible replacement for the old (silently no-op) App Bridge
 * toast calls. Renders nothing when there's no active toast.
 *
 * @param {{message: string, tone: 'success'|'error', id: number}|null} toast
 */
export function EditorToast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`editor-toast editor-toast-${toast.tone}`} role="status" key={toast.id}>
      {toast.message}
    </div>
  );
}

export default EditorToast;
