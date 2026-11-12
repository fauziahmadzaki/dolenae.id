"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "~/lib/api/types";
import { usersApi, type UserListQuery } from "../api/users";

export function useUsers(
  query: UserListQuery,
  token: string | null | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ["users", query],
    queryFn: ({ signal }) => usersApi.list(query, token ?? undefined, signal),
    enabled,
    retry: false,
  });
}

export function useUser(
  id: string | undefined,
  token: string | null | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: ({ signal }) => usersApi.get(id!, token ?? undefined, signal),
    enabled: enabled && Boolean(id),
    retry: false,
  });
}

export type UserMutationInput =
  | { kind: "create"; payload: unknown }
  | { kind: "edit"; id: string; payload: unknown }
  | { kind: "delete"; id: string };

interface MutationOptions {
  token?: string;
  onSaved: () => void;
  onUnauthorized: () => void;
}

export function useUserMutation({
  token,
  onSaved,
  onUnauthorized,
}: MutationOptions) {
  const cache = useQueryClient();

  return useMutation({
    mutationFn: async (input: UserMutationInput): Promise<unknown> => {
      switch (input.kind) {
        case "create":
          return usersApi.create(input.payload, token);
        case "edit":
          return usersApi.update(input.id, input.payload, token);
        case "delete":
          return usersApi.remove(input.id, token);
      }
    },
    onSuccess: () => {
      cache.invalidateQueries({ queryKey: ["users"] });
      onSaved();
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 401) onUnauthorized();
    },
  });
}
