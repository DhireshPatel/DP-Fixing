// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { useCart } from "@/context/CartContext";
// import BookingForm from "@/components/BookingForm";
// import LocationPopup from "@/components/LocationPopup";
// import styles from "./page.module.css";

// export default function CheckoutPage() {
//   const { items, subtotal, hydrated, clearCart } = useCart();
//   const router = useRouter();

//   const [settings, setSettings] = useState({ visitingFee: 299, timeSlots: [] });
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState("");
//   const [popupOpen, setPopupOpen] = useState(false);
//   const [popupMessage, setPopupMessage] = useState("");

//   useEffect(() => {
//     fetch("/api/settings")
//       .then((res) => res.json())
//       .then((data) => setSettings(data))
//       .catch(() => {});
//   }, []);

//   useEffect(() => {
//     if (hydrated && items.length === 0) {
//       router.replace("/cart");
//     }
//   }, [hydrated, items, router]);

//   const total = subtotal + (settings.visitingFee || 0);

//   async function handleSubmit(formData) {
//     setSubmitting(true);
//     setError("");

//     try {
//       const payload = {
//         ...formData,
//         services: items.map((i) => ({
//           serviceId: i.serviceId,
//           quantity: i.quantity,
//         })),
//       };

//       const res = await fetch("/api/bookings", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         if (data.error?.toLowerCase().includes("not available in your area")) {
//           setPopupMessage(data.error);
//           setPopupOpen(true);
//         } else {
//           setError(data.error || "Something went wrong. Please try again.");
//         }
//         setSubmitting(false);
//         return;
//       }

//       clearCart();
//       router.push(`/booking-success?id=${data.booking.bookingId}`);
//     } catch (err) {
//       console.error(err);
//       setError("Unable to submit your booking right now. Please try again.");
//       setSubmitting(false);
//     }
//   }

//   if (!hydrated || items.length === 0) return null;

//   return (
//     <div className="container" style={{ padding: "36px 20px 60px" }}>
//       <h1 className={styles.title}>Contact & Booking Details</h1>

//       <div className={styles.layout}>
//         <div className={`card ${styles.formCard}`}>
//           {error && <div className="error-banner">{error}</div>}
//           <BookingForm onSubmit={handleSubmit} submitting={submitting} timeSlots={settings.timeSlots} />
//         </div>

//         <div className={`card ${styles.summaryCard}`}>
//           <h3 className={styles.summaryTitle}>Order Summary</h3>
//           {items.map((item) => (
//             <div key={item.serviceId} className={styles.summaryItem}>
//               <span>{item.name} × {item.quantity}</span>
//               <span>₹{item.price * item.quantity}</span>
//             </div>
//           ))}
//           <div className={styles.divider} />
//           <div className={styles.summaryItem}>
//             <span>Subtotal</span>
//             <span>₹{subtotal}</span>
//           </div>
//           <div className={styles.summaryItem}>
//             <span>+ Visiting Fee</span>
//             <span>₹{settings.visitingFee || 0}</span>
//           </div>
//           <div className={styles.divider} />
//           <div className={`${styles.summaryItem} ${styles.totalRow}`}>
//             <span>Total</span>
//             <span>₹{total}</span>
//           </div>
//         </div>
//       </div>

//       <LocationPopup
//         open={popupOpen}
//         message={popupMessage}
//         onClose={() => setPopupOpen(false)}
//       />
//     </div>
//   );
// }

//======================================================
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import BookingForm from "@/components/BookingForm";
import LocationPopup from "@/components/LocationPopup";
import styles from "./page.module.css";

export default function CheckoutPage() {
  const { items, subtotal, hydrated, clearCart } = useCart();
  const router = useRouter();

  const [settings, setSettings] = useState({ visitingFee: 100, timeSlots: [] });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  // Guards the cart-empty redirect below from firing after a successful
  // booking clears the cart — without this, the redirect races the
  // navigation to /booking-success and wins, so the user never sees it.
  const [bookingComplete, setBookingComplete] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (hydrated && items.length === 0 && !bookingComplete) {
      router.replace("/cart");
    }
  }, [hydrated, items, bookingComplete, router]);

  const total = subtotal + (settings.visitingFee || 0);

  async function handleSubmit(formData) {
    setSubmitting(true);
    setError("");

    try {
      const payload = {
        ...formData,
        services: items.map((i) => ({
          serviceId: i.serviceId,
          quantity: i.quantity,
        })),
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error?.toLowerCase().includes("not available in your area")) {
          setPopupMessage(data.error);
          setPopupOpen(true);
        } else {
          setError(data.error || "Something went wrong. Please try again.");
        }
        setSubmitting(false);
        return;
      }

      // Mark booking complete BEFORE clearing the cart, so the cart-empty
      // redirect effect above doesn't hijack this navigation.
      setBookingComplete(true);
      clearCart();
      router.push(`/booking-success?id=${data.booking.bookingId}`);
    } catch (err) {
      console.error(err);
      setError("Unable to submit your booking right now. Please try again.");
      setSubmitting(false);
    }
  }

  if (!hydrated || (items.length === 0 && !bookingComplete)) return null;

  return (
    <div className="container" style={{ padding: "36px 20px 60px" }}>
      <h1 className={styles.title}>Contact & Booking Details</h1>

      <div className={styles.layout}>
        <div className={`card ${styles.formCard}`}>
          {error && <div className="error-banner">{error}</div>}
          <BookingForm
            onSubmit={handleSubmit}
            submitting={submitting}
            timeSlots={settings.timeSlots}
          />
        </div>

        <div className={`card ${styles.summaryCard}`}>
          <h3 className={styles.summaryTitle}>Order Summary</h3>
          {items.map((item) => (
            <div key={item.serviceId} className={styles.summaryItem}>
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div className={styles.divider} />
          <div className={styles.summaryItem}>
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>
          <div className={styles.summaryItem}>
            <span>+ Visiting Fee</span>
            <span>₹{settings.visitingFee || 0}</span>
          </div>
          <div className={styles.divider} />
          <div className={`${styles.summaryItem} ${styles.totalRow}`}>
            <span>Total</span>
            <span>₹{total}</span>
          </div>
        </div>
      </div>

      <LocationPopup
        open={popupOpen}
        message={popupMessage}
        onClose={() => setPopupOpen(false)}
      />
    </div>
  );
}
