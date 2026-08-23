import { NextResponse } from "next/server";
import { getSupabaseAdmin, TABLES } from "@/lib/supabase";
import { mapBooking, mapSettings } from "@/lib/mappers";
import { getAdminFromRequest } from "@/lib/auth";
import { isWithinRadius } from "@/lib/distance";
import { sendTelegramMessage, buildBookingTelegramMessage } from "@/lib/telegram";
import {
  isValidName,
  isValidPhone,
  isValidLatLng,
  isNonEmptyString,
  isValidDate,
} from "@/utils/validation";

export async function GET(request) {
  try {
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query = supabase.from(TABLES.BOOKINGS).select("*").order("created_at", { ascending: false });
    if (status && status !== "All") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ bookings: data.map(mapBooking) });
  } catch (err) {
    console.error("GET /api/bookings error:", err);
    return NextResponse.json(
      { error: "Unable to load bookings." },
      { status: 500 }
    );
  }
}

function generateBookingId() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `DP-${Date.now().toString().slice(-6)}${num}`;
}

export async function POST(request) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();

    // ---- Basic field validation ----
    if (!isValidName(body.customerName)) {
      return NextResponse.json({ error: "Please enter a valid full name." }, { status: 400 });
    }
    if (!isValidPhone(body.phone)) {
      return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 });
    }
    if (!isNonEmptyString(body.address)) {
      return NextResponse.json({ error: "Address is required." }, { status: 400 });
    }
    if (!isValidLatLng(body.latitude, body.longitude)) {
      return NextResponse.json(
        { error: "A valid location is required. Please use current location or search manually." },
        { status: 400 }
      );
    }
    if (!body.locationSource || !["gps", "manual"].includes(body.locationSource)) {
      return NextResponse.json({ error: "Invalid location source." }, { status: 400 });
    }
    if (!isValidDate(body.preferredDate)) {
      return NextResponse.json({ error: "Please choose a valid preferred date." }, { status: 400 });
    }
    if (!isNonEmptyString(body.preferredTimeSlot)) {
      return NextResponse.json({ error: "Please choose a time slot." }, { status: 400 });
    }
    if (!Array.isArray(body.services) || body.services.length === 0) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    // ---- Load settings (visiting fee + service areas) ----
    let { data: settingsRow, error: settingsError } = await supabase
      .from(TABLES.SETTINGS)
      .select("*")
      .eq("singleton_key", "main")
      .maybeSingle();
    if (settingsError) throw settingsError;

    if (!settingsRow) {
      const { data: created, error: createError } = await supabase
        .from(TABLES.SETTINGS)
        .insert({ singleton_key: "main" })
        .select()
        .single();
      if (createError) throw createError;
      settingsRow = created;
    }

    const settings = mapSettings(settingsRow);

    if (!settings.serviceAvailable) {
      return NextResponse.json(
        { error: "Sorry, DP Fixing is currently not accepting bookings." },
        { status: 400 }
      );
    }

    // ---- Server-side service area check (never trust frontend) ----
    if (settings.serviceAreas && settings.serviceAreas.length > 0) {
      const withinAnyArea = settings.serviceAreas.some((area) =>
        isWithinRadius(area.latitude, area.longitude, body.latitude, body.longitude, area.radiusKm)
      );

      if (!withinAnyArea) {
        return NextResponse.json(
          { error: "Sorry, DP Fixing is currently not available in your area." },
          { status: 400 }
        );
      }
    }

    // ---- Server-side price recalculation (never trust frontend totals) ----
    const requestedIds = body.services.map((s) => s.serviceId);
    const { data: dbServices, error: servicesError } = await supabase
      .from(TABLES.SERVICES)
      .select("*")
      .in("id", requestedIds)
      .eq("active", true);

    if (servicesError) throw servicesError;

    if (!dbServices || dbServices.length === 0) {
      return NextResponse.json({ error: "No valid services found in cart." }, { status: 400 });
    }

    const dbServiceMap = new Map(dbServices.map((s) => [String(s.id), s]));

    const validatedServices = [];
    for (const item of body.services) {
      const dbService = dbServiceMap.get(String(item.serviceId));
      if (!dbService) continue;

      const quantity = Math.max(1, Math.min(20, parseInt(item.quantity, 10) || 1));
      const price = Number(dbService.price);
      const subtotal = price * quantity;

      validatedServices.push({
        serviceId: dbService.id,
        serviceName: dbService.name,
        price,
        quantity,
        subtotal,
      });
    }

    if (validatedServices.length === 0) {
      return NextResponse.json(
        { error: "None of the requested services are currently available." },
        { status: 400 }
      );
    }

    const subtotal = validatedServices.reduce((sum, s) => sum + s.subtotal, 0);
    const visitingFee = settings.visitingFee;
    const totalAmount = subtotal + visitingFee;

    // ---- Create booking ----
    const insertRow = {
      booking_id: generateBookingId(),
      customer_name: body.customerName.trim(),
      phone: body.phone.trim(),
      address: body.address.trim(),
      city: body.city || "",
      state: body.state || "",
      pincode: body.pincode || "",
      latitude: body.latitude,
      longitude: body.longitude,
      location_accuracy: body.locationAccuracy || null,
      location_source: body.locationSource,
      services: validatedServices,
      subtotal,
      visiting_fee: visitingFee,
      total_amount: totalAmount,
      preferred_date: body.preferredDate,
      preferred_time_slot: body.preferredTimeSlot,
      notes: body.notes || "",
      status: "Pending",
    };

    const { data: bookingRow, error: insertError } = await supabase
      .from(TABLES.BOOKINGS)
      .insert(insertRow)
      .select()
      .single();

    if (insertError) throw insertError;

    const booking = mapBooking(bookingRow);

    // ---- Telegram notification (server-side only) ----
    if (settings.telegramEnabled) {
      const message = buildBookingTelegramMessage(booking);
      sendTelegramMessage(message).catch((e) =>
        console.error("Telegram notify failed:", e)
      );
    }

    return NextResponse.json({ booking }, { status: 201 });
  } catch (err) {
    console.error("POST /api/bookings error:", err);
    return NextResponse.json(
      { error: "Unable to submit your booking right now. Please try again." },
      { status: 500 }
    );
  }
}
