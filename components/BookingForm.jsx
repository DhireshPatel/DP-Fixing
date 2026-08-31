// "use client";

// import { useState, useEffect } from "react";
// import { MapPin, LocateFixed, Loader2 } from "lucide-react";
// import { useLocation } from "@/context/LocationContext";
// import ManualLocationPicker from "./ManualLocationPicker";
// import styles from "./BookingForm.module.css";

// const FALLBACK_TIME_SLOTS = [
//   "8:00 AM - 10:00 AM",
//   "10:00 AM - 12:00 PM",
//   "12:00 PM - 2:00 PM",
//   "2:00 PM - 4:00 PM",
//   "4:00 PM - 6:00 PM",
//   "6:00 PM - 8:00 PM",
// ];

// function todayISO() {
//   const d = new Date();
//   const offset = d.getTimezoneOffset();
//   const local = new Date(d.getTime() - offset * 60000);
//   return local.toISOString().split("T")[0];
// }

// export default function BookingForm({ onSubmit, submitting, timeSlots }) {
//   const { location, loading, error, useCurrentLocation, setManualLocation } = useLocation();

//   const [form, setForm] = useState({
//     customerName: "",
//     phone: "",
//     address: "",
//     preferredDate: todayISO(),
//     preferredTimeSlot: "",
//     notes: "",
//   });
//   const [locationMode, setLocationMode] = useState(null); // "gps" | "manual"
//   const [formErrors, setFormErrors] = useState({});

//   useEffect(() => {
//     if (location.address && !form.address) {
//       setForm((f) => ({ ...f, address: location.address }));
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [location.address]);

//   const slots = timeSlots?.length ? timeSlots : FALLBACK_TIME_SLOTS;

//   function handleChange(e) {
//     const { name, value } = e.target;
//     setForm((f) => ({ ...f, [name]: value }));
//   }

//   async function handleUseCurrentLocation() {
//     setLocationMode("gps");
//     try {
//       const loc = await useCurrentLocation();
//       setForm((f) => ({ ...f, address: loc.address || f.address }));
//     } catch (err) {
//       // error surfaced via context
//     }
//   }

//   function handleManualSelect(result) {
//     setLocationMode("manual");
//     const loc = setManualLocation(result);
//     setForm((f) => ({ ...f, address: loc.address }));
//   }

//   function validate() {
//     const errs = {};
//     if (!form.customerName.trim() || form.customerName.trim().length < 2) {
//       errs.customerName = "Please enter your full name.";
//     }
//     const digits = form.phone.replace(/\D/g, "");
//     if (digits.length < 10) errs.phone = "Please enter a valid phone number.";
//     if (!form.address.trim()) errs.address = "Address is required.";
//     if (!location.latitude || !location.longitude) {
//       errs.location = "Please set your location using GPS or manual search.";
//     }
//     if (!form.preferredDate) errs.preferredDate = "Please choose a date.";
//     if (!form.preferredTimeSlot) errs.preferredTimeSlot = "Please choose a time slot.";

//     setFormErrors(errs);
//     return Object.keys(errs).length === 0;
//   }

//   function handleSubmit(e) {
//     e.preventDefault();
//     if (!validate()) return;

//     onSubmit({
//       ...form,
//       customerName: form.customerName.trim(),
//       phone: form.phone.trim(),
//       address: form.address.trim(),
//       latitude: location.latitude,
//       longitude: location.longitude,
//       locationAccuracy: location.accuracy,
//       locationSource: location.source || "manual",
//       city: location.city,
//       state: location.state,
//       pincode: location.pincode,
//     });
//   }

//   return (
//     <form className={styles.form} onSubmit={handleSubmit}>
//       <div className={styles.formGroup}>
//         <label className="form-label">Full Name</label>
//         <input
//           className="form-input"
//           name="customerName"
//           value={form.customerName}
//           onChange={handleChange}
//           placeholder="e.g. Dhiresh Patel"
//           required
//         />
//         {formErrors.customerName && <div className="form-error">{formErrors.customerName}</div>}
//       </div>

//       <div className={styles.formGroup}>
//         <label className="form-label">Phone Number</label>
//         <input
//           className="form-input"
//           name="phone"
//           value={form.phone}
//           onChange={handleChange}
//           placeholder="e.g. 9876543210"
//           required
//         />
//         {formErrors.phone && <div className="form-error">{formErrors.phone}</div>}
//       </div>

//       <div className={styles.formGroup}>
//         <label className="form-label">Address</label>
//         <textarea
//           className="form-textarea"
//           name="address"
//           value={form.address}
//           onChange={handleChange}
//           placeholder="House no, street, area..."
//           required
//         />
//         {formErrors.address && <div className="form-error">{formErrors.address}</div>}
//       </div>

//       <div className={styles.formGroup}>
//         <label className="form-label">Location</label>

//         <div className={styles.locationButtons}>
//           <button
//             type="button"
//             className={`btn btn-outline btn-sm ${locationMode === "gps" ? styles.activeMode : ""}`}
//             onClick={handleUseCurrentLocation}
//             disabled={loading}
//           >
//             {loading ? <Loader2 size={14} className={styles.spin} /> : <LocateFixed size={14} />}
//             Use My Current Location
//           </button>
//         </div>

//         <div className={styles.orDivider}>or choose manually</div>

//         <ManualLocationPicker onSelect={handleManualSelect} />

//         {location.latitude && (
//           <div className={styles.locationConfirm}>
//             <MapPin size={14} />
//             Location set ({location.source === "gps" ? "GPS" : "Manual"})
//             {location.city ? ` — ${location.city}` : ""}
//           </div>
//         )}

//         {error && <div className="form-error">{error}</div>}
//         {formErrors.location && <div className="form-error">{formErrors.location}</div>}
//       </div>

//       <div className={styles.row2}>
//         <div className={styles.formGroup}>
//           <label className="form-label">Preferred Date</label>
//           <input
//             type="date"
//             className="form-input"
//             name="preferredDate"
//             min={todayISO()}
//             value={form.preferredDate}
//             onChange={handleChange}
//           />
//           {formErrors.preferredDate && <div className="form-error">{formErrors.preferredDate}</div>}
//         </div>

//         <div className={styles.formGroup}>
//           <label className="form-label">Preferred Time Slot</label>
//           <select
//             className="form-select"
//             name="preferredTimeSlot"
//             value={form.preferredTimeSlot}
//             onChange={handleChange}
//             required
//           >
//             <option value="">Select a time slot</option>
//             {slots.map((slot) => (
//               <option key={slot} value={slot}>{slot}</option>
//             ))}
//           </select>
//           {formErrors.preferredTimeSlot && (
//             <div className="form-error">{formErrors.preferredTimeSlot}</div>
//           )}
//         </div>
//       </div>

//       <div className={styles.formGroup}>
//         <label className="form-label">Additional Notes (optional)</label>
//         <textarea
//           className="form-textarea"
//           name="notes"
//           value={form.notes}
//           onChange={handleChange}
//           placeholder="Any specific instructions for the electrician..."
//         />
//       </div>

//       <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
//         {submitting ? "Submitting Booking..." : "Confirm Booking"}
//       </button>
//     </form>
//   );
// }

// new

"use client";

import { useState, useEffect } from "react";
import { MapPin, LocateFixed, Loader2, CheckCircle2 } from "lucide-react";
import { useLocation } from "@/context/LocationContext";

import styles from "./BookingForm.module.css";

const FALLBACK_TIME_SLOTS = [
  "8:00 AM - 10:00 AM",
  "10:00 AM - 12:00 PM",
  "12:00 PM - 2:00 PM",
  "2:00 PM - 4:00 PM",
  "4:00 PM - 6:00 PM",
  "6:00 PM - 8:00 PM",
];

function todayISO() {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().split("T")[0];
}

export default function BookingForm({ onSubmit, submitting, timeSlots }) {
  const { location, loading, error, useCurrentLocation } = useLocation();

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    address: "",
    preferredDate: todayISO(),
    preferredTimeSlot: "",
    notes: "",
  });
  const [locationMode, setLocationMode] = useState(null); // "gps" | "manual"
  const [gpsConfirmed, setGpsConfirmed] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const slots = timeSlots?.length ? timeSlots : FALLBACK_TIME_SLOTS;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleUseCurrentLocation() {
    setLocationMode("gps");
    setGpsConfirmed(false);
    try {
      await useCurrentLocation();
      setGpsConfirmed(true);
    } catch (err) {
      // error surfaced via context
    }
  }

  function validate() {
    const errs = {};
    if (!form.customerName.trim() || form.customerName.trim().length < 2) {
      errs.customerName = "Please enter your full name.";
    }
    const digits = form.phone.replace(/\D/g, "");
    if (digits.length < 10) errs.phone = "Please enter a valid phone number.";
    if (!form.address.trim()) errs.address = "Address is required.";
    if (!location.latitude || !location.longitude) {
      errs.location = "Please set your location using GPS.";
    }
    if (!form.preferredDate) errs.preferredDate = "Please choose a date.";
    if (!form.preferredTimeSlot)
      errs.preferredTimeSlot = "Please choose a time slot.";

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    // Fold the landmark into the address the electrician/service man will
    // actually see (on the booking, in the admin panel, and in the
    // WhatsApp assignment message), since there's no separate landmark
    // column in the booking model.
    const finalAddress = form.address.trim();

    onSubmit({
      ...form,
      customerName: form.customerName.trim(),
      phone: form.phone.trim(),
      address: finalAddress,
      latitude: location.latitude,
      longitude: location.longitude,
      locationAccuracy: location.accuracy,
      locationSource: location.source || "manual",
      city: location.city,
      state: location.state,
      pincode: location.pincode,
    });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <label className="form-label">Full Name</label>
        <input
          className="form-input"
          name="customerName"
          value={form.customerName}
          onChange={handleChange}
          placeholder="e.g. Dhiresh Patel"
        />
        {formErrors.customerName && (
          <div className="form-error">{formErrors.customerName}</div>
        )}
      </div>

      <div className={styles.formGroup}>
        <label className="form-label">Phone Number</label>
        <input
          className="form-input"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="e.g. 9876543210"
        />
        {formErrors.phone && (
          <div className="form-error">{formErrors.phone}</div>
        )}
      </div>

      <div className={styles.formGroup}>
        <label className="form-label">Address</label>
        <textarea
          className="form-textarea"
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="House no, street, area..."
        />
        {formErrors.address && (
          <div className="form-error">{formErrors.address}</div>
        )}
      </div>

      <div className={styles.formGroup}>
        <label className="form-label">Location</label>

        <div className={styles.locationButtons}>
          <button
            type="button"
            className={`btn btn-outline btn-sm ${locationMode === "gps" ? styles.activeMode : ""}`}
            onClick={handleUseCurrentLocation}
            disabled={loading}
          >
            {loading ? (
              <Loader2 size={14} className={styles.spin} />
            ) : (
              <LocateFixed size={14} />
            )}
            Use My Current Location
          </button>
        </div>

        {/* GPS success confirmation with coordinates */}
        {locationMode === "gps" && gpsConfirmed && location.latitude && (
          <div className={styles.gpsSuccess}>
            <CheckCircle2 size={15} />
            <span>Your current location has been fetched and used</span>
          </div>
        )}

        {location.latitude && location.source === "gps" && (
          <div className={styles.locationConfirm}>
            <MapPin size={14} />
            Location set (GPS)
            {location.city ? ` — ${location.city}` : ""}
          </div>
        )}

        {error && <div className="form-error">{error}</div>}
        {formErrors.location && (
          <div className="form-error">{formErrors.location}</div>
        )}
      </div>

      <div className={styles.row2}>
        <div className={styles.formGroup}>
          <label className="form-label">Preferred Date</label>
          <input
            type="date"
            className="form-input"
            name="preferredDate"
            min={todayISO()}
            value={form.preferredDate}
            onChange={handleChange}
          />
          {formErrors.preferredDate && (
            <div className="form-error">{formErrors.preferredDate}</div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className="form-label">Preferred Time Slot</label>
          <select
            className="form-select"
            name="preferredTimeSlot"
            value={form.preferredTimeSlot}
            onChange={handleChange}
          >
            <option value="">Select a time slot</option>
            {slots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
          {formErrors.preferredTimeSlot && (
            <div className="form-error">{formErrors.preferredTimeSlot}</div>
          )}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className="form-label">Additional Notes (optional)</label>
        <textarea
          className="form-textarea"
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Any specific instructions for the electrician..."
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary btn-block"
        disabled={submitting}
      >
        {submitting ? "Submitting Booking..." : "Confirm Booking"}
      </button>
    </form>
  );
}
