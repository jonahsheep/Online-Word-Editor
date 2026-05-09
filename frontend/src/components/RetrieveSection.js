import React, { memo, useEffect, useRef } from "react";

const RetrieveSection = memo(function RetrieveSection({
  pin,
  onPinChange,
  onRetrieve,
  isRetrieving,
  retrievedText,
  recentPins,
  onSelectRecent,
}) {
  const prevPinLength = useRef(0);

  useEffect(() => {
    if (pin.length === 4 && prevPinLength.current !== 4) {
      onRetrieve();
    }
    prevPinLength.current = pin.length;
  }, [pin, onRetrieve]);

  return (
    <div className="retrieve-section">
      <h3>Access Document</h3>
      <div className="controls">
        <input
          type="text"
          placeholder="Enter 4-digit PIN"
          value={pin}
          onChange={(e) => onPinChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
          maxLength="4"
          pattern="[0-9]*"
        />
        <button onClick={onRetrieve} disabled={isRetrieving || pin.length !== 4}>
          {isRetrieving ? (
            <span className="btn-spinner" />
          ) : (
            "Access Document"
          )}
        </button>
      </div>
      {recentPins && recentPins.length > 0 && (
        <div className="recent-pins">
          <span className="recent-label">Recent:</span>
          {recentPins.map((p) => (
            <button
              key={p}
              className="recent-pin-btn"
              onClick={() => onSelectRecent(p)}
            >
              {p}
            </button>
          ))}
        </div>
      )}
      {retrievedText && (
        <div className="retrieved-content">
          <h4>Retrieved Document</h4>
          <div dangerouslySetInnerHTML={{ __html: retrievedText }} />
        </div>
      )}
    </div>
  );
});

export default RetrieveSection;
