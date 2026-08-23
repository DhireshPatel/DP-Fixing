import { NextResponse } from "next/server";
import { getSupabaseAdmin, TABLES } from "@/lib/supabase";
import { mapServiceMan, unmapServiceManInput } from "@/lib/mappers";
import { getAdminFromRequest } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from(TABLES.SERVICE_MEN)
      .select("*")
      .eq("id", params.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "Service man not found." }, { status: 404 });
    }

    return NextResponse.json({ serviceMan: mapServiceMan(data) });
  } catch (err) {
    console.error("GET /api/service-men/[id] error:", err);
    return NextResponse.json(
      { error: "Unable to load service man." },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const update = unmapServiceManInput(body);

    const { data, error } = await supabase
      .from(TABLES.SERVICE_MEN)
      .update(update)
      .eq("id", params.id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "Service man not found." }, { status: 404 });
    }

    return NextResponse.json({ serviceMan: mapServiceMan(data) });
  } catch (err) {
    console.error("PUT /api/service-men/[id] error:", err);
    return NextResponse.json(
      { error: "Unable to update service man." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from(TABLES.SERVICE_MEN)
      .delete()
      .eq("id", params.id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "Service man not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/service-men/[id] error:", err);
    return NextResponse.json(
      { error: "Unable to delete service man." },
      { status: 500 }
    );
  }
}
