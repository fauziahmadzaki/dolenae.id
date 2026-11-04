import { DEFAULT_SETTINGS, type ChecklistItemRow, type TripRow, type NotificationRow, type UserSettingsPayload } from "../db/personal-schema";
import type { CreateTripItemInput, PatchTripItemInput, CreateChecklistItemInput, PatchChecklistItemInput } from "../controllers/personal.schema";
import { personalRepository as repo, type PersonalDb, type TripInput, type TripPatch } from "../repositories/personal.repository";
import { destinationService } from "./destination.service";
import { buildMeta, toPagination, type PaginationQuery } from "../utils/pagination";
import { BadRequestError, ConflictError, NotFoundError } from "../utils/errors";

type JoinedItem = Awaited<ReturnType<typeof repo.listTripItems>>[number];
function toItem({ item, destination }: JoinedItem) {
  return {
    id: item.id, tripId: item.tripId, destinationId: item.destinationId,
    destinationName: destination.name,
    destinationMeta: [destination.regency, destination.province].filter(Boolean).join(", "),
    difficulty: destination.difficulty, date: item.date, order: item.order,
    notes: item.notes, supportIds: item.supportIds, entryFee: destination.entryFee,
  };
}
function toTrip(row: TripRow, items: JoinedItem[]) {
  const { userId: _userId, ...trip } = row;
  return { ...trip, items: items.filter(({ item }) => item.tripId === row.id).map(toItem) };
}
async function requireTrip(userId: string, id: string, tx: PersonalDb) {
  const row = await repo.lockTrip(userId, id, tx);
  if (!row) throw new NotFoundError("Rencana tidak ditemukan");
  return row;
}

async function validateItem(trip: TripRow, input: CreateTripItemInput, tx: PersonalDb) {
  if (input.date < trip.startDate || input.date > trip.endDate) throw new BadRequestError("Tanggal item di luar rentang rencana");
  const destination = await repo.findPublishedDestination(input.destinationId, tx);
  if (!destination) throw new NotFoundError("Destinasi tidak ditemukan");
  const supportIds = [...new Set(input.supportIds ?? [])];
  const supports = await repo.findRelatedSupports(input.destinationId, supportIds, tx);
  if (supports.length !== supportIds.length) throw new BadRequestError("Fasilitas tidak terkait destinasi atau tidak ditemukan");
  return { destination, supportIds };
}

function toChecklistItem({ userId: _userId, ...row }: ChecklistItemRow) { return row; }
async function requireDestination(id: string, tx?: PersonalDb) {
  const row = await repo.findPublishedDestination(id, tx);
  if (!row) throw new NotFoundError("Destinasi tidak ditemukan");
  return row;
}

function toSavedPlan(trip: ReturnType<typeof toTrip>) {
  return {
    id: trip.id, name: trip.name, startDate: trip.startDate, endDate: trip.endDate,
    // Unique destinations versus itinerary visits; no invented completion state.
    destinationCount: new Set(trip.items.map((item) => item.destinationId)).size,
    destinationTotal: trip.items.length, status: trip.status, savedAt: trip.createdAt,
  };
}

function toNotification({ userId: _userId, ...row }: NotificationRow) { return row; }
function toSettings(row: UserSettingsPayload): UserSettingsPayload {
  return { theme: row.theme, language: row.language, dataSaver: row.dataSaver,
    notifications: { rekomendasi: row.notifications.rekomendasi, pengingatRencana: row.notifications.pengingatRencana, pengingatChecklist: row.notifications.pengingatChecklist, fasilitasBaru: row.notifications.fasilitasBaru, promo: row.notifications.promo },
    privacy: { profilPublik: row.privacy.profilPublik, bagikanAktivitas: row.privacy.bagikanAktivitas, analitik: row.privacy.analitik } };
}

function toFaq(row: import("../db/personal-schema").FaqRow) { return { id: row.id, category: row.category, question: row.question, answer: row.answer }; }

export const personalService = {
  async listFaqs() { return (await repo.listFaqs()).map(toFaq); },
  async listAdminFaqs(query: PaginationQuery) {
    const { items, total } = await repo.listAdminFaqs(toPagination(query));
    return { items: items.map(toFaq), meta: buildMeta(total, query.page, query.limit) };
  },
  async getFaq(id: string) {
    const row = await repo.findFaq(id);
    if (!row) throw new NotFoundError("FAQ tidak ditemukan");
    return toFaq(row);
  },
  async createFaq(input: import("../controllers/personal.schema").CreateFaqInput) { return toFaq(await repo.insertFaq(input)); },
  async updateFaq(id: string, input: import("../controllers/personal.schema").PatchFaqInput) {
    const row = await repo.updateFaq(id, input);
    if (!row) throw new NotFoundError("FAQ tidak ditemukan");
    return toFaq(row);
  },
  async deleteFaq(id: string) {
    if (!await repo.deleteFaq(id)) throw new NotFoundError("FAQ tidak ditemukan");
    return null;
  },
  async createFeedback(userId: string, input: import("../controllers/personal.schema").CreateFeedbackInput) { return repo.insertFeedback(userId, input); },
  async listAdminFeedback(query: PaginationQuery) {
    const { items, total } = await repo.listAdminFeedback(toPagination(query));
    return { items, meta: buildMeta(total, query.page, query.limit) };
  },
  async listNotifications(userId: string) { return (await repo.listNotifications(userId)).map(toNotification); },
  async readNotification(userId: string, id: string) {
    const row = await repo.markNotificationRead(userId, id);
    if (!row) throw new NotFoundError("Notifikasi tidak ditemukan");
    return toNotification(row);
  },
  async readAllNotifications(userId: string) { await repo.markAllNotificationsRead(userId); return null; },
  async getSettings(userId: string) {
    return repo.transaction(async (tx) => {
      await repo.lockUser(userId, tx);
      const row = await repo.findSettings(userId, tx) ?? await repo.saveSettings(userId, DEFAULT_SETTINGS, tx);
      return toSettings(row);
    });
  },
  async updateSettings(userId: string, patch: import("../controllers/personal.schema").PatchSettingsInput) {
    return repo.transaction(async (tx) => {
      await repo.lockUser(userId, tx);
      const existing = await repo.findSettings(userId, tx) ?? DEFAULT_SETTINGS;
      const next: UserSettingsPayload = { ...toSettings(existing), ...patch,
        notifications: { ...existing.notifications, ...patch.notifications }, privacy: { ...existing.privacy, ...patch.privacy } };
      return toSettings(await repo.saveSettings(userId, next, tx));
    });
  },
  async listSavedDestinations(userId: string) {
    const rows = await repo.listSavedDestinations(userId);
    const result = [];
    for (const row of rows) {
      const destination = await destinationService.getById(row.destinationId);
      if (destination.status === "published") result.push({ id: row.id, destination, savedAt: row.savedAt });
    }
    return result;
  },
  async saveDestination(userId: string, destinationId: string) {
    return repo.transaction(async (tx) => {
      await repo.lockUser(userId, tx);
      await requireDestination(destinationId, tx);
      let row = await repo.findSavedDestination(userId, destinationId, tx);
      if (!row) {
        if (await repo.countSavedDestinations(userId, tx) >= 500) throw new ConflictError("Maksimal 500 destinasi tersimpan per akun");
        row = await repo.insertSavedDestination(userId, destinationId, tx);
      }
      return { id: row.id, destination: await destinationService.getById(destinationId), savedAt: row.savedAt };
    });
  },
  async deleteSavedDestination(userId: string, destinationId: string) {
    await repo.deleteSavedDestination(userId, destinationId);
    return null;
  },
  async listSavedPlans(userId: string) { return (await this.listTrips(userId)).map(toSavedPlan); },
  async updateSavedPlan(userId: string, id: string, status: "aktif" | "arsip") { return toSavedPlan(await this.updateTrip(userId, id, { status })); },
  async listChecklist(userId: string, destinationId: string) {
    await requireDestination(destinationId);
    return (await repo.listChecklistItems(userId, destinationId)).map(toChecklistItem);
  },
  async createChecklistItem(userId: string, destinationId: string, input: CreateChecklistItemInput) {
    return repo.transaction(async (tx) => {
      await repo.lockUser(userId, tx);
      await requireDestination(destinationId, tx);
      if (await repo.countChecklistItems(userId, tx) >= 500) throw new ConflictError("Maksimal 500 item checklist per akun");
      return toChecklistItem(await repo.insertChecklistItem(userId, destinationId, input, tx));
    });
  },
  async updateChecklistItem(userId: string, destinationId: string, id: string, input: PatchChecklistItemInput) {
    return repo.transaction(async (tx) => {
      await requireDestination(destinationId, tx);
      const row = await repo.updateChecklistItem(userId, destinationId, id, input, tx);
      if (!row) throw new NotFoundError("Item checklist tidak ditemukan");
      return toChecklistItem(row);
    });
  },
  async deleteChecklistItem(userId: string, destinationId: string, id: string) {
    return repo.transaction(async (tx) => {
      await requireDestination(destinationId, tx);
      if (!await repo.deleteChecklistItem(userId, destinationId, id, tx)) throw new NotFoundError("Item checklist tidak ditemukan");
      return null;
    });
  },
  async listSavedChecklists(userId: string) {
    const rows = await repo.listSavedChecklists(userId);
    const groups = new Map<string, { id: string; name: string; destinationName: string; completedCount: number; totalCount: number; finished: boolean; savedAt: Date }>();
    for (const { item, destinationName } of rows) {
      let group = groups.get(item.destinationId);
      if (!group) {
        group = { id: item.destinationId, name: `Checklist ${destinationName}`, destinationName, completedCount: 0, totalCount: 0, finished: false, savedAt: item.createdAt };
        groups.set(item.destinationId, group);
      }
      group.totalCount++;
      if (item.isCompleted) group.completedCount++;
      group.finished = group.completedCount === group.totalCount;
    }
    return [...groups.values()];
  },
  async deleteSavedChecklist(userId: string, destinationId: string) {
    await repo.deleteSavedChecklist(userId, destinationId);
    return null;
  },
  async listTrips(userId: string) {
    const rows = await repo.listTrips(userId);
    const items = await repo.listTripItems(userId, rows.map((row) => row.id));
    return rows.map((row) => toTrip(row, items));
  },
  async getTrip(userId: string, id: string) {
    const row = await repo.findTrip(userId, id);
    if (!row) throw new NotFoundError("Rencana tidak ditemukan");
    return toTrip(row, await repo.listTripItems(userId, [id]));
  },
  async createTrip(userId: string, input: TripInput) {
    return repo.transaction(async (tx) => {
      await repo.lockUser(userId, tx);
      if (await repo.countTrips(userId, tx) >= 500) throw new ConflictError("Maksimal 500 rencana per akun");
      const row = await repo.insertTrip(userId, input, tx);
      await repo.insertNotification(userId, { kind: "rencana", title: "Rencana perjalanan dibuat", body: `Rencana ${row.name} berhasil disimpan.`, href: `/trips/${row.id}` }, tx);
      return toTrip(row, []);
    });
  },
  async updateTrip(userId: string, id: string, patch: TripPatch) {
    return repo.transaction(async (tx) => {
      const row = await requireTrip(userId, id, tx);
      const start = patch.startDate ?? row.startDate;
      const end = patch.endDate ?? row.endDate;
      if (end < start) throw new BadRequestError("Tanggal akhir sebelum tanggal mulai");
      const items = await repo.listTripItems(userId, [id], tx);
      if (items.some(({ item }) => item.date < start || item.date > end)) throw new BadRequestError("Tanggal item di luar rentang rencana");
      const updated = await repo.updateTrip(userId, id, patch, tx);
      if (!updated) throw new NotFoundError("Rencana tidak ditemukan");
      return toTrip(updated, items);
    });
  },
  async createTripItem(userId: string, id: string, input: CreateTripItemInput) {
    return repo.transaction(async (tx) => {
      const trip = await requireTrip(userId, id, tx);
      const items = await repo.listTripItems(userId, [id], tx);
      if (items.length >= 100) throw new ConflictError("Maksimal 100 item per rencana");
      const { destination, supportIds } = await validateItem(trip, input, tx);
      const order = items.reduce((value, { item }) => Math.max(value, item.order + 1), 0);
      const item = await repo.insertTripItem(userId, id, { ...input, supportIds, order }, tx);
      await repo.updateTrip(userId, id, {}, tx);
      return toItem({ item, destination });
    });
  },
  async updateTripItem(userId: string, id: string, itemId: string, patch: PatchTripItemInput) {
    return repo.transaction(async (tx) => {
      const trip = await requireTrip(userId, id, tx);
      const existing = await repo.findTripItem(userId, id, itemId, tx);
      if (!existing) throw new NotFoundError("Item rencana tidak ditemukan");
      const next = { ...existing, ...patch, notes: patch.notes ?? existing.notes ?? undefined };
      const { destination, supportIds } = await validateItem(trip, next, tx);
      const item = await repo.updateTripItem(userId, id, itemId, { ...patch, supportIds }, tx);
      if (!item) throw new NotFoundError("Item rencana tidak ditemukan");
      await repo.updateTrip(userId, id, {}, tx);
      return toItem({ item, destination });
    });
  },
  async deleteTripItem(userId: string, id: string, itemId: string) {
    return repo.transaction(async (tx) => {
      await requireTrip(userId, id, tx);
      if (!await repo.deleteTripItem(userId, id, itemId, tx)) throw new NotFoundError("Item rencana tidak ditemukan");
      await repo.updateTrip(userId, id, {}, tx);
      return null;
    });
  },
  async deleteTrip(userId: string, id: string) {
    if (!await repo.deleteTrip(userId, id)) throw new NotFoundError("Rencana tidak ditemukan");
    return null;
  },
};
