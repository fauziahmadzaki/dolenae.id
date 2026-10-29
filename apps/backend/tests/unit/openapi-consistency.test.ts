import { describe, expect, it } from "vitest";
import { openApiDocument } from "../../src/openapi/document";
import { supportIdParamsSchema, supportListQuerySchema } from "../../src/controllers/support.schema";
import { destinationIdParamsSchema, routeEntityIdParamsSchema } from "../../src/controllers/route.schema";

const document = openApiDocument as unknown as Record<string, any>;
const publicPaths = [
  "/api/supports/{id}",
  "/api/destinations/{id}/supports",
  "/api/public/destinations/{destinationId}/route-graph",
  "/api/public/routes/{id}/profile",
];

describe("OpenAPI public contracts", () => {
  it("resolves every local reference and declared security scheme", () => {
    const visit = (value: any): void => {
      if (!value || typeof value !== "object") return;
      if (value.$ref) {
        expect(value.$ref).toMatch(/^#\//);
        const target = value.$ref.slice(2).split("/").reduce(
          (node: any, part: string) => node?.[part.replace(/~1/g, "/").replace(/~0/g, "~")], document,
        );
        expect(target, value.$ref).toBeDefined();
      }
      for (const requirement of value.security ?? []) {
        for (const name of Object.keys(requirement)) {
          expect(document.components.securitySchemes[name], name).toBeDefined();
        }
      }
      Object.values(value).forEach(visit);
    };
    visit(document);
  });

  it.each(publicPaths)("declares anonymous access and typed envelopes: %s", (path) => {
    const operation = document.paths[path]?.get;
    expect(operation).toBeDefined();
    expect(operation.security).toEqual([]);
    expect(operation.responses["200"].content["application/json"].schema.$ref).toBeDefined();
    expect(operation.responses["404"].content["application/json"].schema.$ref).toBe("#/components/schemas/ApiError");
  });

  it("matches UUID and pagination validators, including distinct 400/422 errors", () => {
    expect(() => supportIdParamsSchema.parse({ id: "bad" })).toThrow();
    expect(destinationIdParamsSchema.safeParse({ destinationId: "bad" }).success).toBe(false);
    expect(routeEntityIdParamsSchema.safeParse({ id: "bad" }).success).toBe(false);
    for (const path of publicPaths) {
      const code = path.includes("/public/") ? "422" : "400";
      expect(document.paths[path].get.responses[code]).toBeDefined();
    }
    const query = supportListQuerySchema.parse({});
    const operation = document.paths["/api/destinations/{id}/supports"].get;
    for (const [name, value] of Object.entries(query)) {
      expect(operation.parameters.find((parameter: any) => parameter.name === name).schema.default).toBe(value);
    }
    expect(supportListQuerySchema.safeParse({ limit: 101 }).success).toBe(false);
    expect(operation.parameters.find((parameter: any) => parameter.name === "limit").schema.maximum).toBe(100);
    expect(operation.responses["422"]).toBeDefined();
    for (const path of publicPaths.slice(0, 2)) expect(document.paths[path].get.responses["401"]).toBeDefined();
  });

  it("documents support nullable fields, join name, category and pagination", () => {
    const schemas = document.components.schemas;
    const support = schemas.TravelSupport;
    expect(support.properties.category.enum).toEqual(["accommodation", "transport", "food"]);
    expect(support.required).toContain("relatedDestinationName");
    for (const name of ["description", "locationLabel", "capacity", "distanceLabel", "priceLabel", "priceUnit", "contactPhone", "contactWhatsapp", "contactInstagram", "imageUrl"]) {
      expect(support.properties[name].type).toEqual(["string", "null"]);
    }
    expect(schemas.PagedSupports.required).toEqual(["success", "data", "meta"]);
    expect(schemas.PagedSupports.properties.meta.$ref).toBe("#/components/schemas/PageMeta");
  });

  it("keeps full geometry and unknown public elevations without changing admin security", () => {
    const schemas = document.components.schemas;
    expect(schemas.TrailRoute.properties.points.items.$ref).toBe("#/components/schemas/RoutePoint");
    expect(schemas.RoutePoint.properties.elevationMeters.type).toEqual(["number", "null"]);
    expect(schemas.PublicRouteProfile.required).toContain("elevationAvailable");
    expect(schemas.PublicRouteProfile.required).toContain("elevationEstimated");
    for (const name of ["totalGainMeters", "totalLossMeters", "maxElevationMeters", "minElevationMeters", "steepestGradePercent", "estimatedDurationMinutes"]) {
      expect(schemas.PublicRouteProfile.properties[name].type).toEqual(["number", "null"]);
    }
    expect(schemas.PublicElevationPoint.properties.elevationMeters.type).toEqual(["number", "null"]);
    for (const path of ["/api/destinations/{destinationId}/route-graph", "/api/routes/{id}/profile"]) {
      expect(document.paths[path].get.security).toEqual([{ bearerAuth: [] }]);
    }
  });
});
