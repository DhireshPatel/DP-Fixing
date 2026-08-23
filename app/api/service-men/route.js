import { NextResponse } from "next/server";
import { getSupabaseAdmin, TABLES } from "@/lib/supabase";
import { mapServiceMan, unmapServiceManInput } from "@/lib/mappers";
import { getAdminFromRequest } from "@/lib/auth";
import { isValidLatLng, isValidPhone, isValidName } from "@/utils/validation";

export async function GET(request) {
  try {
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    const [{ data: serviceMenRows, error: smError }, { data: serviceRows, error: svcError }] =
      await Promise.all([
        supabase.from(TABLES.SERVICE_MEN).select("*").order("created_at", { ascending: false }),
        supabase.from(TABLES.SERVICES).select("id, name"),
      ]);

    if (smError) throw smError;
    if (svcError) throw svcError;

    const servicesLookup = new Map(serviceRows.map((s) => [s.id, s]));
    const serviceMen = serviceMenRows.map((row) => mapServiceMan(row, servicesLookup));

    return NextResponse.json({ serviceMen });
  } catch (err) {
    console.error("GET /api/service-men error:", err);
    return NextResponse.json(
      { error: "Unable to load service men." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const body = await request.json();

    if (!isValidName(body.name)) {
      return NextResponse.json({ error: "Valid name is required." }, { status: 400 });
    }
    if (!isValidPhone(body.phone)) {
      return NextResponse.json({ error: "Valid phone is required." }, { status: 400 });
    }
    if (!isValidLatLng(body.latitude, body.longitude)) {
      return NextResponse.json(
        { error: "Valid location coordinates are required." },
        { status: 400 }
      );
    }

    const insertRow = {
      ...unmapServiceManInput(body),
      latitude: Number(body.latitude),
      longitude: Number(body.longitude),
      services: body.services || [],
      active: body.active !== false,
    };

    const { data, error } = await supabase
      .from(TABLES.SERVICE_MEN)
      .insert(insertRow)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ serviceMan: mapServiceMan(data) }, { status: 201 });
  } catch (err) {
    console.error("POST /api/service-men error:", err);
    return NextResponse.json(
      { error: "Unable to create service man." },
      { status: 500 }
    );
  }
}
