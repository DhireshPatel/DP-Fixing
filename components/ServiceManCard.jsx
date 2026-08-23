"use client";

import { Phone, MapPin, Navigation, MessageCircle } from "lucide-react";
import styles from "./ServiceManCard.module.css";

export default function ServiceManCard({ serviceMan, recommended, onAssign, onWhatsApp, assigning }) {
  return (
    <div className={`${styles.card} ${recommended ? styles.recommended : ""}`}>
      {recommended && <div className={styles.recommendedTag}>Recommended Service Man</div>}

      <div className={styles.header}>
        <h4 className={styles.name}>{serviceMan.name}</h4>
        <span className={styles.distance}>
          <Navigation size={13} /> {serviceMan.distanceKm ?? "?"} km away
        </span>
      </div>

      <div className={styles.row}>
        <Phone size={14} /> {serviceMan.phone}
      </div>
      {serviceMan.address && (
        <div className={styles.row}>
          <MapPin size={14} /> {serviceMan.address}
        </div>
      )}

      <div className={styles.services}>
        {serviceMan.services?.map((s, i) => (
          <span key={i} className={styles.serviceTag}>
            {s}
          </span>
        ))}
      </div>

      <div className={styles.actions}>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => onAssign(serviceMan)}
          disabled={assigning}
        >
          {assigning ? "Assigning..." : "Assign Service Man"}
        </button>
        <button className="btn btn-outline btn-sm" onClick={() => onWhatsApp(serviceMan)}>
          <MessageCircle size={14} /> WhatsApp
        </button>
      </div>
    </div>
  );
}
