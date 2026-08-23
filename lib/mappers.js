/**
 * Supabase/Postgres stores columns in snake_case. The rest of the app
 * (components, contexts, admin pages) expects the same camelCase shape
 * that was used previously. These mappers translate DB rows <-> app
 * objects in one place so routes stay simple.
 */

export function mapService(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    shortDescription: row.short_description,
    image: row.image,
    price: Number(row.price),
    duration: row.duration,
    category: row.category,
    included: row.included || [],
    notes: row.notes || [],
    active: row.active,
    popular: row.popular,
    order: row.order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapServiceMan(row, servicesLookup) {
  if (!row) return null;
  const serviceIds = row.services || [];
  const servicesResolved = servicesLookup
    ? serviceIds.map((id) => ({
        id,
        name: servicesLookup.get(id)?.name || "Unknown Service",
      }))
    : serviceIds;

  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    address: row.address,
    city: row.city,
    state: row.state,
    pincode: row.pincode,
    latitude: row.latitude,
    longitude: row.longitude,
    services: servicesResolved,
    workingDays: row.working_days || [],
    workingHours: row.working_hours || { start: "09:00", end: "19:00" },
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapBooking(row) {
  if (!row) return null;
  return {
    id: row.id,
    bookingId: row.booking_id,
    customerName: row.customer_name,
    phone: row.phone,
    address: row.address,
    city: row.city,
    state: row.state,
    pincode: row.pincode,
    latitude: row.latitude,
    longitude: row.longitude,
    locationAccuracy: row.location_accuracy,
    locationSource: row.location_source,
    services: row.services || [],
    subtotal: Number(row.subtotal),
    visitingFee: Number(row.visiting_fee),
    totalAmount: Number(row.total_amount),
    preferredDate: row.preferred_date,
    preferredTimeSlot: row.preferred_time_slot,
    timezone: row.timezone,
    notes: row.notes,
    status: row.status,
    assignedServiceMan: row.assigned_service_man,
    assignedServiceManName: row.assigned_service_man_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapSettings(row) {
  if (!row) return null;
  return {
    id: row.id,
    visitingFee: Number(row.visiting_fee),
    serviceAreas: row.service_areas || [],
    workingHours: row.working_hours || { start: "08:00", end: "20:00" },
    timeSlots: row.time_slots || [],
    businessPhone: row.business_phone,
    telegramEnabled: row.telegram_enabled,
    serviceAvailable: row.service_available,
  };
}

/** Converts camelCase settings fields (from the admin UI) into DB columns. */
export function unmapSettingsInput(body) {
  const update = {};
  if (body.visitingFee !== undefined) update.visiting_fee = body.visitingFee;
  if (body.serviceAreas !== undefined) update.service_areas = body.serviceAreas;
  if (body.workingHours !== undefined) update.working_hours = body.workingHours;
  if (body.timeSlots !== undefined) update.time_slots = body.timeSlots;
  if (body.businessPhone !== undefined) update.business_phone = body.businessPhone;
  if (body.telegramEnabled !== undefined) update.telegram_enabled = body.telegramEnabled;
  if (body.serviceAvailable !== undefined) update.service_available = body.serviceAvailable;
  return update;
}

/** Converts camelCase service fields (from the admin UI) into DB columns. */
export function unmapServiceInput(body) {
  const update = {};
  const fieldMap = {
    name: "name",
    description: "description",
    shortDescription: "short_description",
    image: "image",
    price: "price",
    duration: "duration",
    category: "category",
    included: "included",
    notes: "notes",
    active: "active",
    popular: "popular",
    order: "order",
  };
  for (const [camel, snake] of Object.entries(fieldMap)) {
    if (body[camel] !== undefined) update[snake] = body[camel];
  }
  return update;
}

/** Converts camelCase service-man fields (from the admin UI) into DB columns. */
export function unmapServiceManInput(body) {
  const update = {};
  const fieldMap = {
    name: "name",
    phone: "phone",
    address: "address",
    city: "city",
    state: "state",
    pincode: "pincode",
    latitude: "latitude",
    longitude: "longitude",
    services: "services",
    workingDays: "working_days",
    workingHours: "working_hours",
    active: "active",
  };
  for (const [camel, snake] of Object.entries(fieldMap)) {
    if (body[camel] !== undefined) update[snake] = body[camel];
  }
  return update;
}
