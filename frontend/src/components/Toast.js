import React, { memo, useEffect, useState } from "react";

const Toast = memo(function Toast({ message, type = "info", onClose, duration = 3000 }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const handleClick = () => {
    setExiting(true);
    setTimeout(onClose, 300);
  };

  return (
    <div className={`toast toast-${type}${exiting ? " toast-exit" : ""}`} onClick={handleClick}>
      <span className="toast-message">{message}</span>
    </div>
  );
});

export default Toast;
