import React, { useState, useCallback, useRef } from "react";
import axios from "axios";
import "./App.css";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import RichTextEditor from "./components/RichTextEditor";
import EditorToolbar from "./components/EditorToolbar";
import PinModal from "./components/PinModal";
import RetrieveSection from "./components/RetrieveSection";
import Toast from "./components/Toast";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function AppContent() {
  const [text, setText] = useState("");
  const [pin, setPin] = useState("");
  const [retrievePin, setRetrievePin] = useState("");
  const [retrievedText, setRetrievedText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [pinExpiry, setPinExpiry] = useState(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [toast, setToast] = useState(null);
  const quillRef = useRef(null);
  const { dark, toggleTheme } = useTheme();

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type, key: Date.now() });
  }, []);

  const handleSave = async () => {
    if (!text.trim()) {
      showToast("Please enter some text before saving", "error");
      return;
    }
    setIsSaving(true);
    try {
      const expiryTime = new Date(Date.now() + 10 * 60 * 1000);
      const response = await axios.post(`${API_URL}/save`, {
        text,
        pin: pin || undefined,
      });
      setPin(response.data.code);
      setPinExpiry(expiryTime);
      setShowPinModal(true);
      showToast("Document saved!", "success");
    } catch (error) {
      const msg =
        error.response?.data?.error || "Failed to save document. Please try again.";
      showToast(msg, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRetrieve = async () => {
    if (!retrievePin) {
      showToast("Please enter a PIN", "error");
      return;
    }
    setIsRetrieving(true);
    try {
      const response = await axios.get(`${API_URL}/retrieve/${retrievePin}`);
      setRetrievedText(response.data.text);
      setText(response.data.text);
      showToast("Document retrieved!", "success");
    } catch (error) {
      const msg =
        error.response?.data?.error || "Failed to retrieve document.";
      showToast(msg, "error");
    } finally {
      setIsRetrieving(false);
    }
  };

  const handleDownload = async (format) => {
    if (!text.trim()) {
      showToast("Please enter some text before downloading", "error");
      return;
    }
    try {
      const response = await axios.post(
        `${API_URL}/download/${format}`,
        { text },
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `document.${format}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      showToast(`Failed to download as ${format}`, "error");
    }
  };

  return (
    <div className="App">
      <div className="editor-header">
        <h1>Online Word Editor</h1>
        <div className="header-buttons">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? "\u2600" : "\u263E"}
          </button>
          <EditorToolbar
            onSave={handleSave}
            onDownload={handleDownload}
            isSaving={isSaving}
            hasText={!!text.trim()}
          />
        </div>
      </div>

      <div className="editor-container">
        <RichTextEditor
          ref={quillRef}
          value={text}
          onChange={setText}
        />
      </div>

      {showPinModal && (
        <PinModal
          pin={pin}
          expiryTime={pinExpiry}
          onClose={() => setShowPinModal(false)}
        />
      )}

      <RetrieveSection
        pin={retrievePin}
        onPinChange={setRetrievePin}
        onRetrieve={handleRetrieve}
        isRetrieving={isRetrieving}
        retrievedText={retrievedText}
      />

      {toast && (
        <Toast
          key={toast.key}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
