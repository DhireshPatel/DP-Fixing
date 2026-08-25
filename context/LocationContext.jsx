// "use client";

// import { createContext, useContext, useEffect, useState, useCallback } from "react";
// import { getCurrentPosition, reverseGeocode } from "@/utils/reverseGeocode";

// const LocationContext = createContext(null);
// const STORAGE_KEY = "dpfixing_location";

// const emptyLocation = {
//   latitude: null,
//   longitude: null,
//   accuracy: null,
//   address: "",
//   city: "",
//   state: "",
//   pincode: "",
//   source: null, // "gps" | "manual"
// };

// export function LocationProvider({ children }) {
//   const [location, setLocation] = useState(emptyLocation);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     try {
//       const raw = window.localStorage.getItem(STORAGE_KEY);
//       if (raw) setLocation(JSON.parse(raw));
//     } catch (err) {
//       console.error("Failed to load location from storage:", err);
//     }
//   }, []);

//   const persist = useCallback((loc) => {
//     setLocation(loc);
//     try {
//       window.localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
//     } catch (err) {
//       console.error("Failed to save location to storage:", err);
//     }
//   }, []);

//   const useCurrentLocation = useCallback(async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const pos = await getCurrentPosition();
//       const geo = await reverseGeocode(pos.latitude, pos.longitude);

//       const loc = {
//         latitude: pos.latitude,
//         longitude: pos.longitude,
//         accuracy: pos.accuracy,
//         address: geo.address || "",
//         city: geo.city || "",
//         state: geo.state || "",
//         pincode: geo.pincode || "",
//         source: "gps",
//       };

//       persist(loc);
//       return loc;
//     } catch (err) {
//       let message = "Unable to fetch your current location.";
//       if (err.code === 1) message = "Location permission denied. Please allow location access.";
//       else if (err.code === 2) message = "Location unavailable. Please try manual search.";
//       else if (err.code === 3) message = "Location request timed out. Please try again.";
//       else if (err.message) message = err.message;

//       setError(message);
//       throw new Error(message);
//     } finally {
//       setLoading(false);
//     }
//   }, [persist]);

//   const setManualLocation = useCallback(
//     (result) => {
//       const loc = {
//         latitude: result.latitude,
//         longitude: result.longitude,
//         accuracy: null,
//         address: result.formatted || result.address || "",
//         city: result.city || "",
//         state: result.state || "",
//         pincode: result.pincode || "",
//         source: "manual",
//       };
//       persist(loc);
//       return loc;
//     },
//     [persist]
//   );

//   const clearLocation = useCallback(() => {
//     persist(emptyLocation);
//   }, [persist]);

//   const value = {
//     location,
//     loading,
//     error,
//     useCurrentLocation,
//     setManualLocation,
//     clearLocation,
//     hasLocation: location.latitude != null && location.longitude != null,
//   };

//   return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
// }

// export function useLocation() {
//   const ctx = useContext(LocationContext);
//   if (!ctx) throw new Error("useLocation must be used within a LocationProvider");
//   return ctx;
// }

// ================================================================ for testing new

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { getCurrentPosition, reverseGeocode } from "@/utils/reverseGeocode";

const LocationContext = createContext(null);
const STORAGE_KEY = "dpfixing_location";

const emptyLocation = {
  latitude: null,
  longitude: null,
  accuracy: null,
  address: "",
  city: "",
  state: "",
  pincode: "",
  source: null, // "gps" | "manual"
};

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(emptyLocation);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setLocation(JSON.parse(raw));
    } catch (err) {
      console.error("Failed to load location from storage:", err);
    }
  }, []);

  const persist = useCallback((loc) => {
    setLocation(loc);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
    } catch (err) {
      console.error("Failed to save location to storage:", err);
    }
  }, []);

  const useCurrentLocation = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Step 1: get GPS coordinates. Save these immediately — this is the
      // part that must never be lost even if the address lookup fails.
      const pos = await getCurrentPosition();

      let loc = {
        latitude: pos.latitude,
        longitude: pos.longitude,
        accuracy: pos.accuracy,
        address: "",
        city: "",
        state: "",
        pincode: "",
        source: "gps",
      };

      persist(loc);

      // Step 2: try to resolve a readable address for the same coordinates.
      // If this fails (bad/missing GEOAPIFY_API_KEY, quota, network issue),
      // we keep the correct GPS coordinates and just leave the address blank
      // instead of silently keeping old/stale data.
      try {
        const geo = await reverseGeocode(pos.latitude, pos.longitude);
        loc = {
          ...loc,
          address: geo.address || "",
          city: geo.city || "",
          state: geo.state || "",
          pincode: geo.pincode || "",
        };
        persist(loc);
      } catch (geoErr) {
        console.error(
          "Reverse geocoding failed, keeping raw coordinates:",
          geoErr,
        );
        setError(
          "Location detected, but we couldn't fetch the address automatically. Please fill in the address manually.",
        );
      }

      return loc;
    } catch (err) {
      let message = "Unable to fetch your current location.";
      if (err.code === 1)
        message = "Location permission denied. Please allow location access.";
      else if (err.code === 2)
        message = "Location unavailable. Please try manual search.";
      else if (err.code === 3)
        message = "Location request timed out. Please try again.";
      else if (err.message) message = err.message;

      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [persist]);

  const setManualLocation = useCallback(
    (result) => {
      const loc = {
        latitude: result.latitude,
        longitude: result.longitude,
        accuracy: null,
        address: result.formatted || result.address || "",
        city: result.city || "",
        state: result.state || "",
        pincode: result.pincode || "",
        source: "manual",
      };
      persist(loc);
      return loc;
    },
    [persist],
  );

  const clearLocation = useCallback(() => {
    persist(emptyLocation);
  }, [persist]);

  const value = {
    location,
    loading,
    error,
    useCurrentLocation,
    setManualLocation,
    clearLocation,
    hasLocation: location.latitude != null && location.longitude != null,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx)
    throw new Error("useLocation must be used within a LocationProvider");
  return ctx;
}
