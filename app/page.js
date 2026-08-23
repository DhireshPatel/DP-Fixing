import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Tag,
  Zap as ZapIcon,
  Home as HomeIcon,
  MousePointerClick,
  ShoppingCart,
  User,
  CalendarClock,
  Wrench,
  Star,
} from "lucide-react";
import { getSupabaseAdmin, TABLES } from "@/lib/supabase";
import { mapService } from "@/lib/mappers";
import ServiceGrid from "@/components/ServiceGrid";
import styles from "./page.module.css";

async function getPopularServices() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from(TABLES.SERVICES)
      .select("*")
      .eq("active", true)
      .eq("popular", true)
      .order("order", { ascending: true })
      .limit(8);

    if (error) throw error;
    return data.map(mapService);
  } catch (err) {
    console.error("Failed to load popular services:", err);
    return [];
  }
}

const WHY_CHOOSE_US = [
  { icon: ShieldCheck, title: "Verified Professionals", text: "Every electrician is background-checked and trained." },
  { icon: Tag, title: "Transparent Pricing", text: "Know the exact price before you book — no surprises." },
  { icon: ZapIcon, title: "Fast Response", text: "Same-day service across your local area." },
  { icon: HomeIcon, title: "Doorstep Service", text: "Our electricians come straight to your home or office." },
  { icon: MousePointerClick, title: "Easy Booking", text: "Book in under a minute — no account required." },
];

const HOW_IT_WORKS = [
  { icon: Wrench, title: "Choose a Service" },
  { icon: ShoppingCart, title: "Add to Cart" },
  { icon: User, title: "Enter Contact Details" },
  { icon: CalendarClock, title: "Select Location & Time" },
  { icon: ZapIcon, title: "Electrician Visits You" },
];

const TESTIMONIALS = [
  { name: "Priya Sharma", city: "Jodhpur", text: "Booked a fan installation in the morning and it was done by evening. Very professional service." },
  { name: "Rohit Verma", city: "Jaipur", text: "Transparent pricing and the electrician arrived right on time. Highly recommend DP Fixing." },
  { name: "Sunita Rathi", city: "Jodhpur", text: "Fixed our short circuit issue quickly and explained everything clearly. Great experience." },
];

export default async function HomePage() {
  const popularServices = await getPopularServices();

  return (
    <div>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroText}>
            <span className={styles.heroTag}>Trusted Local Electricians</span>
            <h1 className={styles.heroTitle}>
              Professional Electrician Services at Your Doorstep
            </h1>
            <p className={styles.heroSubtitle}>
              Book trusted electricians for electrical repairs, installations and
              maintenance.
            </p>
            <div className={styles.heroActions}>
              <Link href="/services" className="btn btn-primary">Book a Service</Link>
              <Link href="/services" className="btn btn-secondary">View Services</Link>
            </div>
          </div>

          <div className={styles.heroImageWrap}>
            <Image
              src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=900&q=80"
              alt="Professional electrician at work"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 500px"
              className={styles.heroImage}
            />
          </div>
        </div>
      </section>

      {/* AVAILABILITY STRIP */}
      <section className={styles.availability}>
        <div className={`container ${styles.availabilityInner}`}>
          <div><strong>Currently serving</strong> Jodhpur & nearby areas</div>
          <div className={styles.dot} />
          <div><strong>Response time</strong> Usually within 60 minutes</div>
          <div className={styles.dot} />
          <div><strong>Support</strong> 8:00 AM – 8:00 PM, all days</div>
        </div>
      </section>

      {/* POPULAR SERVICES */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Popular Services</h2>
          <p className="section-subtitle">
            Our most booked electrical services, done right by verified professionals.
          </p>
          {popularServices.length > 0 ? (
            <ServiceGrid services={popularServices} />
          ) : (
            <div className="empty-state">
              Popular services will appear here once added from the admin panel.
            </div>
          )}
          <div style={{ textAlign: "center", marginTop: 36 }}>
            <Link href="/services" className="btn btn-secondary">View All Services</Link>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className={`section ${styles.whyChoose}`}>
        <div className="container">
          <h2 className="section-title">Why Choose DP Fixing</h2>
          <p className="section-subtitle">
            We make electrical work simple, safe and stress-free.
          </p>
          <div className={styles.whyGrid}>
            {WHY_CHOOSE_US.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className={styles.whyCard}>
                  <div className={styles.whyIcon}><Icon size={22} /></div>
                  <h3 className={styles.whyTitle}>{item.title}</h3>
                  <p className={styles.whyText}>{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Booking an electrician has never been easier.</p>
          <div className={styles.stepsGrid}>
            {HOW_IT_WORKS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className={styles.stepCard}>
                  <div className={styles.stepNumber}>{idx + 1}</div>
                  <div className={styles.stepIcon}><Icon size={22} /></div>
                  <p className={styles.stepTitle}>{step.title}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */} 
      {/* This section is for customer reviews */}
      {/* <section className={`section ${styles.testimonials}`}>
        <div className="container">
          <h2 className="section-title">What Our Customers Say</h2>
          <div className={styles.testimonialGrid}>
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className={styles.testimonialCard}>
                <div className={styles.stars}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={15} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <p className={styles.testimonialText}>"{t.text}"</p>
                <div className={styles.testimonialAuthor}>{t.name} — {t.city}</div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className="container">
          <h2 className={styles.ctaTitle}>Need an Electrician?</h2>
          <p className={styles.ctaSubtitle}>
            Get a verified electrician at your doorstep, today.
          </p>
          <Link href="/services" className="btn btn-primary">Book a Service Now</Link>
        </div>
      </section>
    </div>
  );
}
