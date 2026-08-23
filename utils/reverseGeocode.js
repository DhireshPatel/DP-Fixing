/**
 * Calls our internal /api/location/reverse route (which proxies Geoapify
 * server-side, keeping the API key off the client) to turn GPS coordinates
 * into a readable address.
 */
export async function reverseGeocode(latitude, longitude) {
  const res = await fetch(
    `/api/location/reverse?lat=${latitude}&lon=${longitude}`
  );

  if (!res.ok) {
    throw new Error("Failed to reverse geocode location");
  }

  return res.json();
}

/**
 * Calls our internal /api/location/search route for autocomplete suggestions.
 */
export async function searchLocation(query) {
  if (!query || query.trim().length < 3) return [];

  const res = await fetch(`/api/location/search?text=${encodeURIComponent(query)}`);

  if (!res.ok) {
    throw new Error("Failed to search location");
  }

  const data = await res.json();
  return data.results || [];
}

/**
 * Wraps navigator.geolocation.getCurrentPosition in a Promise.
 */
export function getCurrentPosition(options = {}) {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        ...options,
      }
    );
  });
}
