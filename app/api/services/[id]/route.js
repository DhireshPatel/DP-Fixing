import { NextResponse } from "next/server";
import { getSupabaseAdmin, TABLES } from "@/lib/supabase";
import { mapService, unmapServiceInput } from "@/lib/mappers";
import { getAdminFromRequest } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from(TABLES.SERVICES)
      .select("*")
      .eq("id", params.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "Service not found." }, { status: 404 });
    }
    return NextResponse.json({ service: mapService(data) });
  } catch (err) {
    console.error("GET /api/services/[id] error:", err);
    return NextResponse.json(
      { error: "Unable to load service." },
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
    const update = unmapServiceInput(body);

    const { data, error } = await supabase
      .from(TABLES.SERVICES)
      .update(update)
      .eq("id", params.id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "Service not found." }, { status: 404 });
    }

    return NextResponse.json({ service: mapService(data) });
  } catch (err) {
    console.error("PUT /api/services/[id] error:", err);
    return NextResponse.json(
      { error: "Unable to update service." },
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
      .from(TABLES.SERVICES)
      .delete()
      .eq("id", params.id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "Service not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/services/[id] error:", err);
    return NextResponse.json(
      { error: "Unable to delete service." },
      { status: 500 }
    );
  }
}
