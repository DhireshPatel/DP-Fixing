"use client";

import { AlertTriangle, X } from "lucide-react";
import styles from "./LocationPopup.module.css";

export default function LocationPopup({ open, onClose, message }) {
  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <div className={styles.iconWrap}>
          <AlertTriangle size={32} />
        </div>

        <h3 className={styles.title}>Service Not Available</h3>
        <p className={styles.message}>
          {message || "Sorry, DP Fixing is currently not available in your area."}
        </p>

        <button className="btn btn-primary btn-block" onClick={onClose}>
          Okay, Got It
        </button>
      </div>
    </div>
  );
}
