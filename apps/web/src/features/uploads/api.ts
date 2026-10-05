export interface UploadedFile {
  url: string;
  key: string;
  name: string;
  size: number;
  mime: string;
}

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";

/**
 * Upload gambar ke endpoint global `POST /api/uploads`.
 * Kirim via FormData (jangan set content-type manual agar boundary benar).
 */
export async function uploadImage(
  token: string,
  file: File,
  folder?: string,
): Promise<UploadedFile> {
  const form = new FormData();
  form.append("file", file);

  const qs = folder ? `?folder=${encodeURIComponent(folder)}` : "";
  const res = await fetch(`${API_URL}/uploads${qs}`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
    body: form,
  });

  const body = (await res.json().catch(() => null)) as
    | { success: true; data: UploadedFile }
    | { success: false; error: { message: string } }
    | null;

  if (!res.ok || !body || body.success === false) {
    throw new Error(
      body && body.success === false
        ? body.error.message
        : `Upload gagal (${res.status})`,
    );
  }
  return body.data;
}

/** Hapus file di storage berdasarkan URL publik. */
export async function deleteUpload(token: string, url: string): Promise<void> {
  const res = await fetch(`${API_URL}/uploads?url=${encodeURIComponent(url)}`, {
    method: "DELETE",
    headers: { authorization: `Bearer ${token}` },
  });
  const body = (await res.json().catch(() => null)) as
    | { success: true }
    | { success: false; error: { message: string } }
    | null;
  if (!res.ok || !body || body.success === false) {
    throw new Error(
      body && body.success === false
        ? body.error.message
        : `Hapus gagal (${res.status})`,
    );
  }
}
