//
// Common UI components for a modern/minimalistic light theme.
//

import React from 'react';

// PUBLIC_INTERFACE
export function Modal({ open, title, onClose, children, wide = false }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content${wide ? ' wide' : ''}`} onClick={e => e.stopPropagation()}>
        <header className="modal-header">
          <span className="modal-title">{title}</span>
          <button aria-label="Close dialog" className="modal-close" onClick={onClose}>×</button>
        </header>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
export function Input({ label, ...props }) {
  return (
    <label className="input-label">
      {label}
      <input className="styled-input" {...props} />
    </label>
  );
}

// PUBLIC_INTERFACE
export function Button({ children, ...props }) {
  return (
    <button className="btn-modern" {...props}>
      {children}
    </button>
  );
}

// PUBLIC_INTERFACE
export function Spinner() {
  return <div className="spinner"></div>;
}

// PUBLIC_INTERFACE
export function ErrorMsg({ message }) {
  if (!message) return null;
  return <div className="error-message">{message}</div>;
}
