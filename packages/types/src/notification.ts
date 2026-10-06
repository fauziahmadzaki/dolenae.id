import type { ID, ISODateString } from "./common";

/** Kelompok notifikasi sesuai tab "HARI INI" / "SEBELUMNYA" di layar notifikasi. */
export type NotificationKind =
  | "rekomendasi"
  | "rencana"
  | "checklist"
  | "usulan"
  | "sistem";

export interface AppNotification {
  id: ID;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: ISODateString;
  read: boolean;
  /** Tujuan saat notifikasi diklik, mis. "/plan". */
  href?: string;
}
