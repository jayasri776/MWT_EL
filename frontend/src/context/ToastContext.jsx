import { createContext, useContext, useState, useRef, useCallback } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  const showToast = useCallback((msg) => {
    setMessage(msg);
    setVisible(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), 2200);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        id="toast"
        style={{
          position: "fixed",
          left: "50%",
          bottom: 28,
          transform: `translateX(-50%) translateY(${visible ? 0 : 20}px)`,
          opacity: visible ? 1 : 0,
          background: "var(--ink)",
          color: "var(--paper)",
          padding: "10px 18px",
          borderRadius: 10,
          fontSize: 12.5,
          fontFamily: "'Work Sans', sans-serif",
          boxShadow: "var(--shadow-lg)",
          transition: "opacity 0.25s ease, transform 0.25s ease",
          zIndex: 999,
          pointerEvents: "none",
        }}
      >
        {message}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
