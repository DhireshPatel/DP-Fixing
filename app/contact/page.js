"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import styles from "./page.module.css";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    // This is a simple contact form; for actual service bookings,
    // customers use the Services -> Cart -> Checkout flow.
    setSent(true);
  }

  return (
    <div>
      <div className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>Contact Us</h1>
          <p className={styles.subtitle}>
            Have a question? Reach out and our team will get back to you
            shortly.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: "50px 20px" }}>
        <div className={styles.grid}>
          <div className={styles.infoList}>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>
                <Phone size={18} />
              </div>
              <div>
                <div className={styles.infoLabel}>Phone</div>
                <div className={styles.infoValue}> +91 8209783021</div>
              </div>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>
                <Mail size={18} />
              </div>
              <div>
                <div className={styles.infoLabel}>Email</div>
                <div className={styles.infoValue}>dhireshchoudhary03@gmail.com</div>
              </div>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>
                <MapPin size={18} />
              </div>
              <div>
                <div className={styles.infoLabel}>Service Area</div>
                <div className={styles.infoValue}>
                  Jodhpur, Rajasthan & nearby
                </div>
              </div>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>
                <Clock size={18} />
              </div>
              <div>
                <div className={styles.infoLabel}>Working Hours</div>
                <div className={styles.infoValue}>
                  8:00 AM – 8:00 PM, all days
                </div>
              </div>
            </div>
          </div>

          <div className={`card ${styles.formCard}`}>
            {sent ? (
              <div className="success-banner">
                Thanks for reaching out! We'll get back to you shortly.
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Your Name</label>
                  <input
                    className="form-input"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    className="form-input"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea
                    className="form-textarea"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-block">
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
