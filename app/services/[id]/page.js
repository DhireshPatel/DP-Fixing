import { notFound } from "next/navigation";
import { getSupabaseAdmin, TABLES } from "@/lib/supabase";
import { mapService } from "@/lib/mappers";
import ServiceDetailsClient from "./ServiceDetailsClient";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getService(id) {
  try {
    if (!UUID_RE.test(id)) return null;
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from(TABLES.SERVICES)
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return mapService(data);
  } catch (err) {
    console.error("Failed to load service:", err);
    return null;
  }
}

export default async function ServiceDetailsPage({ params }) {
  const service = await getService(params.id);
  if (!service) notFound();

  return <ServiceDetailsClient service={service} />;
}
