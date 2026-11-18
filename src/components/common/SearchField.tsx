"use client";

import { useState, useEffect, useRef } from "react";
import { Search, MapPin, X, Loader2 } from "lucide-react";

export interface SearchOption {
  code?: string;
  name: string;
  city?: string;
  state?: string;
  id?: string;
}

interface SearchFieldProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string, option?: SearchOption) => void;
  apiEndpoint: string; // e.g. "/api/autocomplete/airports"
  error?: string;
  className?: string;
  id?: string;
}

export function SearchField({
  label,
  placeholder = "Search...",
  value,
  onChange,
  apiEndpoint,
  error,
  className = "",
  id,
}: SearchFieldProps) {
  const [query, setQuery] = useState(value);
  const [options, setOptions] = useState<SearchOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputId = id || `search-field-${label.toLowerCase().replace(/\s+/g, "-")}`;

  // Keep internal query synchronized when external value changes
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search fetch
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiEndpoint}?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setOptions(data);
        }
      } catch (err) {
        console.error("Autocomplete fetch error:", err);
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query, isOpen, apiEndpoint]);

  function handleSelect(option: SearchOption) {
    const val = option.code || option.name;
    setQuery(val);
    onChange(val, option);
    setIsOpen(false);
    setHighlightIndex(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIndex >= 0 && highlightIndex < options.length) {
        handleSelect(options[highlightIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <div ref={containerRef} className={`relative flex flex-col ${className}`}>
      <label htmlFor={inputId} className="mb-1 text-[11px] font-mono uppercase tracking-wider font-semibold text-[var(--ink-muted)]">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type="text"
          value={query}
          autoComplete="off"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-describedby={error ? `${inputId}-error` : undefined}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`h-11 w-full rounded-lg border bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--ink)] transition-all placeholder:text-[var(--ink-muted)]/60 focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] focus:outline-none shadow-xs ${
            error ? "border-rose-400 bg-rose-50/20" : "border-[var(--line)] hover:border-[var(--ink-muted)]"
          }`}
        />

        <div className="absolute right-2.5 top-3 flex items-center gap-1 text-[var(--ink-muted)]">
          {loading && <Loader2 size={16} className="animate-spin text-[var(--brand)]" />}
          {query && !loading && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                onChange("");
                setIsOpen(false);
              }}
              className="hover:text-[var(--ink)]"
              aria-label="Clear input"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {error && (
        <span id={`${inputId}-error`} className="mt-1 text-xs text-[var(--danger)]">
          {error}
        </span>
      )}

      {/* Autocomplete Dropdown list */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-md border border-[var(--line)] bg-[var(--surface)] shadow-dropdown"
        >
          {options.length === 0 && !loading ? (
            <div className="px-3 py-2 text-xs text-[var(--ink-muted)]">
              No matching locations found
            </div>
          ) : (
            options.map((opt, idx) => {
              const isHighlighted = idx === highlightIndex;
              return (
                <div
                  key={opt.code || opt.id || opt.name}
                  role="option"
                  aria-selected={isHighlighted}
                  onClick={() => handleSelect(opt)}
                  onMouseEnter={() => setHighlightIndex(idx)}
                  className={`flex cursor-pointer items-center justify-between border-b border-[var(--line)] px-3 py-2 text-xs last:border-b-0 ${
                    isHighlighted ? "bg-[var(--canvas)] text-[var(--brand)]" : "text-[var(--ink)] hover:bg-[var(--canvas)]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-[var(--ink-muted)] shrink-0" />
                    <div>
                      <div className="font-medium">
                        {opt.city || opt.name}
                        {opt.state ? `, ${opt.state}` : ""}
                      </div>
                      {opt.code && (
                        <div className="text-[11px] text-[var(--ink-muted)]">
                          {opt.name}
                        </div>
                      )}
                    </div>
                  </div>
                  {opt.code && (
                    <span className="font-mono text-xs font-bold text-[var(--ink-muted)] bg-[var(--canvas)] px-1.5 py-0.5 rounded border border-[var(--line)]">
                      {opt.code}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
