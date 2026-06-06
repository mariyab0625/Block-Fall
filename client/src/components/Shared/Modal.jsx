import React from 'react';
import '../../styles/neon-theme.css';

/**
 * Modal — shared backdrop + box + close button wrapper.
 *
 * Props:
 *   onClose     fn       — called when backdrop or close button is clicked
 *   className   string   — extra class applied to the inner .modal-box
 *   children    node
 */
export default function Modal({ onClose, className = '', children }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={`modal-box ${className}`}
        onClick={e => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        {children}
      </div>
    </div>
  );
}
