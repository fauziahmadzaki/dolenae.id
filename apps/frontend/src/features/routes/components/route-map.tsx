"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "~/lib/cn";
import {
  NODE_TYPE_COLORS,
  type RouteSegment,
  type TrackNode,
  type TrailRoute,
} from "~/features/routes/schema";
import { nodeIconSvg } from "~/features/routes/node-icon";
import { routeLineStyle } from "~/features/routes/style";

export type RouteMapContextTarget =
  | { kind: "map" }
  | { kind: "node"; node: TrackNode }
  | { kind: "segment"; segment: RouteSegment };

export interface RouteMapContextPayload {
  /** Position relative to the map container (for the floating menu). */
  x: number;
  y: number;
  latitude: number;
  longitude: number;
  target: RouteMapContextTarget;
}

export interface RouteMapProps {
  center: { latitude: number; longitude: number };
  nodes: TrackNode[];
  segments: RouteSegment[];
  routes: TrailRoute[];
  selectedRouteId?: string | null;
  draftNodeIds?: string[];
  /** Polyline being drawn for a new route. */
  draftPath?: { latitude: number; longitude: number }[];
  mode?: "view" | "add-node" | "connect" | "route";
  onMapClick?: (lat: number, lng: number) => void;
  onNodeClick?: (node: TrackNode) => void;
  onSegmentClick?: (segment: RouteSegment) => void;
  onConnect?: (fromNodeId: string, toNodeId: string) => void;
  onContextMenu?: (payload: RouteMapContextPayload | null) => void;
  /** Rendered inside the map wrapper (e.g. the context menu). */
  overlay?: ReactNode;
  className?: string;
}

const markerHtml = (node: TrackNode, connectMode: boolean, draft: boolean) => {
  const color = NODE_TYPE_COLORS[node.type];
  return `
    <div data-node-id="${node.id}" style="position:relative;width:24px;height:24px;cursor:pointer;">
      <span style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:9999px;border:2px solid #fff;background:${color};box-shadow:0 1px 4px rgba(0,0,0,.35);${
        draft ? "outline:2px solid #b5651d;outline-offset:2px;" : ""
      }">${nodeIconSvg(node.type)}</span>
      <span style="position:absolute;left:28px;top:50%;transform:translateY(-50%);white-space:nowrap;font:600 10px/1.2 system-ui,sans-serif;background:#fff;border:1px solid #e3e0d6;color:#233;padding:1px 5px;border-radius:4px;">${node.name} · ${node.elevationMeters} m</span>
      ${
        connectMode
          ? `<span class="connect-handle" title="Tarik ke titik lain" style="position:absolute;right:-10px;top:50%;transform:translateY(-50%);width:12px;height:12px;border-radius:9999px;background:#1e3b2e;border:2px solid #fff;cursor:crosshair;box-shadow:0 1px 3px rgba(0,0,0,.35);"></span>`
          : ""
      }
    </div>
  `;
};

export function RouteMap({
  center,
  nodes,
  segments,
  routes,
  selectedRouteId = null,
  draftNodeIds = [],
  draftPath = [],
  mode = "view",
  onMapClick,
  onNodeClick,
  onSegmentClick,
  onConnect,
  onContextMenu,
  overlay,
  className,
}: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const segmentLayer = useRef<L.LayerGroup | null>(null);
  const nodeLayer = useRef<L.LayerGroup | null>(null);
  const draftLayer = useRef<L.LayerGroup | null>(null);
  const callbacks = useRef({
    onMapClick,
    onNodeClick,
    onSegmentClick,
    onConnect,
    onContextMenu,
  });
  const nodesRef = useRef(nodes);
  const modeRef = useRef(mode);

  useEffect(() => {
    callbacks.current = {
      onMapClick,
      onNodeClick,
      onSegmentClick,
      onConnect,
      onContextMenu,
    };
  }, [onMapClick, onNodeClick, onSegmentClick, onConnect, onContextMenu]);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    const map = L.map(container, { scrollWheelZoom: true }).setView(
      [center.latitude, center.longitude],
      13,
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    segmentLayer.current = L.layerGroup().addTo(map);
    draftLayer.current = L.layerGroup().addTo(map);
    nodeLayer.current = L.layerGroup().addTo(map);

    map.on("click", (event: L.LeafletMouseEvent) => {
      callbacks.current.onContextMenu?.(null);
      callbacks.current.onMapClick?.(event.latlng.lat, event.latlng.lng);
    });

    map.on("contextmenu", (event: L.LeafletMouseEvent) => {
      event.originalEvent.preventDefault();
      callbacks.current.onContextMenu?.({
        x: event.containerPoint.x,
        y: event.containerPoint.y,
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
        target: { kind: "map" },
      });
    });

    map.on("movestart zoomstart", () => {
      callbacks.current.onContextMenu?.(null);
    });

    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapRef.current = null;
      segmentLayer.current = null;
      nodeLayer.current = null;
      draftLayer.current = null;
    };
    // Center is handled separately below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    mapRef.current?.setView([center.latitude, center.longitude], 13);
  }, [center.latitude, center.longitude]);

  // Draw segments and nodes.
  useEffect(() => {
    const map = mapRef.current;
    const layer = segmentLayer.current;
    const markerLayer = nodeLayer.current;
    if (!map || !layer || !markerLayer) return;

    layer.clearLayers();
    markerLayer.clearLayers();

    const nodeById = new Map(nodes.map((node) => [node.id, node]));
    const selected = routes.find((route) => route.id === selectedRouteId);
    const highlighted = new Set(selected?.segmentIds ?? []);

    for (const segment of segments) {
      const from = nodeById.get(segment.fromNodeId);
      const to = nodeById.get(segment.toNodeId);
      if (!from || !to) continue;

      const active = highlighted.has(segment.id);
      const line = L.polyline(
        [
          [from.coordinate.latitude, from.coordinate.longitude],
          [to.coordinate.latitude, to.coordinate.longitude],
        ],
        {
          color: active ? "#1e3b2e" : "#7c8a7f",
          weight: active ? 5 : 2,
          opacity: active ? 0.95 : 0.7,
          dashArray: segment.seasonal ? "6 5" : undefined,
        },
      ).addTo(layer);

      line.on("click", (event) => {
        L.DomEvent.stopPropagation(event);
        callbacks.current.onSegmentClick?.(segment);
      });

      line.on("contextmenu", (event) => {
        L.DomEvent.stopPropagation(event);
        event.originalEvent.preventDefault();
        const point = map.mouseEventToContainerPoint(event.originalEvent);
        callbacks.current.onContextMenu?.({
          x: point.x,
          y: point.y,
          latitude: event.latlng.lat,
          longitude: event.latlng.lng,
          target: { kind: "segment", segment },
        });
      });
    }

    // Draw every trail with its own surface/condition style, selected last.
    const orderedRoutes = [...routes].sort((first, second) => {
      if (first.id === selectedRouteId) return 1;
      if (second.id === selectedRouteId) return -1;
      return 0;
    });

    for (const route of orderedRoutes) {
      if (route.points.length < 2) continue;
      const selected = route.id === selectedRouteId;
      L.polyline(
        route.points.map(
          (point) => [point.latitude, point.longitude] as [number, number],
        ),
        routeLineStyle(route.surface, route.status, selected),
      )
        .bindTooltip(route.name, { sticky: true })
        .addTo(layer);
    }

    for (const node of nodes) {
      const draft = draftNodeIds.includes(node.id);
      const marker = L.marker(
        [node.coordinate.latitude, node.coordinate.longitude],
        {
          icon: L.divIcon({
            className: "",
            html: markerHtml(node, mode === "connect", draft),
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          }),
          keyboard: false,
        },
      ).addTo(markerLayer);

      marker.on("click", (event) => {
        L.DomEvent.stopPropagation(event);
        callbacks.current.onNodeClick?.(node);
      });

      marker.on("contextmenu", (event) => {
        L.DomEvent.stopPropagation(event);
        event.originalEvent.preventDefault();
        const point = map.mouseEventToContainerPoint(event.originalEvent);
        callbacks.current.onContextMenu?.({
          x: point.x,
          y: point.y,
          latitude: event.latlng.lat,
          longitude: event.latlng.lng,
          target: { kind: "node", node },
        });
      });

      const element = marker.getElement();
      const handle = element?.querySelector<HTMLElement>(".connect-handle");
      handle?.addEventListener("pointerdown", (event) => {
        event.stopPropagation();
        event.preventDefault();

        const from = nodesRef.current.find((item) => item.id === node.id);
        if (!from || !mapRef.current) return;

        const currentMap = mapRef.current;
        currentMap.dragging.disable();

        const line = L.polyline(
          [
            [from.coordinate.latitude, from.coordinate.longitude],
            [from.coordinate.latitude, from.coordinate.longitude],
          ],
          { color: "#1e3b2e", weight: 3, dashArray: "6 4" },
        ).addTo(currentMap);

        const move = (moveEvent: L.LeafletMouseEvent) => {
          line.setLatLngs([
            [from.coordinate.latitude, from.coordinate.longitude],
            [moveEvent.latlng.lat, moveEvent.latlng.lng],
          ]);
        };
        currentMap.on("mousemove", move);

        const finish = (upEvent: PointerEvent) => {
          currentMap.off("mousemove", move);
          currentMap.dragging.enable();
          line.remove();

          const target = document
            .elementFromPoint(upEvent.clientX, upEvent.clientY)
            ?.closest<HTMLElement>("[data-node-id]");
          const toId = target?.dataset.nodeId;
          if (toId && toId !== from.id) {
            callbacks.current.onConnect?.(from.id, toId);
          }
        };

        document.addEventListener("pointerup", finish, { once: true });
      });
    }
  }, [nodes, segments, routes, selectedRouteId, draftNodeIds, mode]);

  // Draft route preview while composing a route.
  useEffect(() => {
    const layer = draftLayer.current;
    if (!layer) return;
    layer.clearLayers();

    const path =
      draftPath.length >= 2
        ? draftPath
        : mode === "route" && draftNodeIds.length >= 2
          ? draftNodeIds
              .map((id) => nodes.find((node) => node.id === id))
              .filter((node): node is TrackNode => Boolean(node))
              .map((node) => node.coordinate)
          : [];

    if (mode !== "route" || path.length < 2) return;

    L.polyline(
      path.map((point) => [point.latitude, point.longitude] as [number, number]),
      { color: "#b5651d", weight: 3, dashArray: "4 6" },
    ).addTo(layer);
  }, [mode, draftPath, draftNodeIds, nodes]);

  return (
    <div
      className={cn(
        "relative z-0 h-[420px] w-full overflow-hidden rounded-xl border border-hairline",
        className,
      )}
    >
      <div ref={containerRef} className="h-full w-full" />
      {overlay}
    </div>
  );
}
