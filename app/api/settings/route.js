import { NextResponse } from "next/server";
import { getSupabaseAdmin, TABLES } from "@/lib/supabase";
import { mapSettings } from "@/lib/mappers";

/**
 * Public, read-only settings endpoint used by the storefront
 * (visiting fee, time slots, service areas, working hours).
 * Sensitive admin-only fields are simply not exposed here.
 */
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    let { data, error } = await supabase
      .from(TABLES.SETTINGS)
      .select("*")
      .eq("singleton_key", "main")
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      const { data: created, error: createError } = await supabase
        .from(TABLES.SETTINGS)
        .insert({ singleton_key: "main" })
        .select()
        .single();
      if (createError) throw createError;
      data = created;
    }

    const settings = mapSettings(data);

    return NextResponse.json({
      visitingFee: settings.visitingFee,
      serviceAreas: settings.serviceAreas,
      workingHours: settings.workingHours,
      timeSlots: settings.timeSlots,
      businessPhone: settings.businessPhone,
      serviceAvailable: settings.serviceAvailable,
    });
  } catch (err) {
    console.error("GET /api/settings error:", err);
    return NextResponse.json(
      { error: "Unable to load settings." },
      { status: 500 }
    );
  }
}
