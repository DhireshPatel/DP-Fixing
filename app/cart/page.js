"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import CartItem from "@/components/CartItem";
import styles from "./page.module.css";

export default function CartPage() {
  const { items, hydrated, subtotal, clearCart } = useCart();
  const [visitingFee, setVisitingFee] = useState(100);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.visitingFee != null) setVisitingFee(data.visitingFee);
      })
      .catch(() => {});
  }, []);

  const total = subtotal + visitingFee;

  if (!hydrated) return null;

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: "70px 20px" }}>
        <div className="empty-state">
          <ShoppingCart size={40} style={{ marginBottom: 16, opacity: 0.4 }} />
          <h2 style={{ marginBottom: 8 }}>Your cart is empty</h2>
          <p style={{ marginBottom: 24 }}>Browse our services and add what you need.</p>
          <Link href="/services" className="btn btn-primary">Browse Services</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "36px 20px 60px" }}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Your Cart</h1>
        <button className={styles.clearBtn} onClick={clearCart}>
          <Trash2 size={15} /> Clear Cart
        </button>
      </div>

      <div className={styles.layout}>
        <div className={`card ${styles.itemsCard}`}>
          {items.map((item) => (
            <CartItem key={item.serviceId} item={item} />
          ))}
        </div>

        <div className={`card ${styles.summaryCard}`}>
          <h3 className={styles.summaryTitle}>Order Summary</h3>

          <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>+ Visiting Fee</span>
            <span>₹{visitingFee}</span>
          </div>
          <div className={styles.divider} />
          <div className={`${styles.summaryRow} ${styles.totalRow}`}>
            <span>Total</span>
            <span>₹{total}</span>
          </div>

          <Link href="/checkout" className="btn btn-primary btn-block" style={{ marginTop: 20 }}>
            Book Service <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
