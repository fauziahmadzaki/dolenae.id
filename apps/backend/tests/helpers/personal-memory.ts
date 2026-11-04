import { randomUUID } from "node:crypto";

// Repository-only test double: HTTP validation and business services stay real.
export const ownerId = "11111111-1111-4111-a111-111111111111";
export const otherId = "22222222-2222-4222-a222-222222222222";
export const destinationId = "33333333-3333-4333-a333-333333333333";
export const draftId = "44444444-4444-4444-a444-444444444444";
export const supportId = "55555555-5555-4555-a555-555555555555";
export let state: Record<string, any[]>;
export function resetMemory() {
  state = { trips: [], items: [], notifications: [], checklists: [], saved: [], settings: [], faqs: [], feedback: [] };
}
const owned = (rows: any[], userId: string, id: string) => rows.find((row) => row.userId === userId && row.id === id);
const now = () => new Date("2026-11-01T00:00:00.000Z");
export const memory = {
  async transaction(work: (tx: any) => Promise<any>) {
    const before = structuredClone(state);
    try { return await work({}); } catch (error) { state = before; throw error; }
  },
  async lockUser(userId: string) { return { id: userId }; },
  async listTrips(userId: string) { return state.trips.filter((row) => row.userId === userId).slice(0, 500); },
  async countTrips(userId: string) { return state.trips.filter((row) => row.userId === userId).length; },
  async findTrip(userId: string, id: string) { return owned(state.trips, userId, id); },
  async lockTrip(userId: string, id: string) { return owned(state.trips, userId, id); },
  async insertTrip(userId: string, input: any) {
    const row = { ...input, id: randomUUID(), userId, status: "aktif", budget: input.budget ?? null, notes: input.notes ?? null, createdAt: now(), updatedAt: now() };
    state.trips.push(row); return row;
  },
  async updateTrip(userId: string, id: string, input: any) {
    const row = owned(state.trips, userId, id);
    if (row) Object.assign(row, input, { updatedAt: now() });
    return row;
  },
  async deleteTrip(userId: string, id: string) {
    const row = owned(state.trips, userId, id);
    state.trips = state.trips.filter((row) => row.userId !== userId || row.id !== id);
    state.items = state.items.filter((row) => row.userId !== userId || row.tripId !== id);
    return Boolean(row);
  },
  async listTripItems(userId: string, tripIds: string[]) {
    return state.items.filter((row) => row.userId === userId && tripIds.includes(row.tripId)).map((item) => ({ item, destination: { id: item.destinationId, name: "Gunung Uji", regency: "Bandung", province: "Jawa Barat", difficulty: "menengah", entryFee: 15000 } }));
  },
  async findPublishedDestination(id: string) {
    return id === destinationId ? { id, name: "Gunung Uji", regency: "Bandung", province: "Jawa Barat", difficulty: "menengah", entryFee: 15000 } : undefined;
  },
  async findRelatedSupports(id: string, ids: string[]) { return id === destinationId && ids.includes(supportId) ? [{ id: supportId, destinationId }] : []; },
  async findTripItem(userId: string, tripId: string, id: string) { return state.items.find((row) => row.userId === userId && row.tripId === tripId && row.id === id); },
  async insertTripItem(userId: string, tripId: string, input: any) {
    const row = { ...input, userId, tripId, id: randomUUID(), notes: input.notes ?? null, supportIds: input.supportIds ?? [] };
    state.items.push(row); return row;
  },
  async updateTripItem(userId: string, tripId: string, id: string, input: any) {
    const row = state.items.find((row) => row.userId === userId && row.tripId === tripId && row.id === id);
    if (row) Object.assign(row, input); return row;
  },
  async deleteTripItem(userId: string, tripId: string, id: string) {
    const row = state.items.find((row) => row.userId === userId && row.tripId === tripId && row.id === id);
    state.items = state.items.filter((row) => row !== undefined && !(row.userId === userId && row.tripId === tripId && row.id === id));
    return Boolean(row);
  },
  async listChecklistItems(userId: string, destinationId: string) { return state.checklists.filter((row) => row.userId === userId && row.destinationId === destinationId).slice(0, 500); },
  async countChecklistItems(userId: string) { return state.checklists.filter((row) => row.userId === userId).length; },
  async insertChecklistItem(userId: string, destinationId: string, input: any) {
    const row = { ...input, id: randomUUID(), userId, destinationId, isCompleted: false, note: input.note ?? null, createdAt: now() };
    state.checklists.push(row); return row;
  },
  async updateChecklistItem(userId: string, destinationId: string, id: string, input: any) {
    const row = state.checklists.find((row) => row.userId === userId && row.destinationId === destinationId && row.id === id);
    if (row) Object.assign(row, input); return row;
  },
  async deleteChecklistItem(userId: string, destinationId: string, id: string) {
    const row = state.checklists.find((row) => row.userId === userId && row.destinationId === destinationId && row.id === id);
    state.checklists = state.checklists.filter((item) => item !== row); return Boolean(row);
  },
  async listSavedChecklists(userId: string) { return state.checklists.filter((row) => row.userId === userId && row.destinationId === destinationId).slice(0, 500).map((item) => ({ item, destinationName: "Gunung Uji" })); },
  async deleteSavedChecklist(userId: string, id: string) { state.checklists = state.checklists.filter((row) => row.userId !== userId || row.destinationId !== id); },
  async listSavedDestinations(userId: string) { return state.saved.filter((row) => row.userId === userId && row.destinationId === destinationId).slice(0, 500); },
  async findSavedDestination(userId: string, id: string) { return state.saved.find((row) => row.userId === userId && row.destinationId === id); },
  async countSavedDestinations(userId: string) { return state.saved.filter((row) => row.userId === userId).length; },
  async insertSavedDestination(userId: string, id: string) {
    let row = state.saved.find((row) => row.userId === userId && row.destinationId === id);
    if (!row) { row = { id: randomUUID(), userId, destinationId: id, savedAt: now() }; state.saved.push(row); }
    return row;
  },
  async deleteSavedDestination(userId: string, id: string) { state.saved = state.saved.filter((row) => row.userId !== userId || row.destinationId !== id); },
  async listNotifications(userId: string) { return state.notifications.filter((row) => row.userId === userId).slice(0, 500); },
  async markNotificationRead(userId: string, id: string) { const row = owned(state.notifications, userId, id); if (row) row.read = true; return row; },
  async markAllNotificationsRead(userId: string) { state.notifications.filter((row) => row.userId === userId).forEach((row) => row.read = true); },
  async findSettings(userId: string) { return state.settings.find((row) => row.userId === userId); },
  async saveSettings(userId: string, input: any) {
    let row = state.settings.find((row) => row.userId === userId);
    if (row) Object.assign(row, input); else { row = { ...input, userId, updatedAt: now() }; state.settings.push(row); }
    return row;
  },
  async listFaqs() { return state.faqs.slice(0, 500); },
  async listAdminFaqs(query: any) {
    const rows = state.faqs.filter((row) => !query.search || row.question.toLowerCase().includes(query.search.toLowerCase()));
    return { items: rows.slice(query.offset, query.offset + query.limit), total: rows.length };
  },
  async findFaq(id: string) { return state.faqs.find((row) => row.id === id); },
  async insertFaq(input: any) { const row = { ...input, id: randomUUID(), createdAt: now(), updatedAt: now() }; state.faqs.push(row); return row; },
  async updateFaq(id: string, input: any) { const row = state.faqs.find((row) => row.id === id); if (row) Object.assign(row, input); return row; },
  async deleteFaq(id: string) { const row = state.faqs.find((row) => row.id === id); state.faqs = state.faqs.filter((item) => item !== row); return Boolean(row); },
  async insertFeedback(userId: string, input: any) {
    const row = { ...input, userId, id: randomUUID(), rating: input.rating ?? null, createdAt: now() }; state.feedback.push(row); return row;
  },
  async listAdminFeedback(query: any) {
    const rows = state.feedback.filter((row) => !query.search || row.subject.toLowerCase().includes(query.search.toLowerCase()));
    return { items: rows.slice(query.offset, query.offset + query.limit), total: rows.length };
  },
  async insertNotification(userId: string, input: any) {
    const row = { ...input, id: randomUUID(), userId, read: false, href: input.href ?? null, createdAt: now() };
    state.notifications.push(row); return row;
  },
};
resetMemory();
