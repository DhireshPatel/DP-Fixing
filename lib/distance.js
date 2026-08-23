/**
 * Calculates the great-circle distance between two lat/lng points
 * using the Haversine formula. Returns distance in kilometers.
 */
export function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  if (
    [lat1, lon1, lat2, lon2].some(
      (v) => v === undefined || v === null || Number.isNaN(Number(v))
    )
  ) {
    return null;
  }

  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // Earth radius in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100;
}

/**
 * Checks whether a point falls within a given radius (km) of a center point.
 */
export function isWithinRadius(centerLat, centerLng, pointLat, pointLng, radiusKm) {
  const dist = haversineDistanceKm(centerLat, centerLng, pointLat, pointLng);
  if (dist === null) return false;
  return dist <= radiusKm;
}
