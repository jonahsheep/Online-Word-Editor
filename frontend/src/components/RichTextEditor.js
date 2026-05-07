import React, { memo, useRef, useEffect, forwardRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const MAX_IMAGE_WIDTH = 1920;
const MAX_IMAGE_HEIGHT = 1080;
const IMAGE_QUALITY = 0.7;

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

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width <= MAX_IMAGE_WIDTH && height <= MAX_IMAGE_HEIGHT) {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
        return;
      }
      if (width > MAX_IMAGE_WIDTH) {
        height = Math.round((height * MAX_IMAGE_WIDTH) / width);
        width = MAX_IMAGE_WIDTH;
      }
      if (height > MAX_IMAGE_HEIGHT) {
        width = Math.round((width * MAX_IMAGE_HEIGHT) / height);
        height = MAX_IMAGE_HEIGHT;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", IMAGE_QUALITY));
    };
    img.onerror = reject;
    img.src = url;
  });
}

const RichTextEditor = memo(forwardRef(function RichTextEditor({ value, onChange }, ref) {
  const innerRef = useRef(null);

  useEffect(() => {
    const handlePaste = async (e) => {
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          e.preventDefault();
          const file = items[i].getAsFile();
          try {
            const compressed = await compressImage(file);
            const editor = (ref || innerRef).current.getEditor();
            const range = editor.getSelection();
            editor.insertEmbed(range.index, "image", compressed);
            editor.setSelection(range.index + 1);
          } catch {
            const reader = new FileReader();
            reader.onload = () => {
              const editor = (ref || innerRef).current.getEditor();
              const range = editor.getSelection();
              editor.insertEmbed(range.index, "image", reader.result);
              editor.setSelection(range.index + 1);
            };
            reader.readAsDataURL(file);
          }
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
}));

export default RichTextEditor;
