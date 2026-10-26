"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Copy,
  Eye,
  GitBranch,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Route,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "~/components/ui/dialog";
import { useToast } from "~/components/ui/toaster";
import { useAuth } from "~/features/auth/hooks/use-auth";
import { useDestination } from "~/features/destinations/hooks/use-destinations";
import { copyText } from "~/lib/clipboard";
import { cn } from "~/lib/cn";
import { MapContextMenu, type ContextMenuItem } from "./components/map-context-menu";
import { NodeDialog } from "./components/node-dialog";
import { RouteDialog } from "./components/route-dialog";
import { RouteLegend } from "./components/route-legend";
import { RouteMap, type RouteMapContextPayload } from "./components/route-map-client";
import { SegmentDialog } from "./components/segment-dialog";
import { TrackNodeIcon } from "./node-icon";
import { useRouteGraph, useRouteMutations, useRouteProfile } from "./hooks";
import {
  difficultyLabels,
  nodeTypeLabels,
  statusLabels,
  type RoutePoint,
  type RouteSegment,
  type TrackNode,
  type TrailRoute,
} from "./schema";

type Mode = "view" | "add-node" | "connect" | "route";

type DialogState =
  | { kind: "node"; mode: "create"; lat: number; lng: number }
  | { kind: "node"; mode: "edit"; node: TrackNode }
  | { kind: "segment"; segment: RouteSegment }
  | { kind: "route"; mode: "create" }
  | { kind: "route"; mode: "edit"; route: TrailRoute }
  | null;

const ID_FALLBACK = { latitude: -2.5, longitude: 118 };

const message = (error: unknown) =>
  error instanceof Error ? error.message : "Permintaan gagal.";

const formatMinutes = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} mnt`;
  return rest === 0 ? `${hours} jam` : `${hours} jam ${rest} mnt`;
};

export function RouteEditorPage({ destinationId }: { destinationId: string }) {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const enabled = auth.hydrated && !!auth.token && auth.user?.role === "admin";

  const destination = useDestination(destinationId, enabled);
  const graph = useRouteGraph(destinationId, auth.token, enabled);
  const mutations = useRouteMutations(destinationId, auth.token);

  const [mode, setMode] = useState<Mode>("view");
  const [dialog, setDialog] = useState<DialogState>(null);
  const [draftPoints, setDraftPoints] = useState<RoutePoint[]>([]);
  const [connectFrom, setConnectFrom] = useState<string | null>(null);
  const [menu, setMenu] = useState<RouteMapContextPayload | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [confirmDeleteRoute, setConfirmDeleteRoute] = useState<TrailRoute | null>(
    null,
  );

  const nodes = graph.data?.data.nodes ?? [];
  const segments = graph.data?.data.segments ?? [];
  const routes = graph.data?.data.routes ?? [];
  const nodeById = useMemo(
    () => new Map(nodes.map((node) => [node.id, node])),
    [nodes],
  );

  const profile = useRouteProfile(selectedRouteId, auth.token, enabled);
  const selectedRoute =
    routes.find((route) => route.id === selectedRouteId) ?? null;

  const center = useMemo(() => {
    const location = destination.data?.data.location;
    if (location?.latitude != null && location?.longitude != null) {
      return { latitude: location.latitude, longitude: location.longitude };
    }
    const first = nodes[0];
    return first ? first.coordinate : ID_FALLBACK;
  }, [destination.data, nodes]);

  useEffect(() => {
    if (auth.hydrated && !auth.token) router.replace("/auth/login");
  }, [auth.hydrated, auth.token, router]);

  useEffect(() => {
    if (!selectedRouteId && routes[0]) setSelectedRouteId(routes[0].id);
  }, [routes, selectedRouteId]);

  // Deep link from the preview page: ?mode=route starts drawing immediately.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("mode") === "route") {
      setMode("route");
    }
  }, []);

  const segmentError = (error: unknown) =>
    toast({ title: message(error), variant: "danger" });

  const connect = (fromNodeId: string, toNodeId: string) => {
    mutations.createSegment.mutate(
      { fromNodeId, toNodeId },
      {
        onSuccess: () => {
          toast({ title: "Ruas ditambahkan", variant: "success" });
          setConnectFrom(null);
        },
        onError: segmentError,
      },
    );
  };

  const handleNodeClick = (node: TrackNode) => {
    if (mode === "connect") {
      if (!connectFrom) {
        setConnectFrom(node.id);
        return;
      }
      if (connectFrom !== node.id) connect(connectFrom, node.id);
      return;
    }

    if (mode === "route") {
      setDraftPoints((prev) => {
        const last = prev.at(-1);
        if (last?.nodeId === node.id) return prev;
        return [
          ...prev,
          {
            latitude: node.coordinate.latitude,
            longitude: node.coordinate.longitude,
            elevationMeters: node.elevationMeters,
            nodeId: node.id,
          },
        ];
      });
      return;
    }

    setDialog({ kind: "node", mode: "edit", node });
  };

  const toggleMode = (next: Mode) => {
    setMode((prev) => (prev === next ? "view" : next));
    setConnectFrom(null);
    setMenu(null);
    if (next !== "route") setDraftPoints([]);
  };

  const copyCoordinate = async (latitude: number, longitude: number) => {
    const ok = await copyText(
      `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
    );
    toast({
      title: ok ? "Koordinat disalin" : "Gagal menyalin koordinat",
      variant: ok ? "success" : "danger",
    });
  };

  const contextMenuItems = (
    payload: RouteMapContextPayload,
  ): ContextMenuItem[] => {
    const bend: RoutePoint = {
      latitude: payload.latitude,
      longitude: payload.longitude,
      elevationMeters: null,
      nodeId: null,
    };

    if (payload.target.kind === "node") {
      const { node } = payload.target;
      return [
        {
          id: "route",
          label: "Mulai jalur dari titik ini",
          icon: Route,
          onSelect: () => {
            setMode("route");
            setConnectFrom(null);
            setDraftPoints([
              {
                latitude: node.coordinate.latitude,
                longitude: node.coordinate.longitude,
                elevationMeters: node.elevationMeters,
                nodeId: node.id,
              },
            ]);
          },
        },
        {
          id: "connect",
          label: "Sambungkan ke titik lain",
          icon: GitBranch,
          onSelect: () => {
            setMode("connect");
            setConnectFrom(node.id);
          },
        },
        {
          id: "edit",
          label: "Edit titik",
          icon: Pencil,
          onSelect: () => setDialog({ kind: "node", mode: "edit", node }),
        },
        {
          id: "copy",
          label: "Salin koordinat",
          icon: Copy,
          onSelect: () =>
            void copyCoordinate(
              node.coordinate.latitude,
              node.coordinate.longitude,
            ),
        },
      ];
    }

    if (payload.target.kind === "segment") {
      const { segment } = payload.target;
      return [
        {
          id: "edit",
          label: "Edit ruas",
          icon: Pencil,
          onSelect: () => setDialog({ kind: "segment", segment }),
        },
        {
          id: "copy",
          label: "Salin koordinat",
          icon: Copy,
          onSelect: () =>
            void copyCoordinate(payload.latitude, payload.longitude),
        },
      ];
    }

    const items: ContextMenuItem[] = [];

    if (mode === "route") {
      items.push(
        {
          id: "add-bend",
          label: "Tambah belokan di sini",
          icon: Plus,
          onSelect: () => setDraftPoints((prev) => [...prev, bend]),
        },
        {
          id: "cancel-route",
          label: "Batalkan jalur",
          icon: X,
          danger: true,
          onSelect: () => setDraftPoints([]),
        },
      );
    } else {
      items.push({
        id: "start-route",
        label: "Mulai jalur dari sini",
        icon: Route,
        onSelect: () => {
          setMode("route");
          setConnectFrom(null);
          setDraftPoints([bend]);
        },
      });
    }

    items.push(
      {
        id: "add-node",
        label: "Tambah titik di sini",
        icon: MapPin,
        onSelect: () =>
          setDialog({
            kind: "node",
            mode: "create",
            lat: payload.latitude,
            lng: payload.longitude,
          }),
      },
      {
        id: "copy",
        label: "Salin koordinat",
        icon: Copy,
        onSelect: () =>
          void copyCoordinate(payload.latitude, payload.longitude),
      },
    );

    return items;
  };

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
        <p className="mt-1 text-sm text-body">Halaman ini hanya untuk admin.</p>
      </div>
    );
  }

  const draftPath = useMemo(
    () =>
      draftPoints.map((point) => ({
        latitude: point.latitude,
        longitude: point.longitude,
      })),
    [draftPoints],
  );

  const draftAnchors = draftPoints.filter((point) => point.nodeId);
  const firstDraftAnchor = draftAnchors[0];
  const lastDraftAnchor = draftAnchors.at(-1);
  const draftSummary =
    draftPoints.length === 0
      ? "Klik peta untuk titik belokan, klik titik bernama untuk snap."
      : draftAnchors.length >= 2 && firstDraftAnchor && lastDraftAnchor
        ? `${nodeById.get(firstDraftAnchor.nodeId!)?.name ?? "Titik"} → ${
            nodeById.get(lastDraftAnchor.nodeId!)?.name ?? "Titik"
          } · ${draftPoints.length} titik`
        : `Jalur bebas · ${draftPoints.length} titik`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/destinasi/${destinationId}/rute`}
            aria-label="Kembali ke preview rute"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-surface text-body hover:bg-surface-2 hover:text-ink"
          >
            <ArrowLeft aria-hidden className="h-4 w-4" />
          </Link>
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">
              Kelola peta
            </h2>
            <p className="text-sm text-body">
              {destination.data?.data.name ?? "Destinasi"} · {nodes.length}{" "}
              titik · {segments.length} ruas · {routes.length} jalur
            </p>
          </div>
        </div>
        <Link
          href={`/admin/destinasi/${destinationId}/rute`}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-border-strong bg-surface px-4 text-sm font-semibold text-primary hover:bg-canvas-subtle"
        >
          <Eye aria-hidden className="h-4 w-4" />
          Preview
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant={mode === "add-node" ? "primary" : "secondary"}
          onClick={() => toggleMode("add-node")}
        >
          <Plus aria-hidden className="h-4 w-4" />
          Tambah titik
        </Button>
        <Button
          size="sm"
          variant={mode === "connect" ? "primary" : "secondary"}
          onClick={() => toggleMode("connect")}
        >
          <GitBranch aria-hidden className="h-4 w-4" />
          Sambung titik
        </Button>
        <Button
          size="sm"
          variant={mode === "route" ? "primary" : "secondary"}
          onClick={() => toggleMode("route")}
        >
          <MapPin aria-hidden className="h-4 w-4" />
          Gambar jalur
        </Button>
        {mode !== "view" && (
          <Button size="sm" variant="ghost" onClick={() => toggleMode("view")}>
            <X aria-hidden className="h-4 w-4" />
            Selesai
          </Button>
        )}
      </div>

      <p className="text-xs text-body">
        {mode === "add-node" && "Klik peta untuk menambah titik baru."}
        {mode === "connect" &&
          "Tarik handle di sisi titik ke titik lain, atau klik titik asal lalu titik tujuan."}
        {mode === "route" &&
          "Klik peta untuk menambah titik belokan; klik titik bernama untuk snap. Minimal dua titik lalu Simpan jalur."}
        {mode === "view" &&
          "Klik titik untuk mengedit, klik ruas untuk detail, atau klik kanan peta untuk menu cepat."}
        {connectFrom && mode === "connect" && (
          <span className="ml-1 font-semibold text-primary">
            Titik asal: {nodeById.get(connectFrom)?.name}
          </span>
        )}
      </p>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-2">
          <RouteMap
            center={center}
            nodes={nodes}
            segments={segments}
            routes={routes}
            selectedRouteId={selectedRouteId}
            draftPath={draftPath}
            draftNodeIds={draftPoints
              .map((point) => point.nodeId)
              .filter((id): id is string => Boolean(id))}
            mode={mode}
          onMapClick={(lat, lng) => {
            if (mode === "add-node") {
              setDialog({ kind: "node", mode: "create", lat, lng });
            }
            if (mode === "route") {
              setDraftPoints((prev) => [
                ...prev,
                {
                  latitude: lat,
                  longitude: lng,
                  elevationMeters: null,
                  nodeId: null,
                },
              ]);
            }
          }}
          onNodeClick={handleNodeClick}
          onSegmentClick={(segment) => setDialog({ kind: "segment", segment })}
          onConnect={connect}
          onContextMenu={setMenu}
          overlay={
            menu ? (
              <MapContextMenu
                x={menu.x}
                y={menu.y}
                items={contextMenuItems(menu)}
                onClose={() => setMenu(null)}
              />
            ) : null
          }
        />
          <RouteLegend />
        </div>

        <aside className="space-y-4">
          {mode === "route" && (
            <div className="rounded-xl border border-hairline bg-surface p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-body">
                Jalur baru ({draftPoints.length} titik)
              </p>
              <div className="mt-2 text-xs text-body">{draftSummary}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  disabled={draftPoints.length < 2}
                  onClick={() => setDialog({ kind: "route", mode: "create" })}
                >
                  Simpan jalur
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={draftPoints.length === 0}
                  onClick={() =>
                    setDraftPoints((prev) => prev.slice(0, -1))
                  }
                >
                  Hapus terakhir
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDraftPoints([])}
                >
                  Reset
                </Button>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-hairline bg-surface p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-body">
              Titik ({nodes.length})
            </p>
            <ul className="mt-2 max-h-56 space-y-1 overflow-auto">
              {nodes.map((node) => (
                <li key={node.id}>
                  <button
                    type="button"
                    onClick={() => setDialog({ kind: "node", mode: "edit", node })}
                    className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-canvas-subtle"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      {node.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={node.imageUrl}
                          alt=""
                          className="h-8 w-8 shrink-0 rounded-md object-cover"
                        />
                      ) : (
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-canvas-subtle text-primary">
                          <TrackNodeIcon
                            type={node.type}
                            className="h-4 w-4"
                          />
                        </span>
                      )}
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-ink">
                          {node.name}
                        </span>
                        <span className="text-body">
                          {nodeTypeLabels[node.type]}
                        </span>
                      </span>
                    </span>
                    <span className="shrink-0 text-body">
                      {node.elevationMeters} m
                    </span>
                  </button>
                </li>
              ))}
              {nodes.length === 0 && (
                <li className="px-2 py-1.5 text-xs text-body">
                  Belum ada titik.
                </li>
              )}
            </ul>
          </div>

          <div className="rounded-xl border border-hairline bg-surface p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-body">
              Jalur ({routes.length})
            </p>
            <ul className="mt-2 space-y-1">
              {routes.map((route) => (
                <li
                  key={route.id}
                  className={cn(
                    "flex items-center justify-between gap-1 rounded-md px-2 py-1.5",
                    route.id === selectedRouteId && "bg-canvas-subtle",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedRouteId(route.id)}
                    className="min-w-0 flex-1 text-left text-xs"
                  >
                    <span className="block truncate font-semibold text-ink">
                      {route.name}
                    </span>
                    <span className="text-body">
                      {statusLabels[route.status]} ·{" "}
                      {difficultyLabels[route.difficulty]}
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label={`Edit ${route.name}`}
                    onClick={() =>
                      setDialog({ kind: "route", mode: "edit", route })
                    }
                    className="rounded-md p-1.5 text-body hover:bg-surface-2 hover:text-ink"
                  >
                    <Pencil aria-hidden className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Hapus ${route.name}`}
                    onClick={() => setConfirmDeleteRoute(route)}
                    className="rounded-md p-1.5 text-body hover:bg-danger/10 hover:text-danger"
                  >
                    <Trash2 aria-hidden className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
              {routes.length === 0 && (
                <li className="px-2 py-1.5 text-xs text-body">
                  Belum ada jalur.
                </li>
              )}
            </ul>
          </div>

          {selectedRoute && profile.data && (
            <div className="rounded-xl border border-hairline bg-surface p-3 text-xs">
              <p className="font-semibold text-ink">{selectedRoute.name}</p>
              <dl className="mt-2 grid grid-cols-2 gap-2 text-body">
                <div>
                  <dt>Jarak</dt>
                  <dd className="font-semibold text-ink">
                    {profile.data.data.totalDistanceKm} km
                  </dd>
                </div>
                <div>
                  <dt>Naik / turun</dt>
                  <dd className="font-semibold text-ink">
                    +{profile.data.data.totalGainMeters} / -
                    {profile.data.data.totalLossMeters} m
                  </dd>
                </div>
                <div>
                  <dt>Estimasi</dt>
                  <dd className="font-semibold text-ink">
                    {formatMinutes(
                      profile.data.data.estimatedDurationMinutes,
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Grade terberat</dt>
                  <dd className="font-semibold text-ink">
                    {profile.data.data.steepestGradePercent}%
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </aside>
      </div>

      {dialog?.kind === "node" && dialog.mode === "create" && (
        <NodeDialog
          mode="create"
          latitude={dialog.lat}
          longitude={dialog.lng}
          token={auth.token}
          isPending={mutations.createNode.isPending}
          error={mutations.createNode.error}
          onClose={() => setDialog(null)}
          onSubmit={(values) =>
            mutations.createNode.mutate(
              { ...values, latitude: dialog.lat, longitude: dialog.lng },
              {
                onSuccess: () => {
                  setDialog(null);
                  toast({ title: "Titik ditambahkan", variant: "success" });
                },
              },
            )
          }
        />
      )}

      {dialog?.kind === "node" && dialog.mode === "edit" && (
        <NodeDialog
          mode="edit"
          node={dialog.node}
          latitude={dialog.node.coordinate.latitude}
          longitude={dialog.node.coordinate.longitude}
          token={auth.token}
          isPending={mutations.updateNode.isPending || mutations.deleteNode.isPending}
          error={mutations.updateNode.error ?? mutations.deleteNode.error}
          onClose={() => setDialog(null)}
          onSubmit={(values) =>
            mutations.updateNode.mutate(
              { id: dialog.node.id, body: values },
              {
                onSuccess: () => {
                  setDialog(null);
                  toast({ title: "Titik diperbarui", variant: "success" });
                },
              },
            )
          }
          onDelete={() =>
            mutations.deleteNode.mutate(dialog.node.id, {
              onSuccess: () => {
                setDialog(null);
                toast({ title: "Titik dihapus", variant: "success" });
              },
              onError: segmentError,
            })
          }
        />
      )}

      {dialog?.kind === "segment" && (
        <SegmentDialog
          segment={dialog.segment}
          nodes={nodes}
          isPending={mutations.updateSegment.isPending || mutations.deleteSegment.isPending}
          error={mutations.updateSegment.error ?? mutations.deleteSegment.error}
          onClose={() => setDialog(null)}
          onSubmit={(values) =>
            mutations.updateSegment.mutate(
              {
                id: dialog.segment.id,
                body: {
                  ...values,
                  notes: values.notes.trim() || null,
                },
              },
              {
                onSuccess: () => {
                  setDialog(null);
                  toast({ title: "Ruas diperbarui", variant: "success" });
                },
              },
            )
          }
          onDelete={() =>
            mutations.deleteSegment.mutate(dialog.segment.id, {
              onSuccess: () => {
                setDialog(null);
                toast({ title: "Ruas dihapus", variant: "success" });
              },
              onError: segmentError,
            })
          }
        />
      )}

      {dialog?.kind === "route" && (
        <RouteDialog
          mode={dialog.mode}
          route={dialog.mode === "edit" ? dialog.route : undefined}
          pointSummary={draftSummary}
          isPending={mutations.createRoute.isPending || mutations.updateRoute.isPending}
          error={mutations.createRoute.error ?? mutations.updateRoute.error}
          onClose={() => setDialog(null)}
          onSubmit={(values) => {
            if (dialog.mode === "edit") {
              mutations.updateRoute.mutate(
                {
                  id: dialog.route.id,
                  body: {
                    ...values,
                    description: values.description.trim() || null,
                  },
                },
                {
                  onSuccess: () => {
                    setDialog(null);
                    toast({ title: "Jalur diperbarui", variant: "success" });
                  },
                },
              );
              return;
            }

            mutations.createRoute.mutate(
              {
                ...values,
                description: values.description.trim() || null,
                points: draftPoints,
                basecampNodeId:
                  draftPoints.find((point) => point.nodeId)?.nodeId ?? null,
              },
              {
                onSuccess: (result) => {
                  setDialog(null);
                  setMode("view");
                  setDraftPoints([]);
                  setSelectedRouteId(result.data.id);
                  toast({ title: "Jalur disimpan", variant: "success" });
                },
                onError: segmentError,
              },
            );
          }}
        />
      )}

      {confirmDeleteRoute && (
        <Dialog
          open
          onOpenChange={(open) => !open && setConfirmDeleteRoute(null)}
        >
          <DialogContent className="w-[420px]">
            <DialogTitle>Hapus jalur?</DialogTitle>
            <DialogDescription>
              Jalur “{confirmDeleteRoute.name}” akan dihapus. Titik dan ruasnya
              tetap tersimpan.
            </DialogDescription>
            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => setConfirmDeleteRoute(null)}
              >
                Batal
              </Button>
              <Button
                className="bg-danger hover:bg-danger/90"
                disabled={mutations.deleteRoute.isPending}
                onClick={() =>
                  mutations.deleteRoute.mutate(confirmDeleteRoute.id, {
                    onSuccess: () => {
                      if (selectedRouteId === confirmDeleteRoute.id) {
                        setSelectedRouteId(null);
                      }
                      setConfirmDeleteRoute(null);
                      toast({ title: "Jalur dihapus", variant: "success" });
                    },
                    onError: segmentError,
                  })
                }
              >
                Hapus jalur
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
