"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Phone, MapPin, Mail } from "lucide-react";
import styles from "./Footer.module.css";

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>
              <Zap size={18} strokeWidth={2.5} />
            </span>
            DP Fixing
          </div>
          <p className={styles.text}>
            Trusted, doorstep electrician services — installations, repairs and
            maintenance done right the first time.
          </p>
        </div>

        <div>
          <h4 className={styles.heading}>Quick Links</h4>
          <ul className={styles.list}>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/services">Services</Link></li>
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className={styles.heading}>Contact</h4>
          <ul className={styles.list}>
            <li className={styles.iconRow}><Phone size={15} /> +91 8209783021</li>
            <li className={styles.iconRow}><Mail size={15} /> dhireshchoudhary03@gmail.com</li>
            <li className={styles.iconRow}><MapPin size={15} /> Jodhpur, Rajasthan, India</li>
          </ul>
        </div>

        <div>
          <h4 className={styles.heading}>Need an Electrician?</h4>
          <p className={styles.text}>Book a service now and we'll be at your door.</p>
          <Link href="/services" className="btn btn-primary">Book a Service Now</Link>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className="container">
          © {new Date().getFullYear()} DP Fixing. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
