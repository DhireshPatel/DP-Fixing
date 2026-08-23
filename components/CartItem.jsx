"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import styles from "./CartItem.module.css";

export default function CartItem({ item }) {
  const { increaseQuantity, decreaseQuantity, removeItem } = useCart();

  return (
    <div className={styles.row}>
      <div className={styles.imageWrap}>
        <Image src={item.image} alt={item.name} fill sizes="90px" className={styles.image} />
      </div>

      <div className={styles.info}>
        <h4 className={styles.name}>{item.name}</h4>
        <p className={styles.price}>
          ₹{item.price} × {item.quantity} = <strong>₹{item.price * item.quantity}</strong>
        </p>
      </div>

      <div className={styles.qtyControls}>
        <button
          className={styles.qtyBtn}
          onClick={() => decreaseQuantity(item.serviceId)}
          aria-label="Decrease quantity"
        >
          <Minus size={14} />
        </button>
        <span className={styles.qty}>{item.quantity}</span>
        <button
          className={styles.qtyBtn}
          onClick={() => increaseQuantity(item.serviceId)}
          aria-label="Increase quantity"
        >
          <Plus size={14} />
        </button>
      </div>

      <button
        className={styles.removeBtn}
        onClick={() => removeItem(item.serviceId)}
        aria-label="Remove item"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}
