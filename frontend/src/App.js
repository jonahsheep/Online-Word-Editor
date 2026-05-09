import React, { useState, useCallback, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import RichTextEditor from "./components/RichTextEditor";
import EditorToolbar from "./components/EditorToolbar";
import PinModal from "./components/PinModal";
import RetrieveSection from "./components/RetrieveSection";
import Toast from "./components/Toast";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const AUTOSAVE_DELAY = 30000;

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
  const [dirty, setDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState("saved");
  const quillRef = useRef(null);
  const timerRef = useRef(null);
  const currentPinRef = useRef(pin);
  const { dark, toggleTheme } = useTheme();

  useEffect(() => {
    currentPinRef.current = pin;
  }, [pin]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedPin = params.get("pin");
    if (sharedPin && /^\d{4}$/.test(sharedPin)) {
      setRetrievePin(sharedPin);
    }
  }, []);

  useEffect(() => {
    if (dirty) {
      setSaveStatus("unsaved");
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        doAutoSave();
      }, AUTOSAVE_DELAY);
    }
    return () => clearTimeout(timerRef.current);
  }, [text, dirty]);

  const doAutoSave = async () => {
    if (!text.trim()) return;
    setSaveStatus("saving");
    try {
      await axios.post(`${API_URL}/save`, {
        text,
        pin: currentPinRef.current || undefined,
      });
      setSaveStatus("saved");
      setDirty(false);
    } catch {
      setSaveStatus("unsaved");
    }
  };

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type, key: Date.now() });
  }, []);

  const handleTextChange = useCallback((value) => {
    setText(value);
    setDirty(true);
  }, []);

  const handleSave = useCallback(async () => {
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
      currentPinRef.current = response.data.code;
      setPinExpiry(expiryTime);
      setShowPinModal(true);
      setDirty(false);
      setSaveStatus("saved");
      showToast("Document saved!", "success");
    } catch (error) {
      const msg =
        error.response?.data?.error || "Failed to save document.";
      showToast(msg, "error");
    } finally {
      setIsSaving(false);
    }
  }, [text, pin, showToast]);

  const handleRetrieve = useCallback(async () => {
    if (!retrievePin) {
      showToast("Please enter a PIN", "error");
      return;
    }
    setIsRetrieving(true);
    try {
      const response = await axios.get(`${API_URL}/retrieve/${retrievePin}`);
      setRetrievedText(response.data.text);
      setText(response.data.text);
      setDirty(false);
      setSaveStatus("saved");
      showToast("Document retrieved!", "success");
    } catch (error) {
      const msg =
        error.response?.data?.error || "Failed to retrieve document.";
      showToast(msg, "error");
    } finally {
      setIsRetrieving(false);
    }
  }, [retrievePin, showToast]);

  const handleDownload = useCallback(async (format) => {
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
  }, [text, showToast]);

  return (
    <div className="App">
      <div className="editor-header">
        <div className="header-left">
          <h1>Online Word Editor</h1>
          <span className={`save-status save-status-${saveStatus}`}>
            {saveStatus === "saving" ? "Saving..." : ""}
            {saveStatus === "unsaved" ? "Unsaved changes" : ""}
            {saveStatus === "saved" && dirty === false ? "All changes saved" : ""}
          </span>
        </div>
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
          onChange={handleTextChange}
        />
      </div>

      {showPinModal && (
        <PinModal
          pin={pin}
          expiryTime={pinExpiry}
          onClose={() => setShowPinModal(false)}
          showToast={showToast}
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
