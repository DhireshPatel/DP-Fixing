"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, Plus, Check } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import styles from "./ServiceCard.module.css";

export default function ServiceCard({ service }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd(e) {
    e.preventDefault();
    e.stopPropagation();
    addItem(service, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <Link href={`/services/${service.id}`} className={styles.card}>
      <div className={styles.imageWrap}>
        <Image
          src={service.image}
          alt={service.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
          className={styles.image}
        />
        {service.popular && <span className={styles.popularBadge}>Popular</span>}
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>{service.name}</h3>
        <p className={styles.desc}>{service.shortDescription}</p>

        <div className={styles.meta}>
          <span className={styles.duration}>
            <Clock size={14} /> {service.duration}
          </span>
          <span className={styles.price}>₹{service.price}</span>
        </div>

        <button
          className={`btn ${added ? "btn-secondary" : "btn-primary"} btn-block ${styles.addBtn}`}
          onClick={handleAdd}
        >
          {added ? (
            <>
              <Check size={16} /> Added
            </>
          ) : (
            <>
              <Plus size={16} /> Add to Cart
            </>
          )}
        </button>
      </div>
    </Link>
  );
}
