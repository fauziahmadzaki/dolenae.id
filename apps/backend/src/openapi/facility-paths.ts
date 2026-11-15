export const facilitySchemas = {
  MerchantProduct: {
    allOf: [
      { $ref: "#/components/schemas/FacilityProduct" },
      {
        type: "object",
        required: ["facilityName", "destinationName"],
        properties: {
          facilityName: { type: "string" },
          destinationName: { type: "string" },
        },
      },
    ],
  },
  PagedMerchantProducts: {
    type: "object",
    properties: {
      success: { type: "boolean", enum: [true] },
      data: { type: "array", items: { $ref: "#/components/schemas/MerchantProduct" } },
      meta: { $ref: "#/components/schemas/PageMeta" },
    },
  },
  FacilityProduct: {
    type: "object",
    required: ["id", "facilityId", "name", "price", "position", "isActive", "createdAt", "updatedAt"],
    properties: {
      id: { type: "string", format: "uuid" },
      facilityId: { type: "string", format: "uuid" },
      name: { type: "string" },
      description: { type: ["string", "null"] },
      bannerUrl: { type: ["string", "null"] },
      price: { type: "integer", minimum: 0 },
      position: { type: "integer", minimum: 0 },
      isActive: { type: "boolean" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  Facility: {
    type: "object",
    required: ["id", "destinationId", "destinationName", "name", "category", "type", "location", "contact", "status", "createdAt", "updatedAt"],
    properties: {
      id: { type: "string", format: "uuid" },
      destinationId: { type: "string", format: "uuid" },
      destinationName: { type: "string" },
      ownerId: { type: ["string", "null"], format: "uuid" },
      name: { type: "string" },
      category: { type: "string", enum: ["transport", "accommodation", "food"] },
      type: { type: "string" },
      location: {
        type: "object",
        properties: {
          latitude: { type: "number" },
          longitude: { type: "number" },
        },
      },
      priceMin: { type: ["integer", "null"] },
      priceMax: { type: ["integer", "null"] },
      description: { type: ["string", "null"] },
      contact: { type: "string" },
      contactEmail: { type: ["string", "null"] },
      website: { type: ["string", "null"] },
      bannerUrl: { type: ["string", "null"] },
      status: { type: "string", enum: ["draft", "pending", "published", "rejected", "archived"] },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  FacilityResponse: {
    type: "object",
    required: ["success", "data"],
    properties: {
      success: { type: "boolean", enum: [true] },
      data: { $ref: "#/components/schemas/Facility" },
    },
  },
  FacilityDetailResponse: {
    type: "object",
    required: ["success", "data"],
    properties: {
      success: { type: "boolean", enum: [true] },
      data: {
        allOf: [
          { $ref: "#/components/schemas/Facility" },
          {
            type: "object",
            required: ["products"],
            properties: {
              products: { type: "array", items: { $ref: "#/components/schemas/FacilityProduct" } },
            },
          },
        ],
      },
    },
  },
  PagedFacilities: {
    type: "object",
    properties: {
      success: { type: "boolean", enum: [true] },
      data: { type: "array", items: { $ref: "#/components/schemas/Facility" } },
      meta: { $ref: "#/components/schemas/PageMeta" },
    },
  },
  FacilityProductResponse: {
    type: "object",
    required: ["success", "data"],
    properties: {
      success: { type: "boolean", enum: [true] },
      data: { $ref: "#/components/schemas/FacilityProduct" },
    },
  },
};

const facilityParams = {
  id: { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
  productId: { name: "productId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
} as const;

const facilityBody = {
  required: ["destinationId", "name", "category", "type", "latitude", "longitude", "contact"],
  type: "object",
  properties: {
    destinationId: { type: "string", format: "uuid" },
    name: { type: "string", minLength: 2, maxLength: 120 },
    category: { type: "string", enum: ["transport", "accommodation", "food"] },
    type: { type: "string", maxLength: 60 },
    latitude: { type: "number", minimum: -90, maximum: 90 },
    longitude: { type: "number", minimum: -180, maximum: 180 },
    priceMin: { type: ["integer", "null"], minimum: 0 },
    priceMax: { type: ["integer", "null"], minimum: 0 },
    description: { type: ["string", "null"] },
    contact: { type: "string" },
    contactEmail: { type: ["string", "null"] },
    website: { type: ["string", "null"], format: "uri" },
    bannerUrl: { type: ["string", "null"], format: "uri" },
    status: { type: "string", enum: ["draft", "pending", "published", "rejected", "archived"] },
  },
} as const;

export const facilityPaths = {
  "/api/products/mine": {
    get: {
      tags: ["Facilities"],
      summary: "List products across the merchant's facilities",
      description: "Merchant sees only products of facilities they own; admin sees all.",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "search", in: "query", schema: { type: "string" } },
        { name: "facilityId", in: "query", schema: { type: "string", format: "uuid" } },
        { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
        { name: "limit", in: "query", schema: { type: "integer", minimum: 1, default: 20, maximum: 100 } },
      ],
      responses: {
        "200": { description: "Paginated products", content: { "application/json": { schema: { $ref: "#/components/schemas/PagedMerchantProducts" } } } },
        "401": { description: "Missing token", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        "403": { description: "Not a merchant/admin", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        "422": { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
      },
    },
  },
  "/api/destinations/{id}/facilities": {
    get: {
      tags: ["Facilities"],
      summary: "List published facilities of a destination",
      security: [],
      parameters: [
        facilityParams.id,
        { name: "category", in: "query", schema: { type: "string", enum: ["transport", "accommodation", "food"] } },
        { name: "type", in: "query", schema: { type: "string" } },
        { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
        { name: "limit", in: "query", schema: { type: "integer", minimum: 1, default: 20, maximum: 100 } },
      ],
      responses: {
        "200": { description: "Paginated facilities", content: { "application/json": { schema: { $ref: "#/components/schemas/PagedFacilities" } } } },
        "400": { description: "Invalid UUID", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        "404": { description: "Destination not found or not published", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        "422": { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
      },
    },
  },
  "/api/facilities/mine": {
    get: {
      tags: ["Facilities"],
      summary: "List facilities owned by the merchant (admin sees all)",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
        { name: "limit", in: "query", schema: { type: "integer", minimum: 1, default: 20, maximum: 100 } },
      ],
      responses: {
        "200": { description: "Paginated facilities", content: { "application/json": { schema: { $ref: "#/components/schemas/PagedFacilities" } } } },
        "401": { description: "Missing token", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        "403": { description: "Not a merchant/admin", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        "422": { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
      },
    },
  },
  "/api/facilities": {
    post: {
      tags: ["Facilities"],
      summary: "Register a facility (merchant or admin)",
      description: "Merchant submissions start as pending; admin submissions default to published. The facility must be within 20 km of the destination coordinates.",
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { "application/json": { schema: facilityBody } } },
      responses: {
        "201": { description: "Created facility", content: { "application/json": { schema: { $ref: "#/components/schemas/FacilityResponse" } } } },
        "400": { description: "Bad request", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        "401": { description: "Missing token", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        "403": { description: "Not a merchant/admin", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        "404": { description: "Destination not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        "422": { description: "Distance, price, or validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
      },
    },
  },
  "/api/facilities/{id}": {
    get: {
      tags: ["Facilities"],
      summary: "Facility detail with products",
      security: [],
      parameters: [facilityParams.id],
      responses: {
        "200": { description: "Facility detail", content: { "application/json": { schema: { $ref: "#/components/schemas/FacilityDetailResponse" } } } },
        "400": { description: "Invalid UUID", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        "404": { description: "Not found or not published", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
      },
    },
    patch: {
      tags: ["Facilities"],
      summary: "Update a facility (owner or admin)",
      security: [{ bearerAuth: [] }],
      parameters: [facilityParams.id],
      requestBody: { required: true, content: { "application/json": { schema: facilityBody } } },
      responses: {
        "200": { description: "Updated facility", content: { "application/json": { schema: { $ref: "#/components/schemas/FacilityResponse" } } } },
        "401": { description: "Missing token", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        "403": { description: "Not the owner", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        "404": { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        "422": { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
      },
    },
    delete: {
      tags: ["Facilities"],
      summary: "Delete a facility (owner or admin)",
      security: [{ bearerAuth: [] }],
      parameters: [facilityParams.id],
      responses: {
        "200": { description: "Deleted", content: { "application/json": { schema: { $ref: "#/components/schemas/FacilityResponse" } } } },
        "401": { description: "Missing token", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        "403": { description: "Not the owner", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        "404": { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
      },
    },
  },
  "/api/facilities/{id}/products": {
    post: {
      tags: ["Facilities"],
      summary: "Add a product to a facility (owner or admin)",
      security: [{ bearerAuth: [] }],
      parameters: [facilityParams.id],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "price"],
              properties: {
                name: { type: "string" },
                description: { type: ["string", "null"] },
                bannerUrl: { type: ["string", "null"], format: "uri" },
                price: { type: "integer", minimum: 0 },
                position: { type: "integer", minimum: 0 },
                isActive: { type: "boolean" },
              },
            },
          },
        },
      },
      responses: {
        "201": { description: "Created product", content: { "application/json": { schema: { $ref: "#/components/schemas/FacilityProductResponse" } } } },
        "401": { description: "Missing token", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        "403": { description: "Not the owner", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        "404": { description: "Facility not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        "422": { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
      },
    },
  },
  "/api/facilities/{id}/products/{productId}": {
    patch: {
      tags: ["Facilities"],
      summary: "Update a facility product (owner or admin)",
      security: [{ bearerAuth: [] }],
      parameters: [facilityParams.id, facilityParams.productId],
      requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
      responses: {
        "200": { description: "Updated product", content: { "application/json": { schema: { $ref: "#/components/schemas/FacilityProductResponse" } } } },
        "401": { description: "Missing token", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        "403": { description: "Not the owner", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        "404": { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        "422": { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
      },
    },
    delete: {
      tags: ["Facilities"],
      summary: "Delete a facility product (owner or admin)",
      security: [{ bearerAuth: [] }],
      parameters: [facilityParams.id, facilityParams.productId],
      responses: {
        "200": { description: "Deleted", content: { "application/json": { schema: { $ref: "#/components/schemas/FacilityProductResponse" } } } },
        "401": { description: "Missing token", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        "403": { description: "Not the owner", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        "404": { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
      },
    },
  },
};

export const facilityTag = {
  name: "Facilities",
  description: "Merchant/admin facility management with products and 20 km geofence",
};
