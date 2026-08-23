"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, LocateFixed } from "lucide-react";
import ManualLocationPicker from "@/components/ManualLocationPicker";
import styles from "./page.module.css";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newArea, setNewArea] = useState({ name: "", latitude: "", longitude: "", radiusKm: 15 });

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setSettings(data.settings);
      })
      .catch(() => setError("Unable to load settings."));
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setSettings((s) => ({ ...s, [name]: value }));
  }

  function handleWorkingHoursChange(field, value) {
    setSettings((s) => ({ ...s, workingHours: { ...s.workingHours, [field]: value } }));
  }

  function handleTimeSlotChange(idx, value) {
    setSettings((s) => {
      const slots = [...s.timeSlots];
      slots[idx] = value;
      return { ...s, timeSlots: slots };
    });
  }

  function addTimeSlot() {
    setSettings((s) => ({ ...s, timeSlots: [...s.timeSlots, ""] }));
  }

  function removeTimeSlot(idx) {
    setSettings((s) => ({ ...s, timeSlots: s.timeSlots.filter((_, i) => i !== idx) }));
  }

  function addServiceArea() {
    if (!newArea.name || !newArea.latitude || !newArea.longitude) return;
    setSettings((s) => ({
      ...s,
      serviceAreas: [
        ...s.serviceAreas,
        {
          name: newArea.name,
          latitude: Number(newArea.latitude),
          longitude: Number(newArea.longitude),
          radiusKm: Number(newArea.radiusKm) || 15,
        },
      ],
    }));
    setNewArea({ name: "", latitude: "", longitude: "", radiusKm: 15 });
  }

  function removeServiceArea(idx) {
    setSettings((s) => ({ ...s, serviceAreas: s.serviceAreas.filter((_, i) => i !== idx) }));
  }

  function handleAreaLocationSelect(result) {
    setNewArea((a) => ({
      ...a,
      name: a.name || result.city || result.formatted,
      latitude: result.latitude,
      longitude: result.longitude,
    }));
  }

  function handleUseCurrentLocationForArea() {
    navigator.geolocation.getCurrentPosition((pos) => {
      setNewArea((a) => ({
        ...a,
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      }));
    });
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitingFee: Number(settings.visitingFee),
          serviceAreas: settings.serviceAreas,
          workingHours: settings.workingHours,
          timeSlots: settings.timeSlots.filter((s) => s.trim()),
          businessPhone: settings.businessPhone,
          telegramEnabled: settings.telegramEnabled,
          serviceAvailable: settings.serviceAvailable,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSettings(data.settings);
      setSuccess("Settings saved successfully.");
    } catch (err) {
      setError(err.message || "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  }

  if (!settings) return <div>Loading settings...</div>;

  return (
    <div>
      <h1 className={styles.pageTitle}>Settings</h1>
      <p className={styles.pageSubtitle}>Configure business-wide settings for DP Fixing.</p>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="success-banner">{success}</div>}

      <form onSubmit={handleSave}>
        <div className={`card ${styles.section}`}>
          <h3 className={styles.sectionTitle}>General</h3>

          <div className={styles.row2}>
            <div className="form-group">
              <label className="form-label">Visiting Fee (₹)</label>
              <input
                type="number"
                className="form-input"
                name="visitingFee"
                value={settings.visitingFee}
                onChange={handleChange}
                min="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Business Phone</label>
              <input
                className="form-input"
                name="businessPhone"
                value={settings.businessPhone}
                onChange={handleChange}
                placeholder="+91 99999 99999"
              />
            </div>
          </div>

          <div className={styles.toggleRow}>
            <label className={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={settings.serviceAvailable}
                onChange={(e) => setSettings((s) => ({ ...s, serviceAvailable: e.target.checked }))}
              />
              Accepting new bookings
            </label>
            <label className={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={settings.telegramEnabled}
                onChange={(e) => setSettings((s) => ({ ...s, telegramEnabled: e.target.checked }))}
              />
              Telegram notifications enabled
            </label>
          </div>
        </div>

        <div className={`card ${styles.section}`}>
          <h3 className={styles.sectionTitle}>Working Hours</h3>
          <div className={styles.row2}>
            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input
                type="time"
                className="form-input"
                value={settings.workingHours.start}
                onChange={(e) => handleWorkingHoursChange("start", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Time</label>
              <input
                type="time"
                className="form-input"
                value={settings.workingHours.end}
                onChange={(e) => handleWorkingHoursChange("end", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className={`card ${styles.section}`}>
          <h3 className={styles.sectionTitle}>Time Slots</h3>
          {settings.timeSlots.map((slot, idx) => (
            <div key={idx} className={styles.slotRow}>
              <input
                className="form-input"
                value={slot}
                onChange={(e) => handleTimeSlotChange(idx, e.target.value)}
                placeholder="e.g. 8:00 AM - 10:00 AM"
              />
              <button type="button" className="btn btn-danger btn-sm" onClick={() => removeTimeSlot(idx)}>
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-secondary btn-sm" onClick={addTimeSlot}>
            <Plus size={14} /> Add Time Slot
          </button>
        </div>

        <div className={`card ${styles.section}`}>
          <h3 className={styles.sectionTitle}>Service Areas</h3>
          <p className={styles.mutedText}>
            Bookings are only accepted within these areas. Each area has a center point and radius.
          </p>

          {settings.serviceAreas.map((area, idx) => (
            <div key={idx} className={styles.areaRow}>
              <div>
                <strong>{area.name}</strong>
                <div className={styles.areaMeta}>
                  {area.latitude.toFixed(4)}, {area.longitude.toFixed(4)} — {area.radiusKm} km radius
                </div>
              </div>
              <button type="button" className="btn btn-danger btn-sm" onClick={() => removeServiceArea(idx)}>
                <Trash2 size={13} />
              </button>
            </div>
          ))}

          <div className={styles.addAreaBox}>
            <div className={styles.row2}>
              <div className="form-group">
                <label className="form-label">Area Name</label>
                <input
                  className="form-input"
                  value={newArea.name}
                  onChange={(e) => setNewArea((a) => ({ ...a, name: e.target.value }))}
                  placeholder="e.g. Jodhpur City"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Radius (km)</label>
                <input
                  type="number"
                  className="form-input"
                  value={newArea.radiusKm}
                  onChange={(e) => setNewArea((a) => ({ ...a, radiusKm: e.target.value }))}
                  min="1"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Center Location</label>
              <div className={styles.locationButtons}>
                <button type="button" className="btn btn-outline btn-sm" onClick={handleUseCurrentLocationForArea}>
                  <LocateFixed size={14} /> Use Current Location
                </button>
              </div>
              <div className={styles.orDivider}>or search manually</div>
              <ManualLocationPicker onSelect={handleAreaLocationSelect} />
              {newArea.latitude && newArea.longitude && (
                <div className={styles.locationConfirm}>
                  Selected: {Number(newArea.latitude).toFixed(5)}, {Number(newArea.longitude).toFixed(5)}
                </div>
              )}
            </div>

            <button type="button" className="btn btn-secondary btn-sm" onClick={addServiceArea}>
              <Plus size={14} /> Add Service Area
            </button>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Save All Settings"}
        </button>
      </form>
    </div>
  );
}
