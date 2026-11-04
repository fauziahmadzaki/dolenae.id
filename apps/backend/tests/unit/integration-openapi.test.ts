import { describe, expect, it } from "vitest";
import { openApiDocument } from "../../src/openapi/document";

const document = openApiDocument as unknown as Record<string, any>;
const paths: Record<string, string[]> = {
  "/api/supports": ["get"],
  "/api/admin/supports": ["get", "post"],
  "/api/admin/supports/{id}": ["get", "patch", "delete"],
  "/api/facility-proposals": ["post"],
  "/api/facility-proposals/mine": ["get"],
  "/api/admin/facility-proposals": ["get"],
  "/api/admin/facility-proposals/{id}": ["patch"],
  "/api/admin/metrics": ["get"],
  "/api/admin/activity": ["get"],
  "/api/promos": ["get"],
  "/api/admin/promos": ["get", "post"],
  "/api/admin/promos/{id}": ["patch", "delete"],
  "/api/payments": ["post"],
  "/api/payments/mine": ["get"],
  "/api/payments/{id}": ["get"],
  "/api/payments/{id}/simulate": ["post"],
  "/api/admin/payments": ["get"],
  "/api/trips": ["get", "post"],
  "/api/trips/{id}": ["get", "patch", "delete"],
  "/api/trips/{id}/items": ["post"],
  "/api/trips/{id}/items/{itemId}": ["patch", "delete"],
  "/api/destinations/{id}/checklist": ["get"],
  "/api/checklists/{destId}/items": ["post"],
  "/api/checklists/{destId}/items/{id}": ["patch", "delete"],
  "/api/saved/destinations": ["get", "post"],
  "/api/saved/destinations/{destinationId}": ["delete"],
  "/api/saved/plans": ["get"],
  "/api/saved/plans/{id}": ["patch", "delete"],
  "/api/saved/checklists": ["get"],
  "/api/saved/checklists/{id}": ["delete"],
  "/api/notifications": ["get"],
  "/api/notifications/{id}/read": ["patch"],
  "/api/notifications/read-all": ["patch"],
  "/api/users/me/settings": ["get", "patch"],
  "/api/faqs": ["get"],
  "/api/admin/faqs": ["get", "post"],
  "/api/admin/faqs/{id}": ["patch", "delete"],
  "/api/feedback": ["post"],
  "/api/admin/feedback": ["get"],
};
const anonymous = new Set(["/api/supports", "/api/promos", "/api/faqs"]);

describe("integration API documentation", () => {
  it.each(Object.entries(paths))("documents methods and auth: %s", (path, methods) => {
    for (const method of methods) {
      const operation = document.paths[path]?.[method];
      expect(operation, `${method} ${path}`).toBeDefined();
      expect(operation.security).toEqual(anonymous.has(path) ? [] : [{ bearerAuth: [] }]);
      expect(operation.responses[method === "post" ? "201" : "200"]).toBeDefined();
      for (const match of path.matchAll(/\{([^}]+)\}/g)) {
        expect(operation.parameters).toContainEqual(expect.objectContaining({
          name: match[1], in: "path", required: true, schema: { type: "string", format: "uuid" },
        }));
      }
      if (!anonymous.has(path)) expect(operation.responses["401"]).toBeDefined();
      if (path.startsWith("/api/admin/")) expect(operation.responses["403"]).toBeDefined();
    }
  });

  it("documents dummy-only payment amounts, QR and terminal state changes", () => {
    const schemas = document.components.schemas;
    expect(schemas.DummyPayment.properties.isDummy.const).toBe(true);
    expect(schemas.DummyPayment.properties.method.const).toBe("dummy_qr");
    expect(schemas.DummyPayment.properties.status.enum).toEqual(["pending", "paid", "cancelled"]);
    expect(schemas.DummyPayment.properties.qrMatrix.items.items.type).toBe("boolean");
    expect(schemas.CreateDummyPayment.required).toContain("supportId");
    expect(schemas.CreateDummyPayment.properties).not.toHaveProperty("amount");
    expect(schemas.CreateDummyPayment.additionalProperties).toBe(false);
    expect(document.paths["/api/payments/{id}/simulate"].post.responses["409"]).toBeDefined();
  });

  it("documents bounded pagination and partial owner settings", () => {
    const list = document.paths["/api/admin/supports"].get;
    expect(list.parameters).toContainEqual(expect.objectContaining({
      name: "limit", in: "query", schema: expect.objectContaining({ maximum: 100 }),
    }));
    const schema = document.components.schemas.UserPreferences;
    expect(schema.properties.privacy.properties).not.toHaveProperty("twoFactor");
    expect(document.paths["/api/users/me/settings"].patch.requestBody).toBeDefined();
  });
});
