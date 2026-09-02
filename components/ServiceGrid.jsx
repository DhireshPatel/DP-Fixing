// import ServiceCard from "./ServiceCard";
// import styles from "./ServiceGrid.module.css";

// export default function ServiceGrid({ services }) {
//   if (!services || services.length === 0) {
//     return <div className="empty-state">No services available right now.</div>;
//   }

//   return (
//     <div className={styles.grid}>
//       {services.map((service) => (
//         <ServiceCard key={service.id} service={service} />
//       ))}
//     </div>
//   );
// }

// new (for category wise)

// "use client";

// import { useMemo, useState } from "react";
// import ServiceCard from "./ServiceCard";
// import styles from "./ServiceGrid.module.css";

// export default function ServiceGrid({ services }) {
//   const [selectedCategory, setSelectedCategory] = useState("All");

//   const categories = useMemo(() => {
//     const uniqueCategories = [
//       ...new Set(
//         services.map((service) => service.category?.trim()).filter(Boolean),
//       ),
//     ];

//     return ["All", ...uniqueCategories];
//   }, [services]);

//   const filteredServices =
//     selectedCategory === "All"
//       ? services
//       : services.filter(
//           (service) => service.category?.trim() === selectedCategory,
//         );

//   if (!services || services.length === 0) {
//     return <div className="empty-state">No services available right now.</div>;
//   }

//   return (
//     <div>
//       {/* Category Tabs */}
//       <div className={styles.categoryTabs}>
//         {categories.map((category) => (
//           <button
//             key={category}
//             type="button"
//             className={`${styles.categoryTab} ${
//               selectedCategory === category ? styles.activeTab : ""
//             }`}
//             onClick={() => setSelectedCategory(category)}
//           >
//             {category}
//           </button>
//         ))}
//       </div>

//       {/* Services */}
//       <div className={styles.grid}>
//         {filteredServices.map((service) => (
//           <ServiceCard key={service.id} service={service} />
//         ))}
//       </div>

//       {filteredServices.length === 0 && (
//         <div className="empty-state">
//           No services available in this category.
//         </div>
//       )}
//     </div>
//   );
// }

// new
"use client";

import { useMemo, useState } from "react";
import ServiceCard from "./ServiceCard";
import styles from "./ServiceGrid.module.css";

export default function ServiceGrid({ services }) {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(
        services.map((service) => service.category?.trim()).filter(Boolean),
      ),
    ];

    return uniqueCategories;
  }, [services]);

  const visibleCategories =
    selectedCategory === "All"
      ? categories
      : categories.filter((category) => category === selectedCategory);

  if (!services || services.length === 0) {
    return <div className="empty-state">No services available right now.</div>;
  }

  return (
    <div>
      {/* Category Tabs */}
      <div className={styles.categoryTabs}>
        <button
          type="button"
          className={`${styles.categoryTab} ${
            selectedCategory === "All" ? styles.activeTab : ""
          }`}
          onClick={() => setSelectedCategory("All")}
        >
          All
        </button>

        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={`${styles.categoryTab} ${
              selectedCategory === category ? styles.activeTab : ""
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Category Sections */}
      {visibleCategories.map((category) => {
        const categoryServices = services.filter(
          (service) => service.category?.trim() === category,
        );

        if (categoryServices.length === 0) return null;

        return (
          <section key={category} className={styles.categorySection}>
            <div className={styles.categoryHeader}>
              <h2>{category}</h2>
            </div>

            <div className={styles.grid}>
              {categoryServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </section>
        );
      })}

      {visibleCategories.length === 0 && (
        <div className="empty-state">
          No services available in this category.
        </div>
      )}
    </div>
  );
}
