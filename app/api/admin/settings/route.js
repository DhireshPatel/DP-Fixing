import { NextResponse } from "next/server";
import { getSupabaseAdmin, TABLES } from "@/lib/supabase";
import { mapSettings, unmapSettingsInput } from "@/lib/mappers";
import { getAdminFromRequest } from "@/lib/auth";

async function getOrCreateSettings(supabase) {
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

  return data;
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const settings = await getOrCreateSettings(supabase);
    return NextResponse.json({ settings: mapSettings(settings) });
  } catch (err) {
    console.error("GET /api/admin/settings error:", err);
    return NextResponse.json(
      { error: "Unable to load settings." },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const update = unmapSettingsInput(body);

    await getOrCreateSettings(supabase);

    const { data, error } = await supabase
      .from(TABLES.SETTINGS)
      .update(update)
      .eq("singleton_key", "main")
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ settings: mapSettings(data) });
  } catch (err) {
    console.error("PUT /api/admin/settings error:", err);
    return NextResponse.json(
      { error: "Unable to update settings." },
      { status: 500 }
    );
  }
}
