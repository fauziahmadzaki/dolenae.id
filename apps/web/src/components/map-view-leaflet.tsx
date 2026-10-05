import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { MapPoint, MapViewProps } from "./map-view";

const TILE_URL =
  import.meta.env.VITE_MAP_TILE_URL ?? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION = "&copy; OpenStreetMap";

const DEFAULT_CENTER: [number, number] = [-2.5, 118]; // Indonesia

function pin(color: string): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<span style="display:block;width:18px;height:18px;border-radius:9999px;background:${color};border:2px solid #ffffff;box-shadow:0 1px 4px rgba(0,0,0,0.45)"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10],
  });
}

const PIN = pin("#1e3b2e");
const PIN_FEATURED = pin("#b85c2a");

/** Sesuaikan viewport ke semua titik; fokus ke satu titik bila hanya satu. */
function FitBounds({ points }: { points: MapPoint[] }) {
  const map = useMap();
  const key = points
    .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng))
    .map((p) => `${p.id}:${p.lat},${p.lng}`)
    .join("|");
  useEffect(() => {
    const valid = points.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));
    const first = valid[0];
    if (!first) return;
    if (valid.length === 1) {
      map.setView([first.lat, first.lng], 13);
      return;
    }
    map.fitBounds(
      L.latLngBounds(valid.map((p) => [p.lat, p.lng] as [number, number])),
      { padding: [32, 32] },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, key]);
  return null;
}

function PickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function MapViewClient({
  points,
  center,
  zoom,
  height = 320,
  onPick,
  className,
}: MapViewProps) {
  const initialCenter = center ?? (points[0] ? [points[0].lat, points[0].lng] : DEFAULT_CENTER);

  return (
    <div
      className={"overflow-hidden rounded-[10px] border border-hairline " + (className ?? "")}
      style={{ height }}
    >
      <MapContainer
        center={initialCenter}
        zoom={zoom ?? (points.length === 1 ? 13 : 5)}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url={TILE_URL} attribution={ATTRIBUTION} />
        <FitBounds points={points} />
        {onPick && <PickHandler onPick={onPick} />}
        {points.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={p.featured ? PIN_FEATURED : PIN}>
            <Popup>
              <div className="space-y-0.5">
                <p className="text-[13px] font-semibold text-ink">{p.label}</p>
                {p.meta && <p className="text-[11px] text-body">{p.meta}</p>}
                {p.href && (
                  <a
                    href={p.href}
                    className="text-[11px] font-medium text-primary underline"
                  >
                    Lihat detail
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
