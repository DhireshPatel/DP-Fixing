export function isValidPhone(phone) {
  if (!phone) return false;
  const digits = String(phone).replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 13;
}

export function isValidName(name) {
  return typeof name === "string" && name.trim().length >= 2;
}

export function isValidLatLng(lat, lng) {
  const la = Number(lat);
  const ln = Number(lng);
  if (Number.isNaN(la) || Number.isNaN(ln)) return false;
  return la >= -90 && la <= 90 && ln >= -180 && ln <= 180;
}

export function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export const TIME_SLOTS = [
  "8:00 AM - 10:00 AM",
  "10:00 AM - 12:00 PM",
  "12:00 PM - 2:00 PM",
  "2:00 PM - 4:00 PM",
  "4:00 PM - 6:00 PM",
  "6:00 PM - 8:00 PM",
];

export function isValidTimeSlot(slot) {
  return TIME_SLOTS.includes(slot);
}

export function isValidDate(dateStr) {
  if (!isNonEmptyString(dateStr)) return false;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  // Must not be in the past (compare by date only)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d >= today;
}
