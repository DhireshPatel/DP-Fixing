import { NextResponse } from "next/server";

/**
 * Proxies address autocomplete search to Geoapify, keeping the API
 * key server-side.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get("text");

    if (!text || text.trim().length < 3) {
      return NextResponse.json({ results: [] });
    }

    const apiKey = process.env.GEOAPIFY_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Location service is not configured." },
        { status: 500 }
      );
    }

    const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
      text
    )}&filter=countrycode:in&apiKey=${apiKey}`;

    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json(
        { error: "Unable to search locations right now." },
        { status: 502 }
      );
    }

    const data = await res.json();

    const results = (data.features || []).map((f) => ({
      formatted: f.properties.formatted,
      city: f.properties.city || f.properties.county || "",
      state: f.properties.state || "",
      pincode: f.properties.postcode || "",
      latitude: f.properties.lat,
      longitude: f.properties.lon,
    }));

    return NextResponse.json({ results });
  } catch (err) {
    console.error("GET /api/location/search error:", err);
    return NextResponse.json(
      { error: "Unable to search locations." },
      { status: 500 }
    );
  }
}
