import type { AiChecklistCategory } from "./types";

class ChecklistUtil {
  /** Best-effort category for a checklist item name. */
  inferCategory(name: string): AiChecklistCategory {
    const value = name.trim().toLowerCase();
    if (
      value.includes("obat") ||
      value.includes("p3k") ||
      value.includes("kesehatan") ||
      value.includes("masker")
    ) {
      return "kesehatan";
    }
    if (
      value.includes("sampah") ||
      value.includes("lingkungan") ||
      value.includes("konservasi")
    ) {
      return "konservasi";
    }
    if (
      value.includes("tiket") ||
      value.includes("identitas") ||
      value.includes("pemandu") ||
      value.includes("izin") ||
      value.includes("administrasi")
    ) {
      return "administrasi";
    }
    if (
      value.includes("transport") ||
      value.includes("penginapan") ||
      value.includes("makan") ||
      value.includes("biaya") ||
      value.includes("masuk")
    ) {
      return "biaya";
    }
    return "perlengkapan";
  }
}

export const checklistUtil = new ChecklistUtil();

/** Best-effort category for a checklist item name. */
export function inferChecklistCategory(name: string): AiChecklistCategory {
  return checklistUtil.inferCategory(name);
}
