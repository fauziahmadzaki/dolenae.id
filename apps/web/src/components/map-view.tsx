import { useEffect, useState } from "react";

export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  label: string;
  /** Sub-label singkat (mis. provinsi · mdpl). */
  meta?: string;
  /** Tautan "Buka/lIhat detail" di popup. */
  href?: string;
  /** Pin aksen (mis. basecamp/accessPoint). */
  featured?: boolean;
}

export interface MapViewProps {
  points: MapPoint[];
  center?: [number, number];
  zoom?: number;
  /** Tinggi area peta (px). Default 320. */
  height?: number;
  /** Aktifkan mode pilih: klik peta memanggil `onPick`. */
  onPick?: (lat: number, lng: number) => void;
  className?: string;
}

type Impl = React.ComponentType<MapViewProps>;

/**
 * Peta Leaflet yang aman untuk SSR: implementasi asli (leaflet + react-leaflet)
 * hanya dimuat di klien lewat dynamic import, sehingga tidak menyentuh `window`
 * saat render server.
 */
export function MapView(props: MapViewProps) {
  const [Impl, setImpl] = useState<Impl | null>(null);

  useEffect(() => {
    let active = true;
    void import("./map-view-leaflet").then((m) => {
      if (active) setImpl(() => m.MapViewClient);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!Impl) {
    return (
      <div
        className={
          "flex items-center justify-center rounded-[10px] bg-canvas-subtle text-xs text-body " +
          (props.className ?? "")
        }
        style={{ height: props.height ?? 320 }}
      >
        Memuat peta…
      </div>
    );
  }
  return <Impl {...props} />;
}
