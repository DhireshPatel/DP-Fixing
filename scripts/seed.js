/**
 * Seed script: populates the Supabase database with the full DP Fixing
 * service catalog and creates a bootstrap admin account.
 *
 * Prerequisites:
 *   1. Run supabase/schema.sql in your Supabase project's SQL editor first.
 *   2. Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL,
 *      ADMIN_PASSWORD in .env.local
 *
 * Usage:
 *   npm run seed
 */
require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const bcrypt = require("bcryptjs");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL || "admin@dpfixing.com"
).toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "ChangeMe123!";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const FAN_IMG =
  "https://images.unsplash.com/photo-1596205244019-53f2fc0adae5?w=700&q=80";
const LIGHT_IMG =
  "https://images.unsplash.com/photo-1565636192335-e79f9c9d5b58?w=700&q=80";
const SWITCH_IMG =
  "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=700&q=80";
const WIRING_IMG =
  "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=700&q=80";
const PANEL_IMG =
  "https://images.unsplash.com/photo-1558449028-b53a39d100fc?w=700&q=80";
const INVERTER_IMG =
  "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=700&q=80";
const APPLIANCE_IMG =
  "https://images.unsplash.com/photo-1610557892470-55d587e8f1cd?w=700&q=80";
const DOORBELL_IMG =
  "https://images.unsplash.com/photo-1558002038-1055907df827?w=700&q=80";
const CCTV_IMG =
  "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=700&q=80";
const METER_IMG =
  "https://images.unsplash.com/photo-1621905252507-a2a4b56b9a1f?w=700&q=80";
const INSPECTION_IMG =
  "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=700&q=80";

const SERVICES = [
  {
    name: "Fan Installation",
    image: FAN_IMG,
    price: 299,
    duration: "30-45 min",
    popular: true,
    shortDescription: "Professional ceiling fan installation.",
    description:
      "Our certified electricians will safely mount and wire your new ceiling fan, ensuring secure fitting and correct electrical connections.",
    included: [
      "Fan mounting and balancing",
      "Wiring and switch connection",
      "Safety testing",
    ],
    notes: [
      "Fan unit to be provided by customer",
      "Ceiling must have existing wiring point",
    ],
  },
  {
    name: "Fan Repair",
    image: FAN_IMG,
    price: 199,
    duration: "20-40 min",
    popular: true,
    shortDescription: "Diagnose and fix noisy or non-working fans.",
    description:
      "We diagnose common fan issues such as wobbling, unusual noise, or complete failure to start, and carry out the necessary repair.",
    included: ["Diagnosis", "Capacitor/bearing check", "Testing after repair"],
    notes: ["Spare parts charged separately if required"],
  },
  {
    name: "Ceiling Fan Installation",
    image: FAN_IMG,
    price: 349,
    duration: "30-50 min",
    shortDescription: "Complete ceiling fan setup with regulator.",
    description:
      "Full ceiling fan installation including regulator wiring and secure ceiling mount for smooth, safe operation.",
    included: ["Mounting bracket fitting", "Regulator wiring", "Balancing"],
    notes: ["Ladder access to ceiling required"],
  },
  {
    name: "Exhaust Fan Installation",
    image: FAN_IMG,
    price: 249,
    duration: "25-40 min",
    shortDescription: "Bathroom/kitchen exhaust fan setup.",
    description:
      "Installation of exhaust fans in kitchens or bathrooms including wall/window cutting support and wiring.",
    included: ["Mounting", "Wiring", "Ventilation check"],
    notes: ["Wall cutting charged extra if needed"],
  },
  {
    name: "Light Installation",
    image: LIGHT_IMG,
    price: 149,
    duration: "15-30 min",
    popular: true,
    shortDescription: "Installation of ceiling or wall light fixtures.",
    description:
      "Safe and neat installation of your light fixtures with proper wiring and switch testing.",
    included: ["Fixture mounting", "Wiring", "Switch testing"],
    notes: ["Light fixture to be provided by customer"],
  },
  {
    name: "LED Light Installation",
    image: LIGHT_IMG,
    price: 179,
    duration: "15-30 min",
    shortDescription: "LED panel and strip light installation.",
    description:
      "Installation of LED panels, strip lights or bulbs with correct driver wiring for long-lasting performance.",
    included: ["Mounting", "Driver wiring", "Testing"],
    notes: [],
  },
  {
    name: "Tube Light Installation",
    image: LIGHT_IMG,
    price: 129,
    duration: "15-25 min",
    shortDescription: "Tube light and choke fitting.",
    description:
      "Fitting of tube lights including choke/starter replacement where needed.",
    included: ["Fitting", "Choke check", "Testing"],
    notes: [],
  },
  {
    name: "Switch Repair",
    image: SWITCH_IMG,
    price: 99,
    duration: "10-20 min",
    popular: true,
    shortDescription: "Fix faulty or sparking switches.",
    description:
      "Repair of loose, sparking or non-functional switches to restore safe operation.",
    included: ["Diagnosis", "Repair/tightening", "Safety check"],
    notes: [],
  },
  {
    name: "Switch Installation",
    image: SWITCH_IMG,
    price: 149,
    duration: "15-25 min",
    shortDescription: "New switch board installation.",
    description:
      "Installation of new switches or switch boards with proper wiring.",
    included: ["Board mounting", "Wiring", "Testing"],
    notes: [],
  },
  {
    name: "Socket Repair",
    image: SWITCH_IMG,
    price: 99,
    duration: "10-20 min",
    shortDescription: "Fix loose or non-working power sockets.",
    description:
      "Repair of power sockets that are loose, sparking, or not supplying power.",
    included: ["Diagnosis", "Repair", "Testing"],
    notes: [],
  },
  {
    name: "Socket Installation",
    image: SWITCH_IMG,
    price: 179,
    duration: "15-30 min",
    shortDescription: "New power socket installation.",
    description:
      "Installation of new 5A/15A power sockets at your desired location.",
    included: ["Mounting", "Wiring", "Load testing"],
    notes: [],
  },
  {
    name: "Wiring Repair",
    image: WIRING_IMG,
    price: 349,
    duration: "45-90 min",
    popular: true,
    shortDescription: "Fix damaged or faulty home wiring.",
    description:
      "Identification and repair of damaged, worn-out or unsafe electrical wiring in your home.",
    included: [
      "Fault diagnosis",
      "Rewiring of affected section",
      "Safety testing",
    ],
    notes: ["Final cost depends on extent of damage"],
  },
  {
    name: "New Wiring",
    image: WIRING_IMG,
    price: 1499,
    duration: "3-6 hours",
    shortDescription: "Fresh electrical wiring for rooms or homes.",
    description:
      "Complete new wiring setup for a room, floor, or entire home, following safety standards.",
    included: [
      "Wiring layout planning",
      "Cable laying",
      "Testing & certification",
    ],
    notes: [
      "Price varies based on area covered; quote confirmed after site visit",
    ],
  },
  {
    name: "Short Circuit Repair",
    image: WIRING_IMG,
    price: 299,
    duration: "30-60 min",
    popular: true,
    shortDescription: "Urgent short-circuit diagnosis and fix.",
    description:
      "Fast diagnosis and repair of short-circuit issues to restore power safely.",
    included: ["Fault tracing", "Repair", "Safety testing"],
    notes: ["Emergency visits may have additional charges"],
  },
  {
    name: "MCB Installation",
    image: PANEL_IMG,
    price: 349,
    duration: "30-45 min",
    shortDescription: "Install new MCB in your distribution board.",
    description:
      "Installation of Miniature Circuit Breakers (MCB) for improved safety and load management.",
    included: ["MCB fitting", "Wiring", "Load testing"],
    notes: ["MCB unit cost may be additional"],
  },
  {
    name: "MCB Repair",
    image: PANEL_IMG,
    price: 199,
    duration: "20-40 min",
    shortDescription: "Fix tripping or faulty MCBs.",
    description:
      "Diagnosis and repair of MCBs that trip frequently or fail to reset.",
    included: ["Diagnosis", "Repair/replacement", "Testing"],
    notes: [],
  },
  {
    name: "Fuse Repair",
    image: PANEL_IMG,
    price: 149,
    duration: "15-30 min",
    shortDescription: "Replace blown fuses safely.",
    description:
      "Safe replacement and repair of blown fuses in your main panel.",
    included: ["Diagnosis", "Fuse replacement", "Testing"],
    notes: [],
  },
  {
    name: "Inverter Installation",
    image: INVERTER_IMG,
    price: 599,
    duration: "1-2 hours",
    shortDescription: "Home inverter setup and wiring.",
    description:
      "Complete installation of your home inverter including wiring to selected circuits.",
    included: ["Mounting", "Wiring", "Load testing"],
    notes: ["Inverter unit to be provided by customer"],
  },
  {
    name: "Inverter Repair",
    image: INVERTER_IMG,
    price: 349,
    duration: "30-60 min",
    shortDescription: "Diagnose and fix inverter issues.",
    description:
      "Troubleshooting and repair of inverter units that are not charging or supplying backup power.",
    included: ["Diagnosis", "Repair", "Testing"],
    notes: [],
  },
  {
    name: "Inverter Battery Replacement",
    image: INVERTER_IMG,
    price: 249,
    duration: "30-45 min",
    shortDescription: "Safe replacement of inverter batteries.",
    description:
      "Removal of old battery and safe installation of a new inverter battery with connection testing.",
    included: ["Old battery removal", "New battery fitting", "Testing"],
    notes: ["Battery cost is separate"],
  },
  {
    name: "AC Electrical Connection",
    image: APPLIANCE_IMG,
    price: 399,
    duration: "45-75 min",
    shortDescription: "Dedicated electrical point for AC units.",
    description:
      "Setup of a dedicated, safe electrical connection point for your air conditioner.",
    included: ["Point wiring", "MCB check", "Load testing"],
    notes: [],
  },
  {
    name: "Geyser Electrical Connection",
    image: APPLIANCE_IMG,
    price: 249,
    duration: "30-45 min",
    shortDescription: "Safe wiring for water heaters/geysers.",
    description:
      "Dedicated wiring and safety connection for your geyser to prevent overload issues.",
    included: ["Wiring", "Earthing check", "Testing"],
    notes: [],
  },
  {
    name: "Refrigerator Electrical Repair",
    image: APPLIANCE_IMG,
    price: 299,
    duration: "30-60 min",
    shortDescription: "Fix electrical faults in refrigerators.",
    description:
      "Diagnosis and repair of electrical faults affecting your refrigerator's power supply.",
    included: ["Diagnosis", "Repair", "Testing"],
    notes: ["Compressor/mechanical issues not covered"],
  },
  {
    name: "Washing Machine Electrical Connection",
    image: APPLIANCE_IMG,
    price: 249,
    duration: "30-45 min",
    shortDescription: "Safe power point setup for washing machines.",
    description:
      "Setup of a safe, earthed electrical point for your washing machine.",
    included: ["Point wiring", "Earthing check", "Testing"],
    notes: [],
  },
  {
    name: "Doorbell Installation",
    image: DOORBELL_IMG,
    price: 149,
    duration: "20-30 min",
    shortDescription: "Wired or wireless doorbell setup.",
    description:
      "Installation of your doorbell unit with clean wiring and button placement.",
    included: ["Mounting", "Wiring", "Testing"],
    notes: [],
  },
  {
    name: "CCTV Power Connection",
    image: CCTV_IMG,
    price: 249,
    duration: "30-45 min",
    shortDescription: "Dedicated power wiring for CCTV systems.",
    description:
      "Setup of dedicated, stable power connections for your CCTV cameras and DVR.",
    included: ["Power wiring", "Cable routing", "Testing"],
    notes: ["Camera installation itself not included"],
  },
  {
    name: "Meter Related Electrical Work",
    image: METER_IMG,
    price: 349,
    duration: "45-60 min",
    shortDescription: "Support with meter wiring and connections.",
    description:
      "Assistance with electrical wiring related to your utility meter connection point.",
    included: ["Wiring check", "Connection support", "Safety testing"],
    notes: ["Utility approvals to be arranged by customer"],
  },
  {
    name: "Main Board Repair",
    image: PANEL_IMG,
    price: 449,
    duration: "45-90 min",
    shortDescription: "Repair of main electrical distribution board.",
    description:
      "Diagnosis and repair of issues in your home's main electrical board for safe power distribution.",
    included: ["Diagnosis", "Repair", "Load testing"],
    notes: [],
  },
  {
    name: "Distribution Board Work",
    image: PANEL_IMG,
    price: 549,
    duration: "1-2 hours",
    shortDescription: "Setup or upgrade of distribution boards.",
    description:
      "Installation or upgrade of distribution boards for better circuit management and safety.",
    included: ["Board installation/upgrade", "Wiring", "Testing"],
    notes: [],
  },
  {
    name: "General Electrical Inspection",
    image: INSPECTION_IMG,
    price: 199,
    duration: "30-45 min",
    popular: true,
    shortDescription: "Full home electrical safety check-up.",
    description:
      "A comprehensive inspection of your home's wiring, switches, sockets and panel for safety issues.",
    included: ["Full inspection", "Written report", "Recommendations"],
    notes: [],
  },
];

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function run() {
  console.log("Connected to Supabase:", SUPABASE_URL);

  // --- Seed services ---
  const { data: existingServices, error: fetchError } = await supabase
    .from("services")
    .select("slug");
  if (fetchError) throw fetchError;

  const existingSlugs = new Set((existingServices || []).map((s) => s.slug));

  const rowsToInsert = SERVICES.map((s, i) => {
    const slug = slugify(s.name);
    if (existingSlugs.has(slug)) return null;
    return {
      name: s.name,
      slug,
      description: s.description,
      short_description: s.shortDescription,
      image: s.image,
      price: s.price,
      duration: s.duration,
      category: "General",
      included: s.included,
      notes: s.notes,
      popular: !!s.popular,
      active: true,
      order: i,
    };
  }).filter(Boolean);

  if (rowsToInsert.length > 0) {
    const { error: insertError } = await supabase
      .from("services")
      .insert(rowsToInsert);
    if (insertError) throw insertError;
  }
  console.log(
    `Seeded ${rowsToInsert.length} new services (${SERVICES.length - rowsToInsert.length} already existed).`,
  );

  // --- Seed admin ---
  const { data: existingAdmin, error: adminFetchError } = await supabase
    .from("admins")
    .select("id")
    .eq("email", ADMIN_EMAIL)
    .maybeSingle();
  if (adminFetchError) throw adminFetchError;

  // if (!existingAdmin) {
  //   const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  //   const { error: adminInsertError } = await supabase
  //     .from("admins")
  //     .insert({
  //       email: ADMIN_EMAIL,
  //       password_hash: passwordHash,
  //       name: "Admin",
  //     });
  //   if (adminInsertError) throw adminInsertError;
  //   console.log(`Created admin account: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  // } else {
  //   console.log(`Admin account already exists: ${ADMIN_EMAIL}`);
  // }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  if (!existingAdmin) {
    const { error: adminInsertError } = await supabase.from("admins").insert({
      email: ADMIN_EMAIL,
      password_hash: passwordHash,
      name: "Admin",
    });

    if (adminInsertError) throw adminInsertError;

    console.log(`Created admin account: ${ADMIN_EMAIL}`);
  } else {
    const { error: adminUpdateError } = await supabase
      .from("admins")
      .update({
        password_hash: passwordHash,
        name: "Admin",
      })
      .eq("email", ADMIN_EMAIL);

    if (adminUpdateError) throw adminUpdateError;

    console.log(`Updated admin password: ${ADMIN_EMAIL}`);
  }

  // --- Seed default settings ---
  // supabase/schema.sql already inserts a bare "main" settings row, so
  // here we just fill in sensible defaults (visiting fee, service area,
  // time slots) if that row still has an empty service_areas array.
  const { data: existingSettings, error: settingsFetchError } = await supabase
    .from("settings")
    .select("*")
    .eq("singleton_key", "main")
    .maybeSingle();
  if (settingsFetchError) throw settingsFetchError;

  const defaults = {
    visiting_fee: 299,
    service_areas: [
      {
        name: "Jodhpur City",
        latitude: 26.2389,
        longitude: 73.0243,
        radiusKm: 20,
      },
    ],
    working_hours: { start: "08:00", end: "20:00" },
    time_slots: [
      "8:00 AM - 10:00 AM",
      "10:00 AM - 12:00 PM",
      "12:00 PM - 2:00 PM",
      "2:00 PM - 4:00 PM",
      "4:00 PM - 6:00 PM",
      "6:00 PM - 8:00 PM",
    ],
    business_phone: "+918209783021",
    telegram_enabled: true,
    service_available: true,
  };

  if (!existingSettings) {
    const { error: settingsInsertError } = await supabase
      .from("settings")
      .insert({ singleton_key: "main", ...defaults });
    if (settingsInsertError) throw settingsInsertError;
    console.log(
      "Created default settings (visiting fee ₹299, Jodhpur service area 20km).",
    );
  } else if (
    !existingSettings.service_areas ||
    existingSettings.service_areas.length === 0
  ) {
    const { error: settingsUpdateError } = await supabase
      .from("settings")
      .update(defaults)
      .eq("singleton_key", "main");
    if (settingsUpdateError) throw settingsUpdateError;
    console.log(
      "Filled in default settings (visiting fee ₹299, Jodhpur service area 20km).",
    );
  } else {
    console.log("Settings already configured — skipped.");
  }

  console.log("Seeding complete.");
}

run().catch((err) => {
  console.error("Seed script failed:", err);
  process.exit(1);
});
