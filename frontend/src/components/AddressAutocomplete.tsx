"use client";

import { useState, useRef, useEffect } from "react";
import { MapPin, Loader2 } from "lucide-react";

interface Suggestion {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
}

interface AddressAutocompleteProps {
    name: string;
    defaultValue?: string;
    required?: boolean;
    placeholder?: string;
    className?: string;
    onSelect?: (lat: string, lon: string) => void;
}

export default function AddressAutocomplete({
    name,
    defaultValue = "",
    required,
    placeholder,
    className = "",
    onSelect,
}: AddressAutocompleteProps) {
    const [value, setValue] = useState(defaultValue);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const search = async (query: string) => {
        if (query.length < 3) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }

        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                q: query,
                format: "json",
                limit: "6",
                addressdetails: "1",
            });
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?${params}`,
                {
                    headers: {
                        "Accept-Language": "es",
                        "User-Agent": "Domu/1.0 (domu.ar)",
                    },
                }
            );
            if (res.ok) {
                const data: Suggestion[] = await res.json();
                setSuggestions(data);
                setIsOpen(data.length > 0);
            }
        } catch {
            // silent fail — user can still type manually
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const q = e.target.value;
        setValue(q);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => search(q), 500);
    };

    const handleSelect = (suggestion: Suggestion) => {
        setValue(suggestion.display_name);
        setSuggestions([]);
        setIsOpen(false);
        onSelect?.(suggestion.lat, suggestion.lon);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            setIsOpen(false);
        }
    };

    return (
        <div ref={containerRef} className="relative">
            <div className="relative">
                <MapPin
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                    name={name}
                    type="text"
                    value={value}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    required={required}
                    autoComplete="off"
                    placeholder={placeholder}
                    className={`pl-9 pr-9 ${className}`}
                />
                {isLoading && (
                    <Loader2
                        size={16}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin"
                    />
                )}
            </div>

            {isOpen && suggestions.length > 0 && (
                <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-64 overflow-y-auto">
                    {suggestions.map((s) => (
                        <li
                            key={s.place_id}
                            onMouseDown={(e) => {
                                // onMouseDown instead of onClick to fire before onBlur
                                e.preventDefault();
                                handleSelect(s);
                            }}
                            className="px-3 py-2.5 text-sm cursor-pointer hover:bg-blue-50 flex items-start gap-2 border-b border-gray-100 last:border-0"
                        >
                            <MapPin size={14} className="mt-0.5 flex-shrink-0 text-gray-400" />
                            <span className="text-gray-700">{s.display_name}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
