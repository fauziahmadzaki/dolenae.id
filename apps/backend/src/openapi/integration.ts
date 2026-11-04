// Contracts for persisted personal data and explicitly simulated payments.
const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const str = { type: "string" };
const uuid = { type: "string", format: "uuid" };
const dateTime = { type: "string", format: "date-time" };
const date = { type: "string", format: "date" };
const bool = { type: "boolean" };
const money = { type: "integer", minimum: 0, maximum: 2147483647 };
const paymentAmount = { type: "integer", minimum: 0, maximum: 214748364700 };
const nullableText = { type: ["string", "null"] };
const array = (items: object) => ({ type: "array", items });
const object = (properties: Record<string, object>, required: string[] = [], closed = false) => ({
  type: "object", properties, ...(required.length ? { required } : {}), ...(closed ? { additionalProperties: false } : {}),
});
const supportCategory = { type: "string", enum: ["accommodation", "transport", "food"] };
const supportInput = object({
  destinationId: uuid, name: { ...str, minLength: 1, maxLength: 120 }, category: supportCategory,
  ...Object.fromEntries(["description", "locationLabel", "capacity", "distanceLabel", "priceLabel", "priceUnit", "contactPhone", "contactWhatsapp", "contactInstagram", "imageUrl"].map((key) => [key, nullableText])),
  priceMin: { ...money, type: ["integer", "null"] }, priceMax: { ...money, type: ["integer", "null"] },
  facilities: array(str), routes: array(str), cuisine: array(str), includesDriver: bool, verified: bool,
}, ["destinationId", "name", "category"], true);
const promoProperties = {
  code: { ...str, pattern: "^[A-Z0-9_-]{3,32}$" }, title: { ...str, maxLength: 160 },
  discountType: { type: "string", enum: ["percentage", "fixed"] }, value: { type: "integer", minimum: 1 },
  minAmount: money, maxDiscount: { ...money, type: ["integer", "null"] }, startsAt: dateTime, endsAt: dateTime, active: bool,
};
const proposalProperties = {
  name: { ...str, minLength: 1, maxLength: 120 }, type: supportCategory,
  destinationId: { ...uuid, type: ["string", "null"] }, nearestDestinationName: str, address: str, note: nullableText,
};
const itemProperties = { destinationId: uuid, date, notes: nullableText, supportIds: array(uuid) };
const tripProperties = {
  name: { ...str, minLength: 1, maxLength: 160 }, startDate: date, endDate: date,
  peopleCount: { type: "integer", minimum: 1, maximum: 100 }, budget: money, notes: nullableText,
};
const notifications = object(Object.fromEntries(["rekomendasi", "pengingatRencana", "pengingatChecklist", "fasilitasBaru", "promo"].map((key) => [key, bool])), [], true);
const privacy = object(Object.fromEntries(["profilPublik", "bagikanAktivitas", "analitik"].map((key) => [key, bool])), [], true);
const settingsProperties = {
  theme: { type: "string", enum: ["terang", "sistem", "gelap"] }, language: { type: "string", enum: ["id", "en"] },
  dataSaver: bool, notifications, privacy,
};
const faqProperties = { category: { type: "string", enum: ["akun", "perjalanan", "fasilitas", "data"] }, question: str, answer: str };

export const integrationSchemas = {
  CreateSupport: supportInput,
  UpdateSupport: object(supportInput.properties, [], true),
  Promo: object({ id: uuid, ...promoProperties }, ["id", "code", "title", "discountType", "value", "minAmount", "active"]),
  CreatePromo: object(promoProperties, ["code", "title", "discountType", "value", "startsAt", "endsAt"], true),
  UpdatePromo: object(promoProperties, [], true),
  CreateFacilityProposal: object(proposalProperties, ["name", "type", "nearestDestinationName", "address"], true),
  FacilityProposal: object({
    id: uuid, userId: uuid, ...proposalProperties, status: { type: "string", enum: ["menunggu", "terverifikasi", "ditolak"] },
    reviewNote: nullableText, reviewedBy: { ...uuid, type: ["string", "null"] }, reviewedAt: { ...dateTime, type: ["string", "null"] }, createdAt: dateTime, updatedAt: dateTime,
  }, ["id", "userId", "name", "type", "status", "createdAt"]),
  ReviewFacilityProposal: object({ status: { type: "string", enum: ["terverifikasi", "ditolak"] }, reviewNote: str }, ["status"], true),
  AdminMetrics: object(Object.fromEntries(["users", "destinations", "publishedDestinations", "supports", "pendingProposals", "pendingPayments", "paidPayments", "dummyRevenue"].map((key) => [key, { type: "number", minimum: 0 }]))),
  AuditActivity: object({ id: uuid, actorId: { ...uuid, type: ["string", "null"] }, action: str, targetType: str, targetId: { ...uuid, type: ["string", "null"] }, targetLabel: nullableText, createdAt: dateTime }),
  CreateDummyPayment: object({ supportId: uuid, quantity: { type: "integer", minimum: 1, maximum: 100 }, promoCode: { ...str, pattern: "^[A-Z0-9_-]{3,32}$" } }, ["supportId", "quantity"], true),
  DummyPayment: object({
    id: uuid, userId: uuid, supportId: uuid, supportName: str, quantity: { type: "integer", minimum: 1, maximum: 100 },
    subtotal: paymentAmount, discount: paymentAmount, total: paymentAmount, promoCode: nullableText,
    status: { type: "string", enum: ["pending", "paid", "cancelled"] }, method: { type: "string", const: "dummy_qr" }, isDummy: { type: "boolean", const: true },
    qrPayload: { ...str, description: "DUMMY text; not a QRIS payload, not payable." }, qrMatrix: array(array(bool)),
    createdAt: dateTime, updatedAt: dateTime, paidAt: { ...dateTime, type: ["string", "null"] },
  }, ["id", "userId", "supportId", "quantity", "subtotal", "discount", "total", "status", "method", "isDummy", "qrPayload", "qrMatrix", "createdAt", "updatedAt"]),
  SimulateDummyPayment: object({ status: { type: "string", enum: ["paid", "cancelled"] } }, ["status"], true),
  TripItem: object({ id: uuid, tripId: uuid, ...itemProperties, destinationName: str, destinationMeta: nullableText, difficulty: str, order: { type: "integer", minimum: 0 }, entryFee: { ...money, type: ["integer", "null"] } }),
  CreateTripItem: object(itemProperties, ["destinationId", "date"], true),
  UpdateTripItem: object(itemProperties, [], true),
  Trip: object({ id: uuid, ...tripProperties, status: { type: "string", enum: ["aktif", "arsip"] }, items: array(ref("TripItem")), createdAt: dateTime, updatedAt: dateTime }),
  CreateTrip: object(tripProperties, ["name", "startDate", "endDate", "peopleCount"], true),
  UpdateTrip: object({ ...tripProperties, status: { type: "string", enum: ["aktif", "arsip"] } }, [], true),
  ChecklistItem: object({ id: uuid, destinationId: uuid, name: str, category: { type: "string", enum: ["perlengkapan", "kesehatan", "konservasi", "administrasi"] }, isRequired: bool, isCompleted: bool, note: nullableText, createdAt: dateTime }),
  CreateChecklistItem: object({ name: str, category: { type: "string", enum: ["perlengkapan", "kesehatan", "konservasi", "administrasi"] }, isRequired: bool, note: nullableText }, ["name", "category", "isRequired"], true),
  UpdateChecklistItem: object({ name: str, isCompleted: bool, note: nullableText }, [], true),
  SavedDestination: object({ id: uuid, destination: ref("Destination"), savedAt: dateTime }),
  SaveDestination: object({ destinationId: uuid }, ["destinationId"], true),
  SavedTrip: object({ id: uuid, name: str, startDate: date, endDate: date, destinationCount: { type: "integer" }, destinationTotal: { type: "integer" }, status: { type: "string", enum: ["aktif", "arsip"] }, savedAt: dateTime }),
  SavedChecklist: object({ id: uuid, name: str, destinationName: str, completedCount: { type: "integer" }, totalCount: { type: "integer" }, finished: bool, savedAt: dateTime }),
  Notification: object({ id: uuid, kind: { type: "string", enum: ["rekomendasi", "rencana", "checklist", "usulan", "sistem"] }, title: str, body: str, read: bool, href: nullableText, createdAt: dateTime }),
  SelfProfile: object({ user: ref("AuthUser") }, ["user"]),
  UpdateSelfProfile: object({ name: { ...str, minLength: 2, maxLength: 120 } }, ["name"], true),
  UserPreferences: object(settingsProperties),
  UpdateUserPreferences: object(settingsProperties, [], true),
  Faq: object({ id: uuid, ...faqProperties }),
  CreateFaq: object(faqProperties, ["category", "question", "answer"], true),
  UpdateFaq: object(faqProperties, [], true),
  CreateFeedback: object({ category: { type: "string", enum: ["bug", "saran", "konten", "lainnya"] }, subject: { ...str, minLength: 3, maxLength: 160 }, message: { ...str, minLength: 10, maxLength: 5000 }, rating: { type: "integer", minimum: 0, maximum: 5 } }, ["category", "subject", "message"], true),
  Feedback: object({ id: uuid, userId: uuid, category: str, subject: str, message: str, rating: { type: ["integer", "null"] }, createdAt: dateTime }),
};

const json = (schema: object) => ({ "application/json": { schema } });
const error = (description: string) => ({ description, content: json(ref("ApiError")) });
const pagination = [
  { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
  { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 20 } },
  { name: "search", in: "query", schema: str },
  { name: "sort", in: "query", schema: str },
  { name: "order", in: "query", schema: { type: "string", enum: ["asc", "desc"] } },
];
type Options = { input?: string | object; list?: boolean; paged?: boolean; public?: boolean; status?: number; description?: string; filters?: string[] };
function operation(path: string, method: string, summary: string, output: string | null, options: Options = {}) {
  const authenticated = !options.public;
  const data = output === null ? { type: "null" } : options.list || options.paged ? array(ref(output)) : ref(output);
  const status = options.status ?? (method === "post" ? 201 : 200);
  return {
    tags: [path.startsWith("/api/admin/") ? "Admin integration" : path.includes("/payments") ? "Dummy payments" : "Personal integration"],
    summary, description: options.description,
    security: authenticated ? [{ bearerAuth: [] }] : [],
    parameters: [
      ...[...path.matchAll(/\{([^}]+)\}/g)].map((match) => ({ name: match[1], in: "path", required: true, schema: uuid })),
      ...(options.paged ? pagination : []),
      ...(options.filters ?? []).map((name) => ({ name, in: "query", schema: name.endsWith("Id") ? uuid : str })),
    ],
    ...(options.input ? { requestBody: { required: true, content: json(typeof options.input === "string" ? ref(options.input) : options.input) } } : {}),
    responses: {
      [status]: { description: "Success", content: json(object({ success: { type: "boolean", const: true }, data, ...(options.paged ? { meta: ref("PageMeta") } : {}) }, options.paged ? ["success", "data", "meta"] : ["success", "data"])) },
      "400": error("Invalid request"), "404": error("Not found or not owned by the caller"), "409": error("Conflict or immutable terminal status"), "422": error("Input validation failed"),
      ...(authenticated ? { "401": error("Authentication required") } : {}),
      ...(path.startsWith("/api/admin/") ? { "403": error("Admin role required") } : {}),
    },
  };
}
const paths: Record<string, Record<string, object>> = {};
function add(path: string, method: string, summary: string, output: string | null, options?: Options) {
  const key = `/api${path}`;
  (paths[key] ??= {})[method] = operation(key, method, summary, output, options);
}
add("/supports", "get", "Published travel supports", "TravelSupport", { public: true, paged: true, filters: ["destinationId", "category"] });
add("/admin/supports", "get", "Manage supports including draft destinations", "TravelSupport", { paged: true, filters: ["destinationId", "category"] });
add("/admin/supports", "post", "Create support", "TravelSupport", { input: "CreateSupport" });
for (const [method, summary, output, input] of [
  ["get", "Support detail for admin", "TravelSupport", undefined], ["patch", "Update support", "TravelSupport", "UpdateSupport"], ["delete", "Delete support", null, undefined],
] as const) add("/admin/supports/{id}", method, summary, output, { input });
add("/facility-proposals", "post", "Submit a facility suggestion", "FacilityProposal", { input: "CreateFacilityProposal" });
add("/facility-proposals/mine", "get", "My facility suggestions", "FacilityProposal", { list: true });
add("/admin/facility-proposals", "get", "Review facility suggestions", "FacilityProposal", { paged: true, filters: ["status"] });
add("/admin/facility-proposals/{id}", "patch", "Review suggestion without publishing a facility", "FacilityProposal", { input: "ReviewFacilityProposal" });
add("/admin/metrics", "get", "Persisted platform totals; revenue is dummy only", "AdminMetrics");
add("/admin/activity", "get", "Audit activity", "AuditActivity", { paged: true, filters: ["targetType"] });
add("/admin/merchants", "get", "Merchant users (admin only)", "AuthUser", { paged: true });
add("/promos", "get", "Currently active simulation promos", "Promo", { public: true, list: true });
add("/admin/promos", "get", "Manage simulation promos", "Promo", { paged: true });
add("/admin/promos", "post", "Create simulation promo", "Promo", { input: "CreatePromo" });
add("/admin/promos/{id}", "patch", "Update simulation promo", "Promo", { input: "UpdatePromo" });
add("/admin/promos/{id}", "delete", "Delete simulation promo", null);
add("/payments", "post", "Create DUMMY invoice; no funds or booking", "DummyPayment", { input: "CreateDummyPayment", description: "Server calculates integer rupiah from published support priceMin and valid promo. Client amount is rejected. QR text is a simulation, NOT QRIS. This does not reserve inventory." });
add("/payments/mine", "get", "My dummy invoices", "DummyPayment", { list: true });
add("/payments/{id}", "get", "Dummy invoice (owner or admin)", "DummyPayment");
add("/payments/{id}/simulate", "post", "Simulate terminal status; no actual charge", "DummyPayment", { input: "SimulateDummyPayment", description: "Pending may become paid or cancelled. Repeating the same terminal state is idempotent; a different terminal state returns 409." });
add("/admin/payments", "get", "Dummy payment history", "DummyPayment", { paged: true, filters: ["status"] });
add("/trips", "get", "My trips including itinerary items", "Trip", { list: true });
add("/trips", "post", "Create trip", "Trip", { input: "CreateTrip" });
add("/trips/{id}", "get", "My trip detail", "Trip");
add("/trips/{id}", "patch", "Update my trip", "Trip", { input: "UpdateTrip" });
add("/trips/{id}", "delete", "Delete my trip", null);
add("/trips/{id}/items", "post", "Add published destination within trip dates", "TripItem", { input: "CreateTripItem" });
add("/trips/{id}/items/{itemId}", "patch", "Update my itinerary item", "TripItem", { input: "UpdateTripItem" });
add("/trips/{id}/items/{itemId}", "delete", "Delete my itinerary item", null);
add("/destinations/{id}/checklist", "get", "My preparation items for this destination", "ChecklistItem", { list: true });
add("/checklists/{destId}/items", "post", "Add my preparation item", "ChecklistItem", { input: "CreateChecklistItem" });
add("/checklists/{destId}/items/{id}", "patch", "Update my preparation progress", "ChecklistItem", { input: "UpdateChecklistItem" });
add("/checklists/{destId}/items/{id}", "delete", "Delete my preparation item", null);
add("/saved/destinations", "get", "My saved published destinations", "SavedDestination", { list: true });
add("/saved/destinations", "post", "Save a published destination idempotently", "SavedDestination", { input: "SaveDestination" });
add("/saved/destinations/{destinationId}", "delete", "Unsave my destination", null);
add("/saved/plans", "get", "My saved trip summaries", "SavedTrip", { list: true });
add("/saved/plans/{id}", "patch", "Archive or reactivate my trip", "Trip", { input: object({ status: { type: "string", enum: ["aktif", "arsip"] } }, ["status"], true) });
add("/saved/plans/{id}", "delete", "Delete my saved trip", null);
add("/saved/checklists", "get", "My checklist summaries per destination", "SavedChecklist", { list: true });
add("/saved/checklists/{id}", "delete", "Delete my destination checklist", null);
add("/notifications", "get", "My in-app notifications", "Notification", { list: true });
add("/notifications/{id}/read", "patch", "Mark my notification read", "Notification", { input: object({ read: { type: "boolean", const: true } }, [], true) });
add("/notifications/read-all", "patch", "Mark all my notifications read", null);
add("/users/me", "get", "My existing public identity", "SelfProfile");
add("/users/me", "patch", "Update only my trimmed name (2..120 characters)", "SelfProfile", { input: "UpdateSelfProfile" });
add("/users/me/settings", "get", "My preferences; does not enable 2FA", "UserPreferences");
add("/users/me/settings", "patch", "Update my preferences; not security enrollment", "UserPreferences", { input: "UpdateUserPreferences" });
add("/faqs", "get", "Published help content", "Faq", { public: true, list: true });
add("/admin/faqs", "get", "Manage FAQ content", "Faq", { paged: true });
add("/admin/faqs", "post", "Create FAQ", "Faq", { input: "CreateFaq" });
add("/admin/faqs/{id}", "get", "FAQ detail for admin", "Faq");
add("/admin/faqs/{id}", "patch", "Update FAQ", "Faq", { input: "UpdateFaq" });
add("/admin/faqs/{id}", "delete", "Delete FAQ", null);
add("/feedback", "post", "Submit my feedback", "Feedback", { input: "CreateFeedback" });
add("/admin/feedback", "get", "Read user feedback", "Feedback", { paged: true });
export const integrationPaths = paths;
