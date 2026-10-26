/** Allowed image mime types for destination uploads. */
export const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export const ALLOWED_IMAGE_TYPES = Object.keys(IMAGE_EXTENSIONS);

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** Cheap magic-byte check so a renamed .exe is not accepted as an image. */
export function matchesImageSignature(buffer: Buffer, mime: string): boolean {
  if (buffer.length < 12) return false;

  switch (mime) {
    case "image/jpeg":
      return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    case "image/png":
      return buffer.subarray(0, 8).equals(PNG_SIGNATURE);
    case "image/webp":
      return (
        buffer.toString("ascii", 0, 4) === "RIFF" &&
        buffer.toString("ascii", 8, 12) === "WEBP"
      );
    case "image/gif":
      return buffer.toString("ascii", 0, 3) === "GIF";
    case "image/avif":
      return buffer.toString("ascii", 4, 12).includes("ftypavif");
    default:
      return false;
  }
}

/**
 * Extract the object key from a public storage URL, or null when the URL points
 * somewhere else (we only delete files we serve).
 */
export function keyFromPublicUrl(url: string, publicBase: string): string | null {
  const base = publicBase.replace(/\/+$/, "");
  if (!url.startsWith(`${base}/`)) return null;

  const key = url.slice(base.length + 1);
  if (!key || key.includes("..") || key.startsWith("/")) return null;
  return key;
}
