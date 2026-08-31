"use client";

import { createContext, useContext, useState } from "react";
import { CheckCircle, X } from "lucide-react";
import styles from "./ToastContext.module.css";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  function showToast(message, actionText = null, action = null) {
    setToast({ message, actionText, action });

    setTimeout(() => {
      setToast(null);
    }, 3500);
  }

  function hideToast() {
    setToast(null);
  }

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}

      {toast && (
        <div className={styles.toast}>
          <CheckCircle size={20} />

          <div className={styles.content}>
            <div className={styles.message}>{toast.message}</div>

            {toast.actionText && (
              <button
                className={styles.action}
                onClick={() => {
                  toast.action?.();
                  hideToast();
                }}
              >
                {toast.actionText}
              </button>
            )}
          </div>

          <button className={styles.close} onClick={hideToast}>
            <X size={18} />
          </button>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
