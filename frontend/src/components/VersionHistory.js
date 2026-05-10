import React, { memo, useState } from "react";

const VersionHistory = memo(function VersionHistory({
  pin,
  versions,
  onRestore,
  isRetrieving,
}) {
  const [expanded, setExpanded] = useState(false);

  if (!versions || versions.length === 0) return null;

  return (
    <div className="version-history">
      <button
        className="version-toggle"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? "Hide" : "Show"} Version History ({versions.length})
      </button>
      {expanded && (
        <div className="version-list">
          {versions.map((v) => (
            <div key={v.index} className="version-item">
              <div className="version-meta">
                <span className="version-time">
                  {new Date(v.timestamp * 1000).toLocaleTimeString()}
                </span>
                <span className="version-preview">{v.preview}</span>
              </div>
              <button
                className="version-restore-btn"
                onClick={() => onRestore(v.index)}
                disabled={isRetrieving}
              >
                Restore
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default VersionHistory;
