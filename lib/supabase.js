import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Server-only Supabase client using the SERVICE ROLE key.
 * This bypasses Row Level Security and must NEVER be imported into
 * any client component or exposed to the browser. Use this inside
 * API routes (app/api/**) only.
 */
let _supabaseAdmin;

export function getSupabaseAdmin() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file."
    );
  }

  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return _supabaseAdmin;
}

/**
 * Browser-safe Supabase client using the public ANON key.
 * Only has access to what Row Level Security policies explicitly allow
 * (e.g. reading active services). Not currently used directly by any
 * client component (the app talks to our own /api routes instead), but
 * kept available for future direct-from-browser reads if needed.
 */
let _supabasePublic;

export function getSupabasePublic() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  if (!_supabasePublic) {
    _supabasePublic = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  return _supabasePublic;
}

/** Table name constants, so a rename only needs to happen in one place. */
export const TABLES = {
  SERVICES: "services",
  BOOKINGS: "bookings",
  SERVICE_MEN: "service_men",
  ADMINS: "admins",
  SETTINGS: "settings",
};
