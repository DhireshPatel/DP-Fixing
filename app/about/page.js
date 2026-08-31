import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Users, Clock, Award } from "lucide-react";
import styles from "./page.module.css";

const STATS = [
  // { icon: Users, label: "Happy Customers", value: "5,000+" },
  { icon: ShieldCheck, label: "Verified Electricians", value: "50+" },
  { icon: Clock, label: "Avg. Response Time", value: "60 min" },
  // { icon: Award, label: "Years of Service", value: "6+" },
];

export const metadata = { title: "About Us | DP Fixing" };

export default function AboutPage() {
  return (
    <div>
      <div className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>About DP Fixing</h1>
          <p className={styles.subtitle}>
            Reliable electrical services, delivered by verified professionals.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: "50px 20px" }}>
        <div className={styles.grid}>
          <div className={styles.imageWrap}>
            <Image
              src="/images/OwnerDP-Fixing.jpeg"
              alt="DP Fixing electrician team"
              fill
              sizes="(max-width: 860px) 100vw, 500px"
              className={styles.image}
            />
          </div>

          <div>
            <h2 className={styles.sectionHeading}>Who We Are</h2>
            <p className={styles.text}>
              DP Fixing is a local electrician service booking platform built to make
              electrical repairs, installations and maintenance simple, transparent and
              fast. We connect customers with verified, experienced electricians who
              show up on time and get the job done right.
            </p>
            <p className={styles.text}>
              From a single switch repair to a full wiring overhaul, our platform lets
              you browse services, see upfront pricing, and book a professional in
              minutes — no phone calls, no guesswork.
            </p>

            <h2 className={styles.sectionHeading}>Our Mission</h2>
            <p className={styles.text}>
              To make quality electrical services accessible to every household and
              business, with transparent pricing and dependable professionals at the
              doorstep.
            </p>

            <Link href="/services" className="btn btn-primary" style={{ marginTop: 12 }}>
              Explore Our Services
            </Link>
          </div>
        </div>

        <div className={styles.statsGrid}>
          {STATS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className={styles.statCard}>
                <div className={styles.statIcon}><Icon size={22} /></div>
                <div className={styles.statValue}>{s.value}</div>
                <div className={styles.statLabel}>{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
