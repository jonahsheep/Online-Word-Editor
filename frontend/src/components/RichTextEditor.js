import React, { useRef, useEffect, forwardRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ color: [] }, { background: [] }],
    ["link", "image"],
    ["clean"],
  ],
};

const RichTextEditor = forwardRef(function RichTextEditor({ value, onChange }, ref) {
  const innerRef = useRef(null);

  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          e.preventDefault();
          const file = items[i].getAsFile();
          const reader = new FileReader();
          reader.onload = () => {
            const editor = (ref || innerRef).current.getEditor();
            const range = editor.getSelection();
            editor.insertEmbed(range.index, "image", reader.result);
            editor.setSelection(range.index + 1);
          };
          reader.readAsDataURL(file);
          return;
        }
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [ref]);

  return (
    <ReactQuill
      ref={ref || innerRef}
      value={value}
      onChange={onChange}
      modules={modules}
    />
  );
});

export default RichTextEditor;
