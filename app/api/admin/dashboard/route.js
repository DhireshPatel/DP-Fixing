import { NextResponse } from "next/server";
import { getSupabaseAdmin, TABLES } from "@/lib/supabase";
import { mapBooking } from "@/lib/mappers";
import { getAdminFromRequest } from "@/lib/auth";

const STATUSES = [
  "Pending",
  "Confirmed",
  "Assigned",
  "In Progress",
  "Completed",
  "Cancelled",
];

export async function GET(request) {
  try {
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    const [{ count: total, error: countError }, { data: allBookings, error: allError }, { data: recentRows, error: recentError }] =
      await Promise.all([
        supabase.from(TABLES.BOOKINGS).select("*", { count: "exact", head: true }),
        supabase.from(TABLES.BOOKINGS).select("status, total_amount"),
        supabase
          .from(TABLES.BOOKINGS)
          .select("*")
          .order("created_at", { ascending: false })
          .limit(8),
      ]);

    if (countError) throw countError;
    if (allError) throw allError;
    if (recentError) throw recentError;

    const byStatus = Object.fromEntries(STATUSES.map((s) => [s, 0]));
    let totalRevenue = 0;
    for (const b of allBookings) {
      if (byStatus[b.status] !== undefined) byStatus[b.status] += 1;
      if (b.status !== "Cancelled") totalRevenue += Number(b.total_amount);
    }

    return NextResponse.json({
      totalBookings: total || 0,
      byStatus,
      totalRevenue,
      recentBookings: recentRows.map(mapBooking),
    });
  } catch (err) {
    console.error("GET /api/admin/dashboard error:", err);
    return NextResponse.json(
      { error: "Unable to load dashboard data." },
      { status: 500 }
    );
  }
}
