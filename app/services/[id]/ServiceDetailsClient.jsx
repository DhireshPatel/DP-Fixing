"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, Minus, Plus, CheckCircle2, Info, ArrowLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";
import styles from "./page.module.css";

export default function ServiceDetailsClient({ service }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(service, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="container" style={{ padding: "36px 20px 60px" }}>
      <Link href="/services" className={styles.backLink}>
        <ArrowLeft size={16} /> Back to Services
      </Link>

      <div className={styles.grid}>
        <div className={styles.imageWrap}>
          <Image
            src={service.image}
            alt={service.name}
            fill
            sizes="(max-width: 900px) 100vw, 500px"
            className={styles.image}
            priority
          />
        </div>

        <div className={styles.info}>
          <h1 className={styles.name}>{service.name}</h1>
          <div className={styles.metaRow}>
            <span className={styles.duration}><Clock size={15} /> {service.duration}</span>
            <span className={styles.price}>₹{service.price}</span>
          </div>

          <p className={styles.description}>{service.description}</p>

          {service.included?.length > 0 && (
            <div className={styles.block}>
              <h3 className={styles.blockTitle}>What's Included</h3>
              <ul className={styles.list}>
                {service.included.map((item, i) => (
                  <li key={i}><CheckCircle2 size={15} className={styles.checkIcon} /> {item}</li>
                ))}
              </ul>
            </div>
          )}

          {service.notes?.length > 0 && (
            <div className={styles.block}>
              <h3 className={styles.blockTitle}>Important Notes</h3>
              <ul className={styles.list}>
                {service.notes.map((item, i) => (
                  <li key={i}><Info size={15} className={styles.infoIcon} /> {item}</li>
                ))}
              </ul>
            </div>
          )}

          <div className={styles.addSection}>
            <div className={styles.qtyControls}>
              <button
                className={styles.qtyBtn}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Minus size={16} />
              </button>
              <span className={styles.qty}>{quantity}</span>
              <button
                className={styles.qtyBtn}
                onClick={() => setQuantity((q) => Math.min(20, q + 1))}
              >
                <Plus size={16} />
              </button>
            </div>

            <button
              className={`btn ${added ? "btn-secondary" : "btn-primary"} ${styles.addBtn}`}
              onClick={handleAdd}
            >
              {added ? "Added to Cart" : `Add to Cart — ₹${service.price * quantity}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
