import { NextResponse } from "next/server";
import { getSupabaseAdmin, TABLES } from "@/lib/supabase";
import { mapBooking, mapServiceMan } from "@/lib/mappers";
import { getAdminFromRequest } from "@/lib/auth";
import { haversineDistanceKm } from "@/lib/distance";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function timeSlotStartMinutes(slot) {
  const [startPart] = slot.split(" - ");
  const match = startPart.trim().match(/(\d+):(\d+)\s?(AM|PM)/i);
  if (!match) return null;
  let [, h, m, ampm] = match;
  h = parseInt(h, 10);
  m = parseInt(m, 10);
  if (ampm.toUpperCase() === "PM" && h !== 12) h += 12;
  if (ampm.toUpperCase() === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

function timeSlotEndMinutes(slot) {
  const [, endPart] = slot.split(" - ");
  if (!endPart) return null;
  const match = endPart.trim().match(/(\d+):(\d+)\s?(AM|PM)/i);
  if (!match) return null;
  let [, h, m, ampm] = match;
  h = parseInt(h, 10);
  m = parseInt(m, 10);
  if (ampm.toUpperCase() === "PM" && h !== 12) h += 12;
  if (ampm.toUpperCase() === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

function hhmmToMinutes(hhmm) {
  const [h, m] = String(hhmm).split(":").map(Number);
  return h * 60 + m;
}

export async function GET(request) {
  try {
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("bookingId");

    if (!bookingId) {
      return NextResponse.json({ error: "bookingId is required." }, { status: 400 });
    }

    const { data: bookingRow, error: bookingError } = await supabase
      .from(TABLES.BOOKINGS)
      .select("*")
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingError) throw bookingError;
    if (!bookingRow) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    const booking = mapBooking(bookingRow);
    const requestedServiceIds = booking.services.map((s) => String(s.serviceId));
    const dayName = DAY_NAMES[new Date(booking.preferredDate).getDay()];
    const slotStart = timeSlotStartMinutes(booking.preferredTimeSlot);
    const slotEnd = timeSlotEndMinutes(booking.preferredTimeSlot);

    const [{ data: serviceMenRows, error: smError }, { data: serviceRows, error: svcError }] =
      await Promise.all([
        supabase.from(TABLES.SERVICE_MEN).select("*").eq("active", true),
        supabase.from(TABLES.SERVICES).select("id, name"),
      ]);

    if (smError) throw smError;
    if (svcError) throw svcError;

    const servicesLookup = new Map(serviceRows.map((s) => [s.id, s]));
    const allServiceMen = serviceMenRows.map((row) => mapServiceMan(row, servicesLookup));

    const matched = allServiceMen
      .filter((sm) => {
        const providesService = sm.services.some((s) =>
          requestedServiceIds.includes(String(s.id))
        );
        if (!providesService) return false;

        const worksThatDay = sm.workingDays.includes(dayName);
        if (!worksThatDay) return false;

        if (slotStart != null && slotEnd != null) {
          const workStart = hhmmToMinutes(sm.workingHours?.start || "00:00");
          const workEnd = hhmmToMinutes(sm.workingHours?.end || "23:59");
          const availableForSlot = slotStart >= workStart && slotEnd <= workEnd;
          if (!availableForSlot) return false;
        }

        return true;
      })
      .map((sm) => {
        const distanceKm = haversineDistanceKm(
          booking.latitude,
          booking.longitude,
          sm.latitude,
          sm.longitude
        );
        return {
          id: sm.id,
          name: sm.name,
          phone: sm.phone,
          address: sm.address,
          city: sm.city,
          services: sm.services.map((s) => s.name),
          distanceKm,
          available: true,
        };
      })
      .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));

    return NextResponse.json({
      recommended: matched[0] || null,
      others: matched.slice(1),
      totalMatched: matched.length,
    });
  } catch (err) {
    console.error("GET /api/service-men/match error:", err);
    return NextResponse.json(
      { error: "Unable to find matching service men." },
      { status: 500 }
    );
  }
}
