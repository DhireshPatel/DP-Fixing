"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import styles from "./page.module.css";

function SuccessContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("id");
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    if (!bookingId) return;
    // Public confirmation lookup is intentionally minimal; full details
    // require admin auth. We simply echo back the booking id here.
  }, [bookingId]);

  return (
    <div className="container" style={{ padding: "70px 20px" }}>
      <div className={styles.card}>
        <div className={styles.iconWrap}>
          <CheckCircle2 size={40} />
        </div>
        <h1 className={styles.title}>Booking Confirmed!</h1>
        <p className={styles.subtitle}>
          Our team will contact you shortly to confirm your appointment.
        </p>

        {bookingId && (
          <div className={styles.idBox}>
            Booking ID
            <div className={styles.idValue}>{bookingId}</div>
          </div>
        )}

        <Link href="/" className="btn btn-primary" style={{ marginTop: 24 }}>
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  );
}
