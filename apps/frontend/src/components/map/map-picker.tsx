"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Crosshair, LocateFixed, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/cn";

interface MapPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (latitude: number, longitude: number) => void;
  onClear?: () => void;
  className?: string;
}

const DEFAULT_CENTER: L.LatLngTuple = [-2.5, 118];
const DEFAULT_ZOOM = 5;
const FOCUS_ZOOM = 13;

const PIN_HTML = `
  <span style="display:flex;width:30px;height:30px;filter:drop-shadow(0 2px 3px rgba(0,0,0,.35));">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30" fill="var(--color-primary)" stroke="#ffffff" stroke-width="1.4" stroke-linejoin="round">
      <path d="M12 22s7-6.3 7-12a7 7 0 1 0-14 0c0 5.7 7 12 7 12Z"/>
      <circle cx="12" cy="10" r="2.6" fill="#ffffff" stroke="none"/>
    </svg>
  </span>
`;

/**
 * Leaflet map used to pick a destination coordinate. Loaded client-side only
 * (see `location-picker.tsx`) because Leaflet needs `window`.
 */
export function MapPicker({
  latitude,
  longitude,
  onChange,
  onClear,
  className,
}: MapPickerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  const [geoError, setGeoError] = useState("");

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const place = useCallback(
    (lat: number, lng: number, focus: boolean) => {
      const map = mapRef.current;
      if (!map) return;

      if (!markerRef.current) {
        markerRef.current = L.marker([lat, lng], {
          draggable: true,
          icon: L.divIcon({
            className: "dolenae-map-pin",
            html: PIN_HTML,
            iconSize: [30, 30],
            iconAnchor: [15, 30],
          }),
        }).addTo(map);
        markerRef.current.on("dragend", () => {
          const position = markerRef.current?.getLatLng();
          if (position) onChangeRef.current(position.lat, position.lng);
        });
      } else {
        markerRef.current.setLatLng([lat, lng]);
      }

      if (focus) map.flyTo([lat, lng], Math.max(map.getZoom(), FOCUS_ZOOM), {
        duration: 0.45,
      });
    },
    [],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    const map = L.map(container, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      scrollWheelZoom: false,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    map.on("click", (event: L.LeafletMouseEvent) => {
      place(event.latlng.lat, event.latlng.lng, false);
      onChangeRef.current(event.latlng.lat, event.latlng.lng);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [place]);

  // Keep the marker in sync with values edited outside the map.
  useEffect(() => {
    if (!mapRef.current) return;

    if (latitude === null || longitude === null) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }

    const current = markerRef.current?.getLatLng();
    if (
      current &&
      Math.abs(current.lat - latitude) < 1e-6 &&
      Math.abs(current.lng - longitude) < 1e-6
    ) {
      return;
    }

    // Zoom in only when the marker appears from a manually typed coordinate.
    place(latitude, longitude, markerRef.current === null);
  }, [latitude, longitude, place]);

  const locate = () => {
    if (!("geolocation" in navigator)) {
      setGeoError("Perangkat tidak mendukung geolokasi.");
      return;
    }

    setGeoError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        place(lat, lng, true);
        onChangeRef.current(lat, lng);
      },
      () => setGeoError("Gagal membaca lokasi. Izinkan akses lokasi."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const reset = () => {
    markerRef.current?.remove();
    markerRef.current = null;
    mapRef.current?.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM, { duration: 0.45 });
    onClear?.();
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative z-0 overflow-hidden rounded-lg border border-hairline">
        <div ref={containerRef} className="h-[320px] w-full bg-canvas-subtle" />

        <div className="absolute right-3 top-3 z-[1000] flex flex-col gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={locate}
            className="bg-surface"
          >
            <LocateFixed aria-hidden className="h-4 w-4" />
            Lokasi saya
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={reset}
            disabled={latitude === null && longitude === null}
            className="bg-surface"
          >
            <RotateCcw aria-hidden className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      <p className="flex items-center gap-1.5 text-xs text-body">
        <Crosshair aria-hidden className="h-3.5 w-3.5 shrink-0 text-primary" />
        Klik peta atau geser pin untuk menentukan titik destinasi.
      </p>
      {geoError && (
        <p role="status" className="text-xs text-danger">
          {geoError}
        </p>
      )}
    </div>
  );
}
