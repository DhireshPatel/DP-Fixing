"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, MapPin, LocateFixed } from "lucide-react";
import ManualLocationPicker from "@/components/ManualLocationPicker";
import styles from "./page.module.css";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const emptyForm = {
  name: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  latitude: "",
  longitude: "",
  services: [],
  workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  workingHours: { start: "09:00", end: "19:00" },
  active: true,
};

export default function AdminServiceMenPage() {
  const [serviceMen, setServiceMen] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);

  function loadData() {
    setLoading(true);
    Promise.all([
      fetch("/api/service-men").then((r) => r.json()),
      fetch("/api/services?all=true").then((r) => r.json()),
    ])
      .then(([smData, svcData]) => {
        if (smData.error) setError(smData.error);
        else setServiceMen(smData.serviceMen);
        if (svcData.services) setAllServices(svcData.services);
      })
      .catch(() => setError("Unable to load data."))
      .finally(() => setLoading(false));
  }

  useEffect(loadData, []);

  function openAddModal() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEditModal(sm) {
    setEditingId(sm.id);
    setForm({
      name: sm.name,
      phone: sm.phone,
      address: sm.address || "",
      city: sm.city || "",
      state: sm.state || "",
      pincode: sm.pincode || "",
      latitude: sm.latitude,
      longitude: sm.longitude,
      services: sm.services.map((s) => s.id || s),
      workingDays: sm.workingDays,
      workingHours: sm.workingHours,
      active: sm.active,
    });
    setModalOpen(true);
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  function toggleService(id) {
    setForm((f) => ({
      ...f,
      services: f.services.includes(id)
        ? f.services.filter((s) => s !== id)
        : [...f.services, id],
    }));
  }

  function toggleDay(day) {
    setForm((f) => ({
      ...f,
      workingDays: f.workingDays.includes(day)
        ? f.workingDays.filter((d) => d !== day)
        : [...f.workingDays, day],
    }));
  }

  function handleManualLocation(result) {
    setForm((f) => ({
      ...f,
      latitude: result.latitude,
      longitude: result.longitude,
      address: result.formatted || f.address,
      city: result.city || f.city,
      state: result.state || f.state,
      pincode: result.pincode || f.pincode,
    }));
  }

  function handleUseCurrentLocation() {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }));
        setLocating(false);
      },
      () => {
        setError("Unable to fetch current location.");
        setLocating(false);
      }
    );
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const url = editingId ? `/api/service-men/${editingId}` : "/api/service-men";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setModalOpen(false);
      loadData();
    } catch (err) {
      setError(err.message || "Unable to save service man.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Remove this service man?")) return;
    try {
      const res = await fetch(`/api/service-men/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      loadData();
    } catch (err) {
      setError(err.message || "Unable to delete service man.");
    }
  }

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Service Men</h1>
          <p className={styles.pageSubtitle}>Manage your team of electricians.</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={16} /> Add Service Man
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className={`card ${styles.tableCard}`}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th><th>Phone</th><th>Location</th><th>Services</th>
                <th>Working Days</th><th>Hours</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className={styles.emptyCell}>Loading...</td></tr>
              ) : serviceMen.length === 0 ? (
                <tr><td colSpan={8} className={styles.emptyCell}>No service men added yet.</td></tr>
              ) : (
                serviceMen.map((sm) => (
                  <tr key={sm.id}>
                    <td>{sm.name}</td>
                    <td>{sm.phone}</td>
                    <td>{sm.city || `${sm.latitude?.toFixed(3)}, ${sm.longitude?.toFixed(3)}`}</td>
                    <td>{sm.services.map((s) => s.name || s).join(", ") || "—"}</td>
                    <td>{sm.workingDays.join(", ")}</td>
                    <td>{sm.workingHours?.start}–{sm.workingHours?.end}</td>
                    <td>
                      <span className={sm.active ? styles.activeTag : styles.inactiveTag}>
                        {sm.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(sm)}>
                          <Pencil size={13} />
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(sm.id)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className={styles.overlay} onClick={() => setModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setModalOpen(false)}>
              <X size={20} />
            </button>
            <h3 className={styles.modalTitle}>{editingId ? "Edit Service Man" : "Add Service Man"}</h3>

            <form onSubmit={handleSave}>
              <div className={styles.row2}>
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input className="form-input" name="name" value={form.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" name="phone" value={form.phone} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Address</label>
                <input className="form-input" name="address" value={form.address} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <div className={styles.locationButtons}>
                  <button type="button" className="btn btn-outline btn-sm" onClick={handleUseCurrentLocation} disabled={locating}>
                    <LocateFixed size={14} /> {locating ? "Locating..." : "Use Current Location"}
                  </button>
                </div>
                <div className={styles.orDivider}>or search manually</div>
                <ManualLocationPicker onSelect={handleManualLocation} />
                {form.latitude && form.longitude && (
                  <div className={styles.locationConfirm}>
                    <MapPin size={14} /> {Number(form.latitude).toFixed(5)}, {Number(form.longitude).toFixed(5)}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Services Provided</label>
                <div className={styles.checkboxGrid}>
                  {allServices.map((s) => (
                    <label key={s.id} className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={form.services.includes(s.id)}
                        onChange={() => toggleService(s.id)}
                      />
                      {s.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Working Days</label>
                <div className={styles.dayRow}>
                  {DAYS.map((day) => (
                    <button
                      type="button"
                      key={day}
                      className={`${styles.dayBtn} ${form.workingDays.includes(day) ? styles.dayBtnActive : ""}`}
                      onClick={() => toggleDay(day)}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.row2}>
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={form.workingHours.start}
                    onChange={(e) => setForm((f) => ({ ...f, workingHours: { ...f.workingHours, start: e.target.value } }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={form.workingHours.end}
                    onChange={(e) => setForm((f) => ({ ...f, workingHours: { ...f.workingHours, end: e.target.value } }))}
                  />
                </div>
              </div>

              <label className={styles.checkboxLabel} style={{ marginBottom: 20 }}>
                <input type="checkbox" name="active" checked={form.active} onChange={handleChange} /> Active
              </label>

              <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
                {saving ? "Saving..." : "Save Service Man"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
