"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  contentsApi,
  galleryApi,
  type ContentListQuery,
  type ContentPayload,
  type GalleryListQuery,
} from "../api";

const CONTENTS_KEY = "admin-contents";
export const GALLERY_KEY = "admin-gallery";

export function useAdminContents(
  query: ContentListQuery,
  token: string | null | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: [CONTENTS_KEY, query],
    queryFn: ({ signal }) =>
      contentsApi.list(query, token ?? undefined, signal),
    enabled,
    retry: false,
  });
}

export function useAdminGallery(
  query: GalleryListQuery,
  token: string | null | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: [GALLERY_KEY, query],
    queryFn: ({ signal }) => galleryApi.list(query, token ?? undefined, signal),
    enabled,
    retry: false,
  });
}

interface MutationHooks {
  token?: string;
  onSaved: (message: string) => void;
  onUnauthorized: () => void;
  onError: (error: unknown) => void;
}

/** Create/update/delete an article and refresh the admin table. */
export function useContentMutation({
  token,
  onSaved,
  onUnauthorized,
  onError,
}: MutationHooks) {
  const client = useQueryClient();

  const invalidate = () =>
    Promise.all([
      client.invalidateQueries({ queryKey: [CONTENTS_KEY] }),
      client.invalidateQueries({ queryKey: ["public-contents"] }),
    ]);

  const handleError = (error: unknown) => {
    if ((error as { status?: number })?.status === 401) onUnauthorized();
    else onError(error);
  };

  const create = useMutation({
    mutationFn: (payload: ContentPayload) =>
      contentsApi.create(payload, token).then((result) => result.data),
    onSuccess: async (content) => {
      await invalidate();
      onSaved(`Konten "${content.title}" disimpan`);
    },
    onError: handleError,
  });

  const update = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<ContentPayload>;
    }) => contentsApi.update(id, payload, token).then((result) => result.data),
    onSuccess: async (content) => {
      await invalidate();
      onSaved(`Konten "${content.title}" diperbarui`);
    },
    onError: handleError,
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      contentsApi.remove(id, token).then((result) => result.data),
    onSuccess: async () => {
      await invalidate();
      onSaved("Konten dihapus");
    },
    onError: handleError,
  });

  return { create, update, remove };
}

/** Register/rename/delete a gallery photo and refresh the grid. */
export function useGalleryMutation({
  token,
  onSaved,
  onUnauthorized,
  onError,
}: MutationHooks) {
  const client = useQueryClient();

  const invalidate = () => client.invalidateQueries({ queryKey: [GALLERY_KEY] });

  const handleError = (error: unknown) => {
    if ((error as { status?: number })?.status === 401) onUnauthorized();
    else onError(error);
  };

  const create = useMutation({
    mutationFn: (payload: {
      url: string;
      key: string;
      name: string;
      mime: string;
      size: number;
      region?: string | null;
    }) => galleryApi.create(payload, token).then((result) => result.data),
    onSuccess: async () => {
      await invalidate();
      onSaved("Foto ditambahkan ke galeri");
    },
    onError: handleError,
  });

  const update = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { name?: string; region?: string | null };
    }) => galleryApi.update(id, payload, token).then((result) => result.data),
    onSuccess: async () => {
      await invalidate();
      onSaved("Foto diperbarui");
    },
    onError: handleError,
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      galleryApi.remove(id, token).then((result) => result.data),
    onSuccess: async () => {
      await invalidate();
      onSaved("Foto dihapus");
    },
    onError: handleError,
  });

  return { create, update, remove };
}
