import React, { memo } from "react";

const EditorToolbar = memo(function EditorToolbar({ onSave, onDownload, isSaving, hasText }) {
  return (
    <div className="header-buttons">
      <button
        onClick={onSave}
        className="save-button"
        disabled={isSaving || !hasText}
      >
        {isSaving ? "Saving..." : "Save"}
      </button>
      <div className="download-buttons">
        <button onClick={() => onDownload("pdf")} disabled={!hasText}>
          PDF
        </button>
        <button onClick={() => onDownload("docx")} disabled={!hasText}>
          DOCX
        </button>
      </div>
    </div>
  );
});

export default EditorToolbar;
