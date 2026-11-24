import { cache } from "react";

import { get } from "~/lib/api/server";
import type { DestinationDetail } from "~/types/domain";

/**
 * Detail destinasi publik untuk server component.
 *
 * Dibungkus `cache` agar `generateMetadata` dan halaman tidak memanggil API
 * dua kali dalam satu request.
 */
export const getDestinationBySlug = cache((slug: string) =>
  get<DestinationDetail>(`/destinations/slug/${encodeURIComponent(slug)}`),
);
