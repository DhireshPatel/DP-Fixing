"use client";

import { useState, useRef, useEffect } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";
import { searchLocation } from "@/utils/reverseGeocode";
import styles from "./ManualLocationPicker.module.css";

export default function ManualLocationPicker({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleChange(e) {
    const value = e.target.value;
    setQuery(value);
    setOpen(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 3) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchLocation(value);
        setResults(res);
      } catch (err) {
        console.error(err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
  }

  function handleSelect(result) {
    setQuery(result.formatted);
    setResults([]);
    setOpen(false);
    onSelect(result);
  }

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div className={styles.inputWrap}>
        <Search size={16} className={styles.searchIcon} />
        <input
          type="text"
          className={styles.input}
          placeholder="Search your area, street or landmark..."
          value={query}
          onChange={handleChange}
          onFocus={() => setOpen(true)}
        />
        {loading && <Loader2 size={16} className={styles.spinner} />}
      </div>

      {open && results.length > 0 && (
        <ul className={styles.dropdown}>
          {results.map((r, idx) => (
            <li key={idx} className={styles.dropdownItem} onClick={() => handleSelect(r)}>
              <MapPin size={14} className={styles.pin} />
              <span>{r.formatted}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
