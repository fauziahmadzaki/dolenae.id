"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { get } from "~/lib/api/client";
import { Select } from "~/components/ui/select";
import { ErrorMessage } from "~/features/operations/shared";
import { ElevationChart } from "~/features/routes/components/elevation-chart";
import { statusLabels, type RouteGraph, type RouteProfile } from "~/features/routes/schema";

export function PublicTrails({ destinationId }: { destinationId: string }) {
  const graph = useQuery({ queryKey: ["public", "routes", destinationId], queryFn: ({ signal }) => get<RouteGraph>(`/destinations/${destinationId}/route-graph`, { signal }), retry: false });
  const [selected, setSelected] = useState("");
  const routes = graph.data?.data.routes ?? [];
  const id = routes.some((r) => r.id === selected) ? selected : routes[0]?.id;
  const route = routes.find((r) => r.id === id);
  const profile = useQuery({ queryKey: ["public", "profile", id], queryFn: ({ signal }) => get<RouteProfile>(`/routes/${id}/profile`, { signal }), enabled: !!id, retry: false });
  return <section className="space-y-4"><h2 className="font-display text-2xl font-bold text-ink">Jalur trekking & elevasi</h2><p className="text-sm text-body">Data jalur untuk persiapan, bukan navigasi GPS atau pelacakan langsung. Konfirmasi kondisi terkini ke pengelola.</p>
    {graph.isPending && <p role="status" className="text-sm text-body">Memuat jalur…</p>}<ErrorMessage error={graph.error} retry={() => void graph.refetch()} />
    {graph.data && (routes.length ? <><Select ariaLabel="Pilih jalur trekking" value={id} options={routes.map((r) => ({ value: r.id, label: r.name }))} onChange={setSelected} className="max-w-lg" />{route && <div className="space-y-2 text-sm text-body"><p>{statusLabels[route.status]} · {route.difficulty}</p><p className="whitespace-pre-wrap">{route.description}</p></div>}{profile.isPending && <p role="status" className="text-sm text-body">Memuat profil elevasi…</p>}<ErrorMessage error={profile.error} retry={() => void profile.refetch()} />{profile.data && <div className="rounded-xl border border-hairline bg-surface p-4"><ElevationChart profile={profile.data.data} /><p className="text-sm text-body">Jarak {profile.data.data.totalDistanceKm.toFixed(2)} km · naik {profile.data.data.totalGainMeters} m · turun {profile.data.data.totalLossMeters} m · estimasi {profile.data.data.estimatedDurationMinutes} menit</p></div>}</> : <p className="text-sm text-body">Jalur dan profil elevasi belum tersedia.</p>)}
  </section>;
}
