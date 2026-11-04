import { and, asc, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { getDb } from "../db/client";
import type { Pagination } from "../utils/pagination";
import { faqs, feedback, checklistItems, savedDestinations, notifications, tripItems, trips, userSettings, type TripRow, type UserSettingsPayload } from "../db/personal-schema";
import { destinations, travelSupports, users } from "../db/schema";

export type PersonalDb = Pick<ReturnType<typeof getDb>, "select" | "insert" | "update" | "delete">;
export type TripInput = Pick<TripRow, "name" | "startDate" | "endDate" | "peopleCount"> & Partial<Pick<TripRow, "budget" | "notes">>;
export type TripPatch = Partial<TripInput & Pick<TripRow, "status">>;

export const personalRepository = {
  async transaction<T>(work: (tx: PersonalDb) => Promise<T>): Promise<T> {
    return getDb().transaction(work);
  },
  async lockUser(userId: string, db: PersonalDb) {
    const [row] = await db.select({ id: users.id }).from(users).where(eq(users.id, userId)).for("update");
    return row;
  },
  // ponytail: personal arrays cap at 500; add cursor pagination before raising this ceiling.
  async listTrips(userId: string, db: PersonalDb = getDb()) {
    return db.select().from(trips).where(eq(trips.userId, userId)).orderBy(desc(trips.createdAt), asc(trips.id)).limit(500);
  },
  async countTrips(userId: string, db: PersonalDb) {
    const [row] = await db.select({ value: count() }).from(trips).where(eq(trips.userId, userId));
    return Number(row?.value ?? 0);
  },
  async findTrip(userId: string, id: string, db: PersonalDb = getDb()) {
    const [row] = await db.select().from(trips).where(and(eq(trips.userId, userId), eq(trips.id, id))).limit(1);
    return row;
  },
  async lockTrip(userId: string, id: string, db: PersonalDb) {
    const [row] = await db.select().from(trips).where(and(eq(trips.userId, userId), eq(trips.id, id))).for("update");
    return row;
  },
  async insertTrip(userId: string, input: TripInput, db: PersonalDb) {
    const [row] = await db.insert(trips).values({ ...input, userId, status: "aktif" }).returning();
    return row!;
  },
  async updateTrip(userId: string, id: string, input: TripPatch, db: PersonalDb) {
    const [row] = await db.update(trips).set({ ...input, updatedAt: new Date() }).where(and(eq(trips.userId, userId), eq(trips.id, id))).returning();
    return row;
  },
  async deleteTrip(userId: string, id: string, db: PersonalDb = getDb()) {
    const rows = await db.delete(trips).where(and(eq(trips.userId, userId), eq(trips.id, id))).returning({ id: trips.id });
    return rows.length > 0;
  },
  async listTripItems(userId: string, tripIds: string[], db: PersonalDb = getDb()) {
    if (!tripIds.length) return [];
    return db.select({ item: tripItems, destination: destinations }).from(tripItems)
      .innerJoin(destinations, eq(destinations.id, tripItems.destinationId))
      .where(and(eq(tripItems.userId, userId), inArray(tripItems.tripId, tripIds)))
      .orderBy(asc(tripItems.date), asc(tripItems.order), asc(tripItems.id));
  },
  async findPublishedDestination(id: string, db: PersonalDb = getDb()) {
    const [row] = await db.select().from(destinations).where(and(eq(destinations.id, id), eq(destinations.status, "published"))).for("share");
    return row;
  },
  async findRelatedSupports(destinationId: string, ids: string[], db: PersonalDb) {
    if (!ids.length) return [];
    return db.select({ id: travelSupports.id }).from(travelSupports)
      .where(and(eq(travelSupports.destinationId, destinationId), inArray(travelSupports.id, ids))).for("share");
  },
  async findTripItem(userId: string, tripId: string, id: string, db: PersonalDb) {
    const [row] = await db.select().from(tripItems).where(and(eq(tripItems.userId, userId), eq(tripItems.tripId, tripId), eq(tripItems.id, id))).limit(1);
    return row;
  },
  async insertTripItem(userId: string, tripId: string, input: Omit<typeof tripItems.$inferInsert, "id" | "userId" | "tripId">, db: PersonalDb) {
    const [row] = await db.insert(tripItems).values({ ...input, userId, tripId }).returning();
    return row!;
  },
  async updateTripItem(userId: string, tripId: string, id: string, input: Partial<Pick<typeof tripItems.$inferInsert, "destinationId" | "date" | "notes" | "supportIds">>, db: PersonalDb) {
    const [row] = await db.update(tripItems).set(input).where(and(eq(tripItems.userId, userId), eq(tripItems.tripId, tripId), eq(tripItems.id, id))).returning();
    return row;
  },
  async deleteTripItem(userId: string, tripId: string, id: string, db: PersonalDb) {
    const rows = await db.delete(tripItems).where(and(eq(tripItems.userId, userId), eq(tripItems.tripId, tripId), eq(tripItems.id, id))).returning({ id: tripItems.id });
    return rows.length > 0;
  },
  async listChecklistItems(userId: string, destinationId: string, db: PersonalDb = getDb()) {
    return db.select().from(checklistItems).where(and(eq(checklistItems.userId, userId), eq(checklistItems.destinationId, destinationId)))
      .orderBy(asc(checklistItems.createdAt), asc(checklistItems.id)).limit(500);
  },
  async countChecklistItems(userId: string, db: PersonalDb) {
    const [row] = await db.select({ value: count() }).from(checklistItems).where(eq(checklistItems.userId, userId));
    return Number(row?.value ?? 0);
  },
  async insertChecklistItem(userId: string, destinationId: string, input: Pick<typeof checklistItems.$inferInsert, "name" | "category" | "isRequired" | "note">, db: PersonalDb) {
    const [row] = await db.insert(checklistItems).values({ ...input, userId, destinationId, isCompleted: false }).returning();
    return row!;
  },
  async updateChecklistItem(userId: string, destinationId: string, id: string, input: Partial<Pick<typeof checklistItems.$inferInsert, "name" | "note" | "isCompleted">>, db: PersonalDb) {
    const [row] = await db.update(checklistItems).set(input).where(and(eq(checklistItems.userId, userId), eq(checklistItems.destinationId, destinationId), eq(checklistItems.id, id))).returning();
    return row;
  },
  async deleteChecklistItem(userId: string, destinationId: string, id: string, db: PersonalDb) {
    const rows = await db.delete(checklistItems).where(and(eq(checklistItems.userId, userId), eq(checklistItems.destinationId, destinationId), eq(checklistItems.id, id))).returning({ id: checklistItems.id });
    return rows.length > 0;
  },
  async listSavedChecklists(userId: string) {
    return getDb().select({ item: checklistItems, destinationName: destinations.name }).from(checklistItems)
      .innerJoin(destinations, eq(destinations.id, checklistItems.destinationId))
      .where(and(eq(checklistItems.userId, userId), eq(destinations.status, "published")))
      .orderBy(asc(checklistItems.createdAt), asc(checklistItems.id)).limit(500);
  },
  async deleteSavedChecklist(userId: string, destinationId: string) {
    await getDb().delete(checklistItems).where(and(eq(checklistItems.userId, userId), eq(checklistItems.destinationId, destinationId)));
  },
  async listSavedDestinations(userId: string) {
    return getDb().select({ id: savedDestinations.id, userId: savedDestinations.userId, destinationId: savedDestinations.destinationId, savedAt: savedDestinations.savedAt })
      .from(savedDestinations).innerJoin(destinations, eq(destinations.id, savedDestinations.destinationId))
      .where(and(eq(savedDestinations.userId, userId), eq(destinations.status, "published")))
      .orderBy(desc(savedDestinations.savedAt), asc(savedDestinations.id)).limit(500);
  },
  async findSavedDestination(userId: string, destinationId: string, db: PersonalDb) {
    const [row] = await db.select().from(savedDestinations).where(and(eq(savedDestinations.userId, userId), eq(savedDestinations.destinationId, destinationId))).limit(1);
    return row;
  },
  async countSavedDestinations(userId: string, db: PersonalDb) {
    const [row] = await db.select({ value: count() }).from(savedDestinations).where(eq(savedDestinations.userId, userId));
    return Number(row?.value ?? 0);
  },
  async insertSavedDestination(userId: string, destinationId: string, db: PersonalDb) {
    await db.insert(savedDestinations).values({ userId, destinationId }).onConflictDoNothing({ target: [savedDestinations.userId, savedDestinations.destinationId] });
    return (await this.findSavedDestination(userId, destinationId, db))!;
  },
  async deleteSavedDestination(userId: string, destinationId: string) {
    await getDb().delete(savedDestinations).where(and(eq(savedDestinations.userId, userId), eq(savedDestinations.destinationId, destinationId)));
  },
  async listNotifications(userId: string) {
    return getDb().select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt), asc(notifications.id)).limit(500);
  },
  async markNotificationRead(userId: string, id: string) {
    const [row] = await getDb().update(notifications).set({ read: true }).where(and(eq(notifications.userId, userId), eq(notifications.id, id))).returning();
    return row;
  },
  async markAllNotificationsRead(userId: string) {
    await getDb().update(notifications).set({ read: true }).where(eq(notifications.userId, userId));
  },
  async findSettings(userId: string, db: PersonalDb) {
    const [row] = await db.select().from(userSettings).where(eq(userSettings.userId, userId)).limit(1);
    return row;
  },
  async saveSettings(userId: string, input: UserSettingsPayload, db: PersonalDb) {
    const values = { ...input, updatedAt: new Date() };
    const [row] = await db.insert(userSettings).values({ ...values, userId }).onConflictDoUpdate({ target: userSettings.userId, set: values }).returning();
    return row!;
  },
  async listFaqs() {
    return getDb().select().from(faqs).orderBy(asc(faqs.category), asc(faqs.question), asc(faqs.id)).limit(500);
  },
  async findFaq(id: string) {
    const [row] = await getDb().select().from(faqs).where(eq(faqs.id, id)).limit(1);
    return row;
  },
  async listAdminFaqs(query: Pagination) {
    const db = getDb();
    const where = query.search ? or(ilike(faqs.question, `%${query.search}%`), ilike(faqs.answer, `%${query.search}%`)) : undefined;
    const sortable = { id: faqs.id, category: faqs.category, question: faqs.question, createdAt: faqs.createdAt, updatedAt: faqs.updatedAt };
    const column = sortable[query.sort as keyof typeof sortable] ?? faqs.createdAt;
    const direction = query.order === "desc" ? desc : asc;
    const items = await db.select().from(faqs).where(where).orderBy(direction(column), direction(faqs.id)).limit(query.limit).offset(query.offset);
    const [total] = await db.select({ value: count() }).from(faqs).where(where);
    return { items, total: Number(total?.value ?? 0) };
  },
  async insertFaq(input: Pick<typeof faqs.$inferInsert, "category" | "question" | "answer">) {
    const [row] = await getDb().insert(faqs).values(input).returning();
    return row!;
  },
  async updateFaq(id: string, input: Partial<Pick<typeof faqs.$inferInsert, "category" | "question" | "answer">>) {
    const [row] = await getDb().update(faqs).set({ ...input, updatedAt: new Date() }).where(eq(faqs.id, id)).returning();
    return row;
  },
  async deleteFaq(id: string) {
    const rows = await getDb().delete(faqs).where(eq(faqs.id, id)).returning({ id: faqs.id });
    return rows.length > 0;
  },
  async insertFeedback(userId: string, input: Pick<typeof feedback.$inferInsert, "category" | "subject" | "message" | "rating">) {
    const [row] = await getDb().insert(feedback).values({ ...input, userId }).returning();
    return row!;
  },
  async listAdminFeedback(query: Pagination) {
    const db = getDb();
    const where = query.search ? or(ilike(feedback.subject, `%${query.search}%`), ilike(feedback.message, `%${query.search}%`)) : undefined;
    const sortable = { id: feedback.id, category: feedback.category, subject: feedback.subject, rating: feedback.rating, createdAt: feedback.createdAt };
    const column = sortable[query.sort as keyof typeof sortable] ?? feedback.createdAt;
    const direction = query.order === "desc" ? desc : asc;
    const items = await db.select().from(feedback).where(where).orderBy(direction(column), direction(feedback.id)).limit(query.limit).offset(query.offset);
    const [total] = await db.select({ value: count() }).from(feedback).where(where);
    return { items, total: Number(total?.value ?? 0) };
  },
  async insertNotification(userId: string, input: Pick<typeof notifications.$inferInsert, "kind" | "title" | "body" | "href">, db: PersonalDb = getDb()) {
    const [row] = await db.insert(notifications).values({ ...input, userId, read: false }).returning();
    return row!;
  },
};
