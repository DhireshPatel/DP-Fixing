"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
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
      const pos = await getCurrentPosition();
      const geo = await reverseGeocode(pos.latitude, pos.longitude);

      const loc = {
        latitude: pos.latitude,
        longitude: pos.longitude,
        accuracy: pos.accuracy,
        address: geo.address || "",
        city: geo.city || "",
        state: geo.state || "",
        pincode: geo.pincode || "",
        source: "gps",
      };

      persist(loc);
      return loc;
    } catch (err) {
      let message = "Unable to fetch your current location.";
      if (err.code === 1) message = "Location permission denied. Please allow location access.";
      else if (err.code === 2) message = "Location unavailable. Please try manual search.";
      else if (err.code === 3) message = "Location request timed out. Please try again.";
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
    [persist]
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

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used within a LocationProvider");
  return ctx;
}
