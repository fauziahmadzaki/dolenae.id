import type { ID, ISODateString } from "./common";

export type ThemePreference = "terang" | "sistem" | "gelap";

export type LanguagePreference = "id" | "en";

/** Grup "AKTIVITAS" (aktif) dan "PROMO" (nonaktif) di layar setelan notifikasi. */
export interface NotificationPreferences {
  rekomendasi: boolean;
  pengingatRencana: boolean;
  pengingatChecklist: boolean;
  fasilitasBaru: boolean;
  promo: boolean;
}

/** Grup "KEAMANAN AKUN" dan "PRIVASI" di layar privasi & keamanan. */
export interface PrivacySettings {
  twoFactor: boolean;
  profilPublik: boolean;
  bagikanAktivitas: boolean;
  analitik: boolean;
}

export interface ActiveDevice {
  id: ID;
  label: string;
  lastActiveAt: ISODateString;
  current: boolean;
}

export interface AppSettings {
  theme: ThemePreference;
  language: LanguagePreference;
  /** "Mode hemat data" di grup APLIKASI. */
  dataSaver: boolean;
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
  activeDevices: ActiveDevice[];
}
