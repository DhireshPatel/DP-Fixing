"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingCart, Zap } from "lucide-react";
import { useCart } from "@/context/CartContext";
import styles from "./Navbar.module.css";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { totalItems } = useCart();

  if (pathname?.startsWith("/admin")) return null;

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.logo} onClick={() => setOpen(false)}>
          <span className={styles.logoIcon}>
            <Zap size={20} strokeWidth={2.5} />
          </span>
          <span>
            DP <span className={styles.logoAccent}>Fixing</span>
          </span>
        </Link>

        <nav className={`${styles.nav} ${open ? styles.navOpen : ""}`}>
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${pathname === link.href ? styles.navLinkActive : ""}`}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/cart" className={styles.mobileCart} onClick={() => setOpen(false)}>
            <ShoppingCart size={18} />
            Cart {totalItems > 0 && `(${totalItems})`}
          </Link>
        </nav>

        <div className={styles.actions}>
          <Link href="/cart" className={styles.cartBtn}>
            <ShoppingCart size={22} />
            {totalItems > 0 && <span className={styles.cartBadge}>{totalItems}</span>}
          </Link>
          <Link href="/services" className={`btn btn-primary ${styles.ctaDesktop}`}>
            Book a Service
          </Link>
          <button
            className={styles.menuBtn}
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
}
