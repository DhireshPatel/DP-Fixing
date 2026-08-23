import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin, TABLES } from "@/lib/supabase";
import { signAdminToken, getAdminCookieOptions, ADMIN_COOKIE_NAME } from "@/lib/auth";

export async function POST(request) {
  try {
    const supabase = getSupabaseAdmin();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const { data: admin, error } = await supabase
      .from(TABLES.ADMINS)
      .select("*")
      .eq("email", String(email).toLowerCase().trim())
      .maybeSingle();

    if (error) throw error;
    if (!admin) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const token = signAdminToken({ id: admin.id, email: admin.email });

    const response = NextResponse.json({
      success: true,
      admin: { email: admin.email, name: admin.name },
    });

    response.cookies.set(ADMIN_COOKIE_NAME, token, getAdminCookieOptions());

    return response;
  } catch (err) {
    console.error("POST /api/admin/login error:", err);
    return NextResponse.json({ error: "Unable to log in." }, { status: 500 });
  }
}
