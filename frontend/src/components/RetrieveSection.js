import React, { memo } from "react";

const RetrieveSection = memo(function RetrieveSection({
  pin,
  onPinChange,
  onRetrieve,
  isRetrieving,
  retrievedText,
}) {
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
          {isRetrieving ? "Retrieving..." : "Access Document"}
        </button>
      </div>
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
