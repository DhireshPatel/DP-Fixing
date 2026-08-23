import { getSupabaseAdmin, TABLES } from "@/lib/supabase";
import { mapService } from "@/lib/mappers";
import ServiceGrid from "@/components/ServiceGrid";
import styles from "./page.module.css";

async function getServices() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from(TABLES.SERVICES)
      .select("*")
      .eq("active", true)
      .order("order", { ascending: true });

    if (error) throw error;
    return data.map(mapService);
  } catch (err) {
    console.error("Failed to load services:", err);
    return [];
  }
}

export const metadata = {
  title: "Our Services | DP Fixing",
};

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>Our Electrician Services</h1>
          <p className={styles.subtitle}>
            Verified professionals for every electrical need — installations, repairs
            and maintenance, priced clearly upfront.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: "40px 20px" }}>
        <ServiceGrid services={services} />
      </div>
    </div>
  );
}
