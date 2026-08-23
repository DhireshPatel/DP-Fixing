import { NextResponse } from "next/server";

/**
 * Proxies reverse geocoding requests to Geoapify so the API key
 * never has to be exposed to the browser.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    if (!lat || !lon) {
      return NextResponse.json(
        { error: "lat and lon are required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEOAPIFY_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Location service is not configured." },
        { status: 500 }
      );
    }

    const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${apiKey}`;
    const res = await fetch(url);

    if (!res.ok) {
      return NextResponse.json(
        { error: "Unable to determine address for this location." },
        { status: 502 }
      );
    }

    const data = await res.json();
    const feature = data.features?.[0];

    if (!feature) {
      return NextResponse.json(
        { error: "No address found for this location." },
        { status: 404 }
      );
    }

    const p = feature.properties;

    return NextResponse.json({
      address: p.formatted || "",
      city: p.city || p.county || "",
      state: p.state || "",
      pincode: p.postcode || "",
      latitude: p.lat,
      longitude: p.lon,
    });
  } catch (err) {
    console.error("GET /api/location/reverse error:", err);
    return NextResponse.json(
      { error: "Unable to reverse geocode this location." },
      { status: 500 }
    );
  }
}
