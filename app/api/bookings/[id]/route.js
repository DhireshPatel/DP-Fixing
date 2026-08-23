import { NextResponse } from "next/server";
import { getSupabaseAdmin, TABLES } from "@/lib/supabase";
import { mapBooking } from "@/lib/mappers";
import { getAdminFromRequest } from "@/lib/auth";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function findBooking(supabase, id) {
  const column = UUID_RE.test(id) ? "id" : "booking_id";
  const { data, error } = await supabase
    .from(TABLES.BOOKINGS)
    .select("*")
    .eq(column, id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function GET(request, { params }) {
  try {
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const booking = await findBooking(supabase, params.id);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }
    return NextResponse.json({ booking: mapBooking(booking) });
  } catch (err) {
    console.error("GET /api/bookings/[id] error:", err);
    return NextResponse.json({ error: "Unable to load booking." }, { status: 500 });
  }
}

const VALID_STATUSES = [
  "Pending",
  "Confirmed",
  "Assigned",
  "In Progress",
  "Completed",
  "Cancelled",
];

export async function PUT(request, { params }) {
  try {
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const body = await request.json();

    const existing = await findBooking(supabase, params.id);
    if (!existing) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    const update = {};

    if (body.status) {
      if (!VALID_STATUSES.includes(body.status)) {
        return NextResponse.json({ error: "Invalid status." }, { status: 400 });
      }
      update.status = body.status;
    }

    if (body.assignedServiceMan) {
      const { data: serviceMan, error: smError } = await supabase
        .from(TABLES.SERVICE_MEN)
        .select("id, name")
        .eq("id", body.assignedServiceMan)
        .maybeSingle();

      if (smError) throw smError;
      if (!serviceMan) {
        return NextResponse.json({ error: "Service man not found." }, { status: 404 });
      }

      update.assigned_service_man = serviceMan.id;
      update.assigned_service_man_name = serviceMan.name;

      if (!body.status && (existing.status === "Pending" || existing.status === "Confirmed")) {
        update.status = "Assigned";
      }
    }

    if (body.unassign) {
      update.assigned_service_man = null;
      update.assigned_service_man_name = null;
    }

    const { data, error } = await supabase
      .from(TABLES.BOOKINGS)
      .update(update)
      .eq("id", existing.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ booking: mapBooking(data) });
  } catch (err) {
    console.error("PUT /api/bookings/[id] error:", err);
    return NextResponse.json({ error: "Unable to update booking." }, { status: 500 });
  }
}
