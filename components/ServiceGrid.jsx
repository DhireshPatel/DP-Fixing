import ServiceCard from "./ServiceCard";
import styles from "./ServiceGrid.module.css";

export default function ServiceGrid({ services }) {
  if (!services || services.length === 0) {
    return <div className="empty-state">No services available right now.</div>;
  }

  return (
    <div className={styles.grid}>
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}
