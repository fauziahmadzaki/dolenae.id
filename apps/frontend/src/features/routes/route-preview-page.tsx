"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2, Map as MapIcon, Ruler } from "lucide-react";
import { useAuth } from "~/features/auth/hooks/use-auth";
import { useDestination } from "~/features/destinations/hooks/use-destinations";
import { cn } from "~/lib/cn";
import { ElevationChart } from "./components/elevation-chart";
import { RouteMap } from "./components/route-map-client";
import { useRouteGraph, useRouteProfile } from "./hooks";
import {
  difficultyLabels,
  gradeLabels,
  nodeTypeLabels,
  statusLabels,
  surfaceLabels,
  type TrailRoute,
} from "./schema";

const formatMinutes = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} mnt`;
  return rest === 0 ? `${hours} jam` : `${hours} jam ${rest} mnt`;
};

const ID_FALLBACK = { latitude: -2.5, longitude: 118 };

export function RoutePreviewPage({ destinationId }: { destinationId: string }) {
  const auth = useAuth();
  const router = useRouter();
  const enabled = auth.hydrated && !!auth.token && auth.user?.role === "admin";

  const destination = useDestination(destinationId, enabled);
  const graph = useRouteGraph(destinationId, auth.token, enabled);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const profile = useRouteProfile(selectedId, auth.token, enabled);

  const nodes = graph.data?.data.nodes ?? [];
  const segments = graph.data?.data.segments ?? [];
  const routes = graph.data?.data.routes ?? [];

  useEffect(() => {
    if (!selectedId && routes[0]) setSelectedId(routes[0].id);
  }, [routes, selectedId]);

  const selected = routes.find((route) => route.id === selectedId) ?? null;

  const center = useMemo(() => {
    const location = destination.data?.data.location;
    if (location?.latitude != null && location?.longitude != null) {
      return { latitude: location.latitude, longitude: location.longitude };
    }
    const first = nodes[0];
    return first ? first.coordinate : ID_FALLBACK;
  }, [destination.data, nodes]);

  const nodeById = useMemo(
    () => new Map(nodes.map((node) => [node.id, node])),
    [nodes],
  );

  const selectedPath = useMemo(
    () =>
      selected?.points.map((point) => ({
        latitude: point.latitude,
        longitude: point.longitude,
      })) ?? [],
    [selected],
  );

  useEffect(() => {
    if (auth.hydrated && !auth.token) router.replace("/auth/login");
  }, [auth.hydrated, auth.token, router]);

  if (!auth.hydrated || !auth.token) {
    return (
      <p role="status" className="flex items-center gap-2 text-sm text-body">
        <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
        Memeriksa sesi…
      </p>
    );
  }

  if (!enabled) {
    return (
      <div className="rounded-xl border border-hairline bg-surface p-8">
        <h2 className="font-display text-xl font-bold text-ink">
          Akses ditolak
        </h2>
        <p className="mt-1 text-sm text-body">
          Halaman ini hanya untuk admin.
        </p>
      </div>
    );
  }

  const routeNodes = (route: TrailRoute) =>
    route.points.map(
      (point, index) =>
        (point.nodeId ? nodeById.get(point.nodeId)?.name : null) ??
        `Belokan ${index + 1}`,
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/destinasi"
            aria-label="Kembali ke daftar destinasi"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-surface text-body hover:bg-surface-2 hover:text-ink"
          >
            <ArrowLeft aria-hidden className="h-4 w-4" />
          </Link>
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">
              Jalur &amp; Elevasi
            </h2>
            <p className="mt-1 text-sm text-body">
              {destination.data?.data.name ?? "Destinasi"} · {nodes.length}{" "}
              titik · {routes.length} jalur
            </p>
          </div>
        </div>
        <Link
          href={`/admin/destinasi/${destinationId}/rute/peta`}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-on-primary hover:bg-primary-hover"
        >
          <MapIcon aria-hidden className="h-4 w-4" />
          Kelola di peta
        </Link>
      </div>

      {graph.isPending ? (
        <p role="status" className="text-sm text-body">
          Memuat jaringan rute…
        </p>
      ) : graph.isError ? (
        <div className="rounded-lg border border-hairline bg-surface p-6 text-sm text-danger">
          Gagal memuat rute. Coba muat ulang halaman.
        </div>
      ) : (
        <>
          <RouteMap
            center={center}
            nodes={nodes}
            segments={segments}
            routes={routes}
            selectedRouteId={selectedId}
            selectedPath={selectedPath}
            mode="view"
          />

          <div className="flex flex-wrap gap-2 text-xs text-body">
            {[...new Set(nodes.map((node) => node.type))].map((type) => (
              <span
                key={type}
                className="rounded-full bg-surface-2 px-2.5 py-1 font-semibold"
              >
                {nodeTypeLabels[type]}
              </span>
            ))}
          </div>

          {routes.length === 0 ? (
            <div className="rounded-lg border border-dashed border-hairline bg-surface p-10 text-center">
              <h3 className="font-display font-semibold text-ink">
                Belum ada jalur
              </h3>
              <p className="mt-1 text-sm text-body">
                Tambahkan titik dan sambungkan menjadi jalur di peta.
              </p>
              <Link
                href={`/admin/destinasi/${destinationId}/rute/peta`}
                className="mt-3 inline-block text-sm font-semibold text-primary underline"
              >
                Buka route builder
              </Link>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {routes.map((route) => (
                <button
                  key={route.id}
                  type="button"
                  onClick={() => setSelectedId(route.id)}
                  className={cn(
                    "rounded-xl border bg-surface p-4 text-left transition-colors",
                    route.id === selectedId
                      ? "border-primary ring-1 ring-primary/30"
                      : "border-hairline hover:bg-canvas-subtle",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-display font-semibold text-ink">
                      {route.name}
                    </p>
                    {route.recommended && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                        Rekomendasi
                      </span>
                    )}
                  </div>
                  <p className="mt-1 truncate text-xs text-body">
                    {routeNodes(route).slice(0, 2).join(" → ")}
                    {routeNodes(route).length > 2 ? " → …" : ""}
                  </p>
                  <p className="mt-2 text-xs text-body">
                    {difficultyLabels[route.difficulty]} ·{" "}
                    {statusLabels[route.status]}
                  </p>
                </button>
              ))}
            </div>
          )}

          {selected && (
            <section className="space-y-4 rounded-xl border border-hairline bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-bold text-ink">
                    {selected.name}
                  </h3>
                  <p className="text-sm text-body">
                    {routeNodes(selected).join(" → ")}
                  </p>
                </div>
                <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold text-body">
                  {statusLabels[selected.status]}
                </span>
              </div>

              {profile.isPending ? (
                <p role="status" className="text-sm text-body">
                  Menghitung profil…
                </p>
              ) : profile.data ? (
                <>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    <Stat
                      label="Jarak"
                      value={`${profile.data.data.totalDistanceKm} km`}
                    />
                    <Stat
                      label="Total naik"
                      value={`${profile.data.data.totalGainMeters} m`}
                    />
                    <Stat
                      label="Total turun"
                      value={`${profile.data.data.totalLossMeters} m`}
                    />
                    <Stat
                      label="Estimasi"
                      value={formatMinutes(
                        profile.data.data.estimatedDurationMinutes,
                      )}
                    />
                    <Stat
                      label="Grade terberat"
                      value={`${profile.data.data.steepestGradePercent}%`}
                    />
                  </div>

                  <ElevationChart profile={profile.data.data} />
                </>
              ) : null}

              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
                  <Ruler aria-hidden className="h-4 w-4" />
                  {selected.segmentIds.length > 0
                    ? "Ruas penyusun"
                    : "Titik jalur"}
                </h4>
                {selected.segmentIds.length > 0 ? (
                  <ul className="divide-y divide-hairline rounded-lg border border-hairline">
                    {selected.segmentIds.map((segmentId, index) => {
                      const segment = segments.find(
                        (item) => item.id === segmentId,
                      );
                      if (!segment) return null;
                      const from =
                        nodeById.get(segment.fromNodeId)?.name ?? "?";
                      const to = nodeById.get(segment.toNodeId)?.name ?? "?";

                      return (
                        <li
                          key={`${segmentId}-${index}`}
                          className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-sm"
                        >
                          <span className="font-medium text-ink">
                            {from} → {to}
                          </span>
                          <span className="text-xs text-body">
                            {surfaceLabels[segment.surface]} ·{" "}
                            {gradeLabels[segment.grade]}
                            {segment.distanceKm != null
                              ? ` · ${segment.distanceKm} km`
                              : ""}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <ul className="divide-y divide-hairline rounded-lg border border-hairline">
                    {selected.points.map((point, index) => (
                      <li
                        key={`${point.latitude}-${point.longitude}-${index}`}
                        className="flex items-center justify-between gap-2 px-3 py-2.5 text-sm"
                      >
                        <span className="font-medium text-ink">
                          {index + 1}.{" "}
                          {(point.nodeId
                            ? nodeById.get(point.nodeId)?.name
                            : null) ?? `Belokan ${index + 1}`}
                        </span>
                        <span className="text-xs text-body">
                          {point.elevationMeters != null
                            ? `${point.elevationMeters} m`
                            : "elevasi belum diisi"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-canvas-subtle p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-body">
        {label}
      </p>
      <p className="mt-0.5 font-display text-lg font-bold text-ink">{value}</p>
    </div>
  );
}
