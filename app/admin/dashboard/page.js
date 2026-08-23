"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  Users2,
  IndianRupee,
  XCircle,
  Wrench,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import styles from "./page.module.css";

const CARD_CONFIG = [
  { key: "total", label: "Total Bookings", icon: ClipboardList, color: "#0f172a" },
  { key: "Pending", label: "Pending", icon: Clock, color: "#92400e" },
  { key: "Confirmed", label: "Confirmed", icon: CheckCircle2, color: "#1e40af" },
  { key: "Assigned", label: "Assigned", icon: Users2, color: "#5b21b6" },
  { key: "In Progress", label: "In Progress", icon: Wrench, color: "#155e75" },
  { key: "Completed", label: "Completed", icon: CheckCircle2, color: "#166534" },
  { key: "Cancelled", label: "Cancelled", icon: XCircle, color: "#991b1b" },
  { key: "revenue", label: "Total Revenue", icon: IndianRupee, color: "#166534" },
];

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError("Unable to load dashboard data."));
  }, []);

  return (
    <div>
      <h1 className={styles.pageTitle}>Dashboard</h1>
      <p className={styles.pageSubtitle}>Overview of your bookings and revenue.</p>

      {error && <div className="error-banner">{error}</div>}

      <div className={styles.statsGrid}>
        {CARD_CONFIG.map((card) => {
          const Icon = card.icon;
          let value = "—";
          if (data) {
            if (card.key === "total") value = data.totalBookings;
            else if (card.key === "revenue") value = `₹${data.totalRevenue}`;
            else value = data.byStatus?.[card.key] ?? 0;
          }
          return (
            <div key={card.key} className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: `${card.color}1a`, color: card.color }}>
                <Icon size={20} />
              </div>
              <div>
                <div className={styles.statValue}>{value}</div>
                <div className={styles.statLabel}>{card.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.recentSection}>
        <div className={styles.recentHeader}>
          <h2 className={styles.recentTitle}>Recent Bookings</h2>
          <Link href="/admin/bookings" className={styles.viewAll}>View All →</Link>
        </div>

        <div className={`card ${styles.tableCard}`}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentBookings?.length ? (
                  data.recentBookings.map((b) => (
                    <tr
                      key={b.id}
                      className={styles.row}
                      onClick={() => (window.location.href = `/admin/bookings/${b.id}`)}
                    >
                      <td>{b.bookingId}</td>
                      <td>{b.customerName}</td>
                      <td>₹{b.totalAmount}</td>
                      <td><StatusBadge status={b.status} /></td>
                      <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: 24, color: "var(--color-text-muted)" }}>
                      No bookings yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
