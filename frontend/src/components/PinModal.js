import React, { memo, useState, useEffect } from "react";

function getShareUrl(pin) {
  const base = window.location.origin + window.location.pathname;
  return `${base}?pin=${pin}`;
}

const PinModal = memo(function PinModal({ pin, expiryTime, onClose, showToast }) {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!expiryTime) return;
    const tick = () => {
      const diff = Math.max(0, Math.round((expiryTime - Date.now()) / 1000));
      const m = Math.floor(diff / 60);
      const s = diff % 60;
      setTimeLeft(`${m}:${s.toString().padStart(2, "0")}`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiryTime]);

  if (!pin) return null;

  const handleCopyPin = async () => {
    try {
      await navigator.clipboard.writeText(pin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast?.("PIN copied to clipboard", "success");
    } catch {
      showToast?.("Failed to copy PIN", "error");
    }
  };

  const handleShareLink = async () => {
    const url = getShareUrl(pin);
    try {
      await navigator.clipboard.writeText(url);
      showToast?.("Share link copied to clipboard", "success");
    } catch {
      showToast?.("Failed to copy link", "error");
    }
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Document Saved!</h2>
        <p>Use this PIN to access your document:</p>
        <div className="pin-display">{pin}</div>
        <div className="pin-actions">
          <button className="pin-action-btn" onClick={handleCopyPin}>
            {copied ? "Copied!" : "Copy PIN"}
          </button>
          <button className="pin-action-btn share-btn" onClick={handleShareLink}>
            Copy Share Link
          </button>
        </div>
        {timeLeft && (
          <p className="pin-expiry">Expires in {timeLeft}</p>
        )}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
});

export default PinModal;
