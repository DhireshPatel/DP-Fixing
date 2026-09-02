"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import styles from "./page.module.css";

const emptyForm = {
  name: "",
  shortDescription: "",
  description: "",
  image: "",
  price: "",
  duration: "",
  category: "General",
  included: "",
  notes: "",
  popular: false,
  active: true,
};

export default function AdminServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // function loadServices() {
  //   setLoading(true);
  //   fetch("/api/services?all=true", {
  //     cache: "no-store",
  //   })
  //     .then((res) => res.json())
  //     .then((data) => {
  //       console.log("SERVICES API DATA:", data);
  //       if (data.error) {
  //         setError(data.error);
  //       } else {
  //         console.log("SERVICES ARRAY:", data.services);
  //         setServices(data.services);
  //       }
  //     })
  //     .catch(() => setError("Unable to load services."))
  //     .finally(() => setLoading(false));
  // }
  function loadServices() {
    setLoading(true);

    fetch("/api/services?all=true", {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setServices(data.services);
        }
      })
      .catch(() => setError("Unable to load services."))
      .finally(() => setLoading(false));
  }

  useEffect(loadServices, []);

  function openAddModal() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEditModal(service) {
    setEditingId(service.id);
    setForm({
      name: service.name,
      shortDescription: service.shortDescription,
      description: service.description,
      image: service.image,
      price: service.price,
      duration: service.duration,
      category: service.category || "General",
      included: (service.included || []).join("\n"),
      notes: (service.notes || []).join("\n"),
      popular: service.popular,
      active: service.active,
    });
    setModalOpen(true);
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      price: Number(form.price),
      included: form.included
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      notes: form.notes
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      const url = editingId ? `/api/services/${editingId}` : "/api/services";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setModalOpen(false);
      loadServices();
    } catch (err) {
      setError(err.message || "Unable to save service.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this service? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      loadServices();
    } catch (err) {
      setError(err.message || "Unable to delete service.");
    }
  }

  async function toggleActive(service) {
    try {
      const res = await fetch(`/api/services/${service.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !service.active }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      loadServices();
    } catch (err) {
      setError(err.message || "Unable to update service.");
    }
  }

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Services</h1>
          <p className={styles.pageSubtitle}>
            Manage the electrician service catalog.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={16} /> Add Service
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className={styles.grid}>
        {loading ? (
          <p>Loading services...</p>
        ) : services.length === 0 ? (
          <p className={styles.mutedText}>
            No services yet. Add your first service, or run the seed script.
          </p>
        ) : (
          services.map((s) => (
            <div key={s.id} className={styles.card}>
              <div className={styles.imageWrap}>
                <Image
                  src={s.image}
                  alt={s.name}
                  fill
                  sizes="220px"
                  className={styles.image}
                />
                {!s.active && (
                  <div className={styles.inactiveOverlay}>Inactive</div>
                )}
              </div>
              <div className={styles.cardBody}>
                <h4 className={styles.name}>{s.name}</h4>
                <div className={styles.priceRow}>
                  <span>₹{s.price}</span>
                  <span className={styles.duration}>{s.duration}</span>
                </div>
                <div className={styles.actions}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => openEditModal(s)}
                  >
                    <Pencil size={13} /> Edit
                  </button>
                  <button
                    className="btn btn-sm"
                    onClick={() => toggleActive(s)}
                    style={{ background: "var(--color-bg)" }}
                  >
                    {s.active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(s.id)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {modalOpen && (
        <div className={styles.overlay} onClick={() => setModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.closeBtn}
              onClick={() => setModalOpen(false)}
            >
              <X size={20} />
            </button>
            <h3 className={styles.modalTitle}>
              {editingId ? "Edit Service" : "Add Service"}
            </h3>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Service Name</label>
                <input
                  className="form-input"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input
                  className="form-input"
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  required
                  placeholder="https://..."
                />
              </div>
              <div className={styles.row2}>
                <div className="form-group">
                  <label className="form-label">Price (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    required
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <input
                    className="form-input"
                    name="duration"
                    value={form.duration}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 30-45 min"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>

                <input
                  className="form-input"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  list="service-categories"
                  placeholder="e.g. Fan Services"
                  required
                />

                <datalist id="service-categories">
                  <option value="General" />

                  {[
                    ...new Set(
                      services
                        .map((service) => service.category?.trim())
                        .filter(Boolean),
                    ),
                  ].map((category) => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
              </div>

              <div className="form-group">
                <label className="form-label">Short Description</label>
                <input
                  className="form-input"
                  name="shortDescription"
                  value={form.shortDescription}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Full Description</label>
                <textarea
                  className="form-textarea"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  What's Included (one per line)
                </label>
                <textarea
                  className="form-textarea"
                  name="included"
                  value={form.included}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Important Notes (one per line)
                </label>
                <textarea
                  className="form-textarea"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.checkboxRow}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="popular"
                    checked={form.popular}
                    onChange={handleChange}
                  />{" "}
                  Mark as Popular
                </label>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="active"
                    checked={form.active}
                    onChange={handleChange}
                  />{" "}
                  Active
                </label>
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Service"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
