import React, { memo, useEffect, useRef } from "react";

const RetrieveSection = memo(function RetrieveSection({
  pin,
  onPinChange,
  onRetrieve,
  isRetrieving,
  retrievedText,
  retrievedMeta,
  recentPins,
  onSelectRecent,
  onClear,
  children,
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
      <div className="retrieve-header">
        <h3>Access Document</h3>
        {retrievedText && (
          <button className="clear-btn" onClick={onClear}>
            Clear
          </button>
        )}
      </div>
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
      {isRetrieving && (
        <div className="retrieved-content">
          <div className="skeleton skeleton-text" />
          <div className="skeleton skeleton-text short" />
        </div>
      )}
      {retrievedText && !isRetrieving && (
        <div className="retrieved-content">
          <h4>Retrieved Document</h4>
          {retrievedMeta && (
            <div className="retrieved-meta">
              <span>{retrievedMeta.word_count} words</span>
              <span className="meta-sep">&middot;</span>
              <span>{retrievedMeta.char_count} characters</span>
            </div>
          )}
          <div className="retrieved-body">
            <div dangerouslySetInnerHTML={{ __html: retrievedText }} />
          </div>
          {children}
        </div>
      )}
    </div>
  );
});

export default RetrieveSection;
