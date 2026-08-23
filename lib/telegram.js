/**
 * Sends a message to the admin's Telegram chat using the Bot API.
 * This must only ever be called from server-side code (API routes).
 * TELEGRAM_BOT_TOKEN is never exposed to the client.
 */
export async function sendTelegramMessage(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("Telegram env vars missing — skipping notification.");
    return { ok: false, skipped: true };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }),
    });

    const data = await res.json();
    if (!data.ok) {
      console.error("Telegram API error:", data);
    }
    return data;
  } catch (err) {
    console.error("Failed to send Telegram notification:", err);
    return { ok: false, error: String(err) };
  }
}

export function buildBookingTelegramMessage(booking) {
  const servicesText = booking.services
    .map((s) => `• ${s.serviceName} × ${s.quantity}`)
    .join("\n");

  return [
    "🔔 <b>NEW BOOKING</b>",
    "",
    `Booking ID: <b>${booking.bookingId}</b>`,
    "",
    `Customer: ${booking.customerName}`,
    `Phone: ${booking.phone}`,
    "",
    `Services:\n${servicesText}`,
    "",
    `Address: ${booking.address}, ${booking.city || ""} ${booking.pincode || ""}`,
    `Location: ${booking.latitude ?? "-"}, ${booking.longitude ?? "-"}`,
    "",
    `Date: ${booking.preferredDate}`,
    `Time: ${booking.preferredTimeSlot}`,
    "",
    `Subtotal: ₹${booking.subtotal}`,
    `Visiting Fee: ₹${booking.visitingFee}`,
    `Total: ₹${booking.totalAmount}`,
    "",
    `Status: ${booking.status}`,
  ].join("\n");
}
