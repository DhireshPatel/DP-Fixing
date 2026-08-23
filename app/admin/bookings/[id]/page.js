"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { MapPin, Phone, Calendar, Clock, FileText } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import ServiceManCard from "@/components/ServiceManCard";
import { buildWhatsAppLink, buildAssignmentMessage } from "@/lib/whatsapp";
import styles from "./page.module.css";

const STATUSES = ["Pending", "Confirmed", "Assigned", "In Progress", "Completed", "Cancelled"];

export default function AdminBookingDetailPage() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [matches, setMatches] = useState(null);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [assigningId, setAssigningId] = useState(null);

  const loadBooking = useCallback(() => {
    fetch(`/api/bookings/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setBooking(data.booking);
      })
      .catch(() => setError("Unable to load booking."));
  }, [id]);

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  useEffect(() => {
    if (!booking) return;
    fetch(`/api/service-men/match?bookingId=${booking.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setMatches(data);
      })
      .catch(() => {});
  }, [booking?.id]);

  async function handleStatusChange(newStatus) {
    setUpdating(true);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBooking(data.booking);
    } catch (err) {
      setError(err.message || "Unable to update status.");
    } finally {
      setUpdating(false);
    }
  }

  async function handleAssign(serviceMan) {
    setAssigningId(serviceMan.id);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedServiceMan: serviceMan.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBooking(data.booking);
    } catch (err) {
      setError(err.message || "Unable to assign service man.");
    } finally {
      setAssigningId(null);
    }
  }

  function handleWhatsApp(serviceMan) {
    const message = buildAssignmentMessage(booking, serviceMan);
    const link = buildWhatsAppLink(serviceMan.phone, message);
    window.open(link, "_blank");
  }

  if (error && !booking) return <div className="error-banner">{error}</div>;
  if (!booking) return <div>Loading booking...</div>;

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Booking {booking.bookingId}</h1>
          <p className={styles.pageSubtitle}>
            Created {new Date(booking.createdAt).toLocaleString()}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className={styles.layout}>
        <div className={styles.mainCol}>
          <div className={`card ${styles.section}`}>
            <h3 className={styles.sectionTitle}>Customer Information</h3>
            <div className={styles.infoGrid}>
              <div><strong>{booking.customerName}</strong></div>
              <div className={styles.iconRow}><Phone size={14} /> {booking.phone}</div>
              <div className={styles.iconRow}><MapPin size={14} /> {booking.address} {booking.city}, {booking.pincode}</div>
              <div className={styles.iconRow}>
                Location: {booking.latitude?.toFixed(5)}, {booking.longitude?.toFixed(5)} ({booking.locationSource})
              </div>
              <div className={styles.iconRow}><Calendar size={14} /> {booking.preferredDate}</div>
              <div className={styles.iconRow}><Clock size={14} /> {booking.preferredTimeSlot}</div>
              {booking.notes && (
                <div className={styles.iconRow}><FileText size={14} /> {booking.notes}</div>
              )}
            </div>
          </div>

          <div className={`card ${styles.section}`}>
            <h3 className={styles.sectionTitle}>Services</h3>
            <table className={styles.servicesTable}>
              <thead>
                <tr><th>Service</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr>
              </thead>
              <tbody>
                {booking.services.map((s, i) => (
                  <tr key={i}>
                    <td>{s.serviceName}</td>
                    <td>{s.quantity}</td>
                    <td>₹{s.price}</td>
                    <td>₹{s.subtotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className={styles.totalsBox}>
              <div className={styles.totalRow}><span>Subtotal</span><span>₹{booking.subtotal}</span></div>
              <div className={styles.totalRow}><span>Visiting Fee</span><span>₹{booking.visitingFee}</span></div>
              <div className={`${styles.totalRow} ${styles.grandTotal}`}><span>Total</span><span>₹{booking.totalAmount}</span></div>
            </div>
          </div>

          <div className={`card ${styles.section}`}>
            <h3 className={styles.sectionTitle}>Update Status</h3>
            <div className={styles.statusButtons}>
              {STATUSES.map((s) => (
                <button
                  key={s}
                  className={`btn btn-sm ${booking.status === s ? "btn-primary" : "btn-secondary"}`}
                  disabled={updating}
                  onClick={() => handleStatusChange(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.sideCol}>
          <h3 className={styles.sectionTitle}>Nearest Service Men</h3>

          {booking.assignedServiceManName && (
            <div className={styles.assignedBox}>
              Currently assigned to <strong>{booking.assignedServiceManName}</strong>
            </div>
          )}

          {!matches ? (
            <p className={styles.mutedText}>Finding matching service men...</p>
          ) : matches.recommended ? (
            <>
              <ServiceManCard
                serviceMan={matches.recommended}
                recommended
                onAssign={handleAssign}
                onWhatsApp={handleWhatsApp}
                assigning={assigningId === matches.recommended.id}
              />
              {matches.others?.length > 0 && (
                <>
                  <h4 className={styles.otherTitle}>Other Available Service Men</h4>
                  {matches.others.map((sm) => (
                    <ServiceManCard
                      key={sm.id}
                      serviceMan={sm}
                      onAssign={handleAssign}
                      onWhatsApp={handleWhatsApp}
                      assigning={assigningId === sm.id}
                    />
                  ))}
                </>
              )}
            </>
          ) : (
            <p className={styles.mutedText}>
              No matching service man found for this service, day and time slot.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
