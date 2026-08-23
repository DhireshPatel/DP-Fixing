/**
 * Builds a WhatsApp click-to-chat URL with a pre-filled message.
 * This uses the official click-to-chat link (wa.me) — no unofficial
 * WhatsApp API is used, and no message is auto-sent.
 */
export function buildWhatsAppLink(phone, message) {
  const digitsOnly = String(phone || "").replace(/\D/g, "");
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${digitsOnly}?text=${encoded}`;
}

export function buildAssignmentMessage(booking, serviceMan) {
  const servicesText = booking.services
    .map((s) => `${s.serviceName} × ${s.quantity}`)
    .join("\n");

  return [
    `Hello ${serviceMan.name},`,
    "",
    "You have a new service booking from DP Fixing.",
    "",
    `Booking ID: ${booking.bookingId}`,
    "",
    `Customer:\n${booking.customerName}`,
    "",
    `Phone:\n${booking.phone}`,
    "",
    `Service:\n${servicesText}`,
    "",
    `Address:\n${booking.address}, ${booking.city || ""}`,
    "",
    `Preferred Date:\n${booking.preferredDate}`,
    "",
    `Preferred Time:\n${booking.preferredTimeSlot}`,
    "",
    `Total Amount:\n₹${booking.totalAmount}`,
    "",
    "Please contact the customer and complete the service.",
    "",
    "DP Fixing",
  ].join("\n");
}

export function buildCustomerContactLink(phone, businessPhone) {
  const digitsOnly = String(phone || "").replace(/\D/g, "");
  return `https://wa.me/${digitsOnly}`;
}
