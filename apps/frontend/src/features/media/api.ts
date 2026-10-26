import { del, post } from "~/lib/api/client";

export interface UploadedImage {
  url: string;
  key: string;
  name: string;
  size: number;
  mime: string;
}

/** Admin image endpoints (`/api/uploads`). */
export const uploadsApi = {
  upload: (file: File, token?: string | null, folder = "destinations") => {
    const body = new FormData();
    body.append("file", file);

    return post<UploadedImage>(
      `/uploads?folder=${encodeURIComponent(folder)}`,
      body,
      { token: token ?? undefined },
    );
  },

  remove: (url: string, token?: string | null) =>
    del<{ key: string; deleted: true }>(
      `/uploads?url=${encodeURIComponent(url)}`,
      { token: token ?? undefined },
    ),
};
