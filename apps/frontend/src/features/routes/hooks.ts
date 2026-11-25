"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { routesApi, type TrackNodeInput } from "./api";

export function useRouteGraph(
  destinationId: string | undefined,
  token: string | null | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ["route-graph", destinationId],
    queryFn: ({ signal }) => routesApi.graph(destinationId!, token, signal),
    enabled: enabled && Boolean(destinationId),
    retry: false,
  });
}

export function useRouteProfile(
  routeId: string | null,
  token: string | null | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ["route-profile", routeId],
    queryFn: ({ signal }) => routesApi.profile(routeId!, token, signal),
    enabled: enabled && Boolean(routeId),
    retry: false,
  });
}

/** One place to invalidate the graph after any mutation. */
export function useRouteMutations(
  destinationId: string,
  token: string | null | undefined,
) {
  const cache = useQueryClient();
  const invalidate = () => {
    cache.invalidateQueries({ queryKey: ["route-graph", destinationId] });
    cache.invalidateQueries({ queryKey: ["route-profile"] });
  };

  const createNode = useMutation({
    mutationFn: (body: TrackNodeInput) =>
      routesApi.createNode(destinationId, body, token),
    onSuccess: invalidate,
  });

  const updateNode = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Partial<TrackNodeInput>;
    }) => routesApi.updateNode(id, body, token),
    onSuccess: invalidate,
  });

  const deleteNode = useMutation({
    mutationFn: (id: string) => routesApi.deleteNode(id, token),
    onSuccess: invalidate,
  });

  const createSegment = useMutation({
    mutationFn: (body: { fromNodeId: string; toNodeId: string }) =>
      routesApi.createSegment(destinationId, body, token),
    onSuccess: invalidate,
  });

  const updateSegment = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      routesApi.updateSegment(id, body, token),
    onSuccess: invalidate,
  });

  const deleteSegment = useMutation({
    mutationFn: (id: string) => routesApi.deleteSegment(id, token),
    onSuccess: invalidate,
  });

  const createRoute = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      routesApi.createRoute(destinationId, body, token),
    onSuccess: invalidate,
  });

  const updateRoute = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      routesApi.updateRoute(id, body, token),
    onSuccess: invalidate,
  });

  const deleteRoute = useMutation({
    mutationFn: (id: string) => routesApi.deleteRoute(id, token),
    onSuccess: invalidate,
  });

  return {
    createNode,
    updateNode,
    deleteNode,
    createSegment,
    updateSegment,
    deleteSegment,
    createRoute,
    updateRoute,
    deleteRoute,
  };
}
