import { beforeEach, describe, expect, it, vi } from "vitest";
import { drizzle } from "drizzle-orm/node-postgres";
import { getTableConfig } from "drizzle-orm/pg-core";
import { getDb } from "../../src/db/client";
import { personalRepository as repo } from "../../src/repositories/personal.repository";
import { checklistItems, feedback, notifications, savedDestinations, trips, tripItems, userSettings } from "../../src/db/personal-schema";

vi.mock("../../src/db/client", () => ({ getDb: vi.fn() }));
const owner = "11111111-1111-4111-a111-111111111111";
const id = "22222222-2222-4222-a222-222222222222";
const parent = "33333333-3333-4333-a333-333333333333";
const query = vi.fn(async () => ({ rows: [] }));
let db: ReturnType<typeof getDb>;
beforeEach(() => {
  query.mockClear();
  db = drizzle({ query } as any) as ReturnType<typeof getDb>;
  vi.mocked(getDb).mockReturnValue(db);
});
const statements = () => query.mock.calls.map(([config, values]: any) => ({ text: typeof config === "string" ? config : config.text, values: values ?? [] }));

describe("personal repository SQL boundaries", () => {
  const calls = [
    ["listTrips", () => repo.listTrips(owner), "trips"],
    ["countTrips", () => repo.countTrips(owner, db), "trips"],
    ["findTrip", () => repo.findTrip(owner, id), "trips"],
    ["lockTrip", () => repo.lockTrip(owner, id, db), "trips"],
    ["updateTrip", () => repo.updateTrip(owner, id, { status: "arsip" }, db), "trips"],
    ["deleteTrip", () => repo.deleteTrip(owner, id), "trips"],
    ["listTripItems", () => repo.listTripItems(owner, [parent]), "trip_items"],
    ["findTripItem", () => repo.findTripItem(owner, parent, id, db), "trip_items"],
    ["updateTripItem", () => repo.updateTripItem(owner, parent, id, { notes: "test" }, db), "trip_items"],
    ["deleteTripItem", () => repo.deleteTripItem(owner, parent, id, db), "trip_items"],
    ["listChecklistItems", () => repo.listChecklistItems(owner, parent), "checklist_items"],
    ["countChecklistItems", () => repo.countChecklistItems(owner, db), "checklist_items"],
    ["updateChecklistItem", () => repo.updateChecklistItem(owner, parent, id, { isCompleted: true }, db), "checklist_items"],
    ["deleteChecklistItem", () => repo.deleteChecklistItem(owner, parent, id, db), "checklist_items"],
    ["listSavedChecklists", () => repo.listSavedChecklists(owner), "checklist_items"],
    ["deleteSavedChecklist", () => repo.deleteSavedChecklist(owner, parent), "checklist_items"],
    ["listSavedDestinations", () => repo.listSavedDestinations(owner), "saved_destinations"],
    ["findSavedDestination", () => repo.findSavedDestination(owner, parent, db), "saved_destinations"],
    ["countSavedDestinations", () => repo.countSavedDestinations(owner, db), "saved_destinations"],
    ["deleteSavedDestination", () => repo.deleteSavedDestination(owner, parent), "saved_destinations"],
    ["listNotifications", () => repo.listNotifications(owner), "notifications"],
    ["markNotificationRead", () => repo.markNotificationRead(owner, id), "notifications"],
    ["markAllNotificationsRead", () => repo.markAllNotificationsRead(owner), "notifications"],
    ["findSettings", () => repo.findSettings(owner, db), "user_settings"],
  ] as const;
  it.each(calls)("%s includes owner in SQL WHERE", async (_name, run, table) => {
    await run();
    const entries = statements();
    expect(entries.length).toBeGreaterThan(0);
    for (const entry of entries) {
      expect(entry.text).toMatch(new RegExp(`where .*"${table}"\\."user_id" = \\$\\d+`));
      expect(entry.values).toContain(owner);
    }
  });
  it("scopes child mutations to owner + parent + child together", async () => {
    await repo.updateTripItem(owner, parent, id, { notes: "changed" }, db);
    await repo.deleteChecklistItem(owner, parent, id, db);
    for (const entry of statements()) {
      expect(entry.values).toEqual(expect.arrayContaining([owner, parent, id]));
      expect(entry.text.split("where")[1]).toMatch(/"(?:trip_id|destination_id)" = \$\d+/);
      expect(entry.text.split("where")[1]).toMatch(/"id" = \$\d+/);
    }
  });
  it("uses owner/trip update locks and published/support share locks", async () => {
    await repo.lockUser(owner, db);
    await repo.lockTrip(owner, id, db);
    await repo.findPublishedDestination(parent, db);
    await repo.findRelatedSupports(parent, [id], db);
    const [user, trip, destination, support] = statements();
    expect(user.text).toContain("for update");
    expect(user.values).toContain(owner);
    expect(trip.text).toContain("for update");
    expect(destination.text).toContain("for share");
    expect(destination.values).toEqual([parent, "published"]);
    expect(support.text).toContain("for share");
    expect(support.values).toEqual([parent, id]);
  });
  it("uses published joins for saved reads and caps returned personal arrays", async () => {
    await repo.listSavedDestinations(owner);
    await repo.listSavedChecklists(owner);
    await repo.listNotifications(owner);
    const [saved, checklists, notices] = statements();
    for (const entry of [saved, checklists]) {
      expect(entry.text).toContain('"destinations"."status" =');
      expect(entry.values).toContain("published");
      expect(entry.text).toContain("limit");
      expect(entry.values).toContain(500);
    }
    expect(notices.values).toContain(500);
  });
  it("uses conflict-safe save/settings writes and derives personal insert owners", async () => {
    await repo.insertSavedDestination(owner, parent, db);
    await repo.insertTrip(owner, { name: "Trip", startDate: "2026-12-01", endDate: "2026-12-02", peopleCount: 1 }, db);
    await repo.insertChecklistItem(owner, parent, { name: "Air", category: "perlengkapan", isRequired: true }, db);
    await repo.insertNotification(owner, { kind: "rencana", title: "Trip", body: "Saved", href: null }, db);
    await repo.insertFeedback(owner, { category: "saran", subject: "Filter", message: "Tambahkan filter" });
    const entries = statements();
    expect(entries[0].text).toContain('on conflict ("user_id","destination_id") do nothing');
    for (const entry of entries.filter((entry) => entry.text.startsWith("insert"))) expect(entry.values).toContain(owner);
  });
  it("admin searches are parameterized; invalid sort cannot enter SQL", async () => {
    const input = { page: 2, limit: 10, offset: 10, order: "desc" as const, sort: "id; drop table users", search: "x' OR true--" };
    await repo.listAdminFaqs(input);
    await repo.listAdminFeedback(input);
    const entries = statements();
    expect(entries).toHaveLength(4);
    for (const entry of entries) {
      expect(entry.text).not.toContain(input.search);
      expect(entry.text).not.toContain(input.sort);
      expect(entry.values).toContain(`%${input.search}%`);
    }
  });
});

describe("personal schema constraints", () => {
  it("cascades user ownership and enforces compound trip-item ownership", () => {
    for (const table of [trips, checklistItems, savedDestinations, notifications, feedback, userSettings]) {
      expect(getTableConfig(table).foreignKeys.some((fk) => fk.onDelete === "cascade" && fk.reference().columns.some((column) => column.name === "user_id"))).toBe(true);
    }
    const ownerFk = getTableConfig(tripItems).foreignKeys.find((fk) => fk.reference().columns.length === 2)!;
    expect(ownerFk.reference().columns.map((column) => column.name)).toEqual(["trip_id", "user_id"]);
    expect(ownerFk.onDelete).toBe("cascade");
    expect(getTableConfig(savedDestinations).uniqueConstraints[0].columns.map((column) => column.name)).toEqual(["user_id", "destination_id"]);
    expect(getTableConfig(trips).checks).toHaveLength(3);
    expect(notifications.read.default).toBe(false);
    expect(checklistItems.isCompleted.default).toBe(false);
  });
});
