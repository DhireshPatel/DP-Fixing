"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import styles from "./page.module.css";

const STATUS_FILTERS = [
  "All",
  "Pending",
  "Confirmed",
  "Assigned",
  "In Progress",
  "Completed",
  "Cancelled",
];

export default function AdminBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/bookings?status=${status}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setBookings(data.bookings);
      })
      .catch(() => setError("Unable to load bookings."))
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <div>
      <h1 className={styles.pageTitle}>Bookings</h1>
      <p className={styles.pageSubtitle}>Manage and track all customer bookings.</p>

      <div className={styles.filters}>
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            className={`${styles.filterBtn} ${status === s ? styles.filterBtnActive : ""}`}
            onClick={() => setStatus(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className={`card ${styles.tableCard}`}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Services</th>
                <th>Date</th>
                <th>Time</th>
                <th>Total</th>
                <th>Status</th>
                <th>Assigned</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className={styles.emptyCell}>Loading...</td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan={9} className={styles.emptyCell}>No bookings found.</td></tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className={styles.row} onClick={() => router.push(`/admin/bookings/${b.id}`)}>
                    <td>{b.bookingId}</td>
                    <td>{b.customerName}</td>
                    <td>{b.phone}</td>
                    <td>{b.services.map((s) => s.serviceName).join(", ")}</td>
                    <td>{b.preferredDate}</td>
                    <td>{b.preferredTimeSlot}</td>
                    <td>₹{b.totalAmount}</td>
                    <td><StatusBadge status={b.status} /></td>
                    <td>{b.assignedServiceManName || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
