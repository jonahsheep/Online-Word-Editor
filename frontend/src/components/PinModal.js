import React, { memo } from "react";

const PinModal = memo(function PinModal({ pin, expiryTime, onClose }) {
  if (!pin) return null;

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Document Saved!</h2>
        <p>Use this PIN to access your document:</p>
        <div className="pin-display">{pin}</div>
        {expiryTime && (
          <p className="pin-expiry">
            Expires at: {expiryTime.toLocaleTimeString()}
          </p>
        )}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
});

export default PinModal;
