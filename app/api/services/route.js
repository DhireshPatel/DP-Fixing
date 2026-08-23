import { NextResponse } from "next/server";
import { getSupabaseAdmin, TABLES } from "@/lib/supabase";
import { mapService, unmapServiceInput } from "@/lib/mappers";
import { getAdminFromRequest } from "@/lib/auth";

export async function GET(request) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("all") === "true";

    const admin = getAdminFromRequest(request);

    let query = supabase.from(TABLES.SERVICES).select("*").order("order", { ascending: true });
    if (!(includeInactive && admin)) {
      query = query.eq("active", true);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ services: data.map(mapService) });
  } catch (err) {
    console.error("GET /api/services error:", err);
    return NextResponse.json(
      { error: "Unable to load services right now." },
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

    const { name, description, shortDescription, image, price, duration } = body;
    if (!name || !description || !shortDescription || !image || price == null || !duration) {
      return NextResponse.json(
        { error: "Missing required service fields." },
        { status: 400 }
      );
    }

    const baseSlug = String(name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const insertRow = {
      ...unmapServiceInput(body),
      slug: `${baseSlug}-${Date.now().toString(36)}`,
      price: Number(price),
      category: body.category || "General",
      included: body.included || [],
      notes: body.notes || [],
      popular: !!body.popular,
      active: body.active !== false,
    };

    const { data, error } = await supabase
      .from(TABLES.SERVICES)
      .insert(insertRow)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ service: mapService(data) }, { status: 201 });
  } catch (err) {
    console.error("POST /api/services error:", err);
    return NextResponse.json(
      { error: "Unable to create service." },
      { status: 500 }
    );
  }
}
