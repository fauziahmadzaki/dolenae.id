/** OpenAPI 3.1 document served at GET /api/openapi.json (UI via Scalar at /api/docs). */
export const openApiDocument = {
  openapi: "3.1.0",
  info: {
    title: "Dolenae API",
    version: "0.1.0",
    description: "Backend API for Dolenae.id (web + mobile).",
  },
  servers: [{ url: "/", description: "Host root" }],
  tags: [
    { name: "Health", description: "Service and database status" },
    { name: "Meta", description: "Service info" },
    { name: "Auth", description: "Authentication and account access" },
    { name: "Users", description: "Admin user management" },
    { name: "Categories", description: "Destination categories (terrain/activity)" },
    { name: "Destinations", description: "Nature destinations catalog & admin CRUD" },
    { name: "Regions", description: "Indonesian province/regency/district data & reverse geocoding" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      ApiError: {
        type: "object",
        required: ["success", "error"],
        properties: {
          success: { type: "boolean", enum: [false] },
          error: {
            type: "object",
            required: ["code", "message"],
            properties: {
              code: { type: "string", example: "NOT_FOUND" },
              message: { type: "string", example: "Route tidak ditemukan" },
              details: {},
            },
          },
        },
      },
      HealthResponse: {
        type: "object",
        required: [
          "status",
          "service",
          "version",
          "uptimeSeconds",
          "db",
          "timestamp",
        ],
        properties: {
          status: { type: "string", example: "ok" },
          service: { type: "string", example: "Dolenae API" },
          version: { type: "string", example: "0.1.0" },
          uptimeSeconds: { type: "integer", example: 42 },
          db: { type: "string", enum: ["connected", "down"] },
          timestamp: { type: "string", format: "date-time" },
        },
      },
      AuthUser: {
        type: "object",
        required: ["id", "name", "email", "role", "provider", "createdAt", "updatedAt"],
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "Adi Achya" },
          email: { type: "string", format: "email", example: "adi@dolenae.id" },
          role: { type: "string", enum: ["wisatawan", "merchant", "admin"] },
          provider: { type: "string", enum: ["local", "google"] },
          avatarUrl: { type: ["string", "null"] },
          emailVerifiedAt: { type: ["string", "null"], format: "date-time" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      AuthTokenResponse: {
        type: "object",
        required: ["token", "user"],
        properties: {
          token: { type: "string", description: "JWT access token" },
          user: { $ref: "#/components/schemas/AuthUser" },
        },
      },
      Category: {
        type: "object",
        required: ["id", "name", "slug", "type", "createdAt", "updatedAt"],
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "Gunung" },
          slug: { type: "string", example: "gunung" },
          type: { type: "string", enum: ["terrain", "activity"] },
          icon: { type: ["string", "null"], example: "lucide:mountain" },
          description: { type: ["string", "null"] },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Destination: {
        type: "object",
        required: ["id", "name", "slug", "difficulty", "status", "createdAt", "updatedAt"],
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "Gunung Bromo" },
          slug: { type: "string", example: "gunung-bromo" },
          tagline: { type: ["string", "null"] },
          description: { type: ["string", "null"] },
          difficulty: { type: "string", enum: ["ramah-pemula", "menengah", "sulit"] },
          bestSeason: { type: "array", items: { type: "string" } },
          tags: { type: "array", items: { type: "string" } },
          terrain: { type: "array", items: { type: "string" } },
          activities: { type: "array", items: { type: "string" } },
          location: {
            type: "object",
            properties: {
              province: { type: ["string", "null"] },
              regency: { type: ["string", "null"] },
              district: { type: ["string", "null"] },
              latitude: { type: ["number", "null"] },
              longitude: { type: ["number", "null"] },
              accessPoint: { type: ["string", "null"] },
            },
          },
          access: {
            type: "object",
            properties: {
              description: { type: ["string", "null"] },
              transport: { type: "array", items: { type: "string" } },
              duration: { type: ["string", "null"] },
              distanceKm: { type: ["number", "null"] },
            },
          },
          facilities: { type: "array", items: { type: "string" } },
          entryFee: { type: ["integer", "null"] },
          elevationMeters: { type: ["integer", "null"] },
          images: { type: "array", items: { type: "string" } },
          guideRequired: { type: "boolean" },
          status: { type: "string", enum: ["draft", "published", "archived"] },
          verified: { type: "boolean" },
          categoryIds: { type: "array", items: { type: "string", format: "uuid" } },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      PagedCategories: {
        type: "object",
        properties: {
          success: { type: "boolean", enum: [true] },
          data: { type: "array", items: { $ref: "#/components/schemas/Category" } },
          meta: { $ref: "#/components/schemas/PageMeta" },
        },
      },
      PagedDestinations: {
        type: "object",
        properties: {
          success: { type: "boolean", enum: [true] },
          data: { type: "array", items: { $ref: "#/components/schemas/Destination" } },
          meta: { $ref: "#/components/schemas/PageMeta" },
        },
      },
      PageMeta: {
        type: "object",
        properties: {
          page: { type: "integer" },
          limit: { type: "integer" },
          total: { type: "integer" },
          totalPages: { type: "integer" },
          hasNext: { type: "boolean" },
          hasPrev: { type: "boolean" },
        },
      },
    },
  },
  paths: {
    "/": {
      get: {
        tags: ["Meta"],
        summary: "Service info",
        responses: {
          "200": { description: "OK" },
        },
      },
    },
    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        description: "Service status and database connectivity.",
        responses: {
          "200": {
            description: "Healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", enum: [true] },
                    data: { $ref: "#/components/schemas/HealthResponse" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new account",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string", example: "Adi Achya" },
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 8 },
                  role: { type: "string", enum: ["wisatawan", "merchant", "admin"] },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Account created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthTokenResponse" },
              },
            },
          },
          "409": { description: "Email already registered" },
          "422": { description: "Validation error" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login with email and password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Authenticated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthTokenResponse" },
              },
            },
          },
          "401": { description: "Invalid credentials" },
        },
      },
    },
    "/api/auth/google": {
      post: {
        tags: ["Auth"],
        summary: "Login with a Google ID token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["idToken"],
                properties: { idToken: { type: "string" } },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Authenticated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthTokenResponse" },
              },
            },
          },
          "401": { description: "Invalid Google token" },
        },
      },
    },
    "/api/auth/forgot-password": {
      post: {
        tags: ["Auth"],
        summary: "Request a password reset link",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: { email: { type: "string", format: "email" } },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Generic confirmation (no account enumeration)",
          },
        },
      },
    },
    "/api/auth/reset-password": {
      post: {
        tags: ["Auth"],
        summary: "Reset the password with a token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["token", "password"],
                properties: {
                  token: { type: "string" },
                  password: { type: "string", minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Password updated" },
          "400": { description: "Invalid or expired token" },
        },
      },
    },
    "/api/auth/verify-email": {
      post: {
        tags: ["Auth"],
        summary: "Verify an email address with the token from the link",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["token"],
                properties: { token: { type: "string" } },
              },
            },
          },
        },
        responses: {
          "200": { description: "Email verified (idempotent)" },
          "400": { description: "Unknown verification token" },
        },
      },
    },
    "/api/auth/resend-verification": {
      post: {
        tags: ["Auth"],
        summary: "Re-send the verification link",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: { email: { type: "string", format: "email" } },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Generic confirmation (no account enumeration)",
          },
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Current authenticated user",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Current user",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", enum: [true] },
                    data: {
                      type: "object",
                      properties: {
                        user: { $ref: "#/components/schemas/AuthUser" },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": { description: "Missing or invalid token" },
        },
      },
    },
    "/api/categories": {
      get: {
        tags: ["Categories"],
        summary: "List categories (public)",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20, maximum: 100 } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "type", in: "query", schema: { type: "string", enum: ["terrain", "activity"] } },
          { name: "sort", in: "query", schema: { type: "string", enum: ["createdAt", "name", "slug"] } },
          { name: "order", in: "query", schema: { type: "string", enum: ["asc", "desc"] } },
        ],
        responses: {
          "200": {
            description: "Paginated categories",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PagedCategories" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Categories"],
        summary: "Create a category (admin)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "type"],
                properties: {
                  name: { type: "string", example: "Gunung" },
                  slug: { type: "string", description: "Generated from name when omitted" },
                  type: { type: "string", enum: ["terrain", "activity"] },
                  icon: { type: ["string", "null"], example: "lucide:mountain" },
                  description: { type: ["string", "null"] },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Category created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", enum: [true] },
                    data: { $ref: "#/components/schemas/Category" },
                  },
                },
              },
            },
          },
          "401": { description: "Missing or invalid token" },
          "403": { description: "Admin role required" },
          "409": { description: "Slug already in use" },
          "422": { description: "Validation error" },
        },
      },
    },
    "/api/categories/{id}": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
      ],
      get: {
        tags: ["Categories"],
        summary: "Get a category (public)",
        responses: {
          "200": { description: "Category" },
          "404": { description: "Not found" },
        },
      },
      patch: {
        tags: ["Categories"],
        summary: "Update a category (admin)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                minProperties: 1,
                properties: {
                  name: { type: "string" },
                  slug: { type: "string" },
                  type: { type: "string", enum: ["terrain", "activity"] },
                  icon: { type: ["string", "null"] },
                  description: { type: ["string", "null"] },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Category updated" },
          "403": { description: "Admin role required" },
          "409": { description: "Slug already in use" },
          "404": { description: "Not found" },
        },
      },
      delete: {
        tags: ["Categories"],
        summary: "Delete a category (admin); detaches it from destinations",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Deleted" },
          "403": { description: "Admin role required" },
          "404": { description: "Not found" },
        },
      },
    },
    "/api/destinations": {
      get: {
        tags: ["Destinations"],
        summary: "List destinations (public)",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20, maximum: 100 } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "difficulty", in: "query", schema: { type: "string", enum: ["ramah-pemula", "menengah", "sulit"] } },
          { name: "status", in: "query", schema: { type: "string", enum: ["draft", "published", "archived"] } },
          { name: "categoryId", in: "query", schema: { type: "string", format: "uuid" } },
          { name: "sort", in: "query", schema: { type: "string", enum: ["createdAt", "name", "updatedAt", "elevationMeters"] } },
          { name: "order", in: "query", schema: { type: "string", enum: ["asc", "desc"] } },
        ],
        responses: {
          "200": {
            description: "Paginated destinations",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PagedDestinations" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Destinations"],
        summary: "Create a destination (admin)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string", example: "Gunung Bromo" },
                  slug: { type: "string", description: "Generated from name when omitted" },
                  tagline: { type: ["string", "null"] },
                  description: { type: ["string", "null"] },
                  difficulty: { type: "string", enum: ["ramah-pemula", "menengah", "sulit"] },
                  bestSeason: { type: "array", items: { type: "string" } },
                  tags: { type: "array", items: { type: "string" } },
                  terrain: { type: "array", items: { type: "string" } },
                  activities: { type: "array", items: { type: "string" } },
                  location: { type: "object" },
                  access: { type: "object" },
                  facilities: { type: "array", items: { type: "string" } },
                  entryFee: { type: ["integer", "null"] },
                  elevationMeters: { type: ["integer", "null"] },
                  images: { type: "array", items: { type: "string" } },
                  guideRequired: { type: "boolean" },
                  status: { type: "string", enum: ["draft", "published", "archived"] },
                  categoryIds: { type: "array", items: { type: "string", format: "uuid" } },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Destination created" },
          "401": { description: "Missing or invalid token" },
          "403": { description: "Admin role required" },
          "409": { description: "Slug already in use" },
          "422": { description: "Validation error" },
        },
      },
    },
    "/api/destinations/{id}": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
      ],
      get: {
        tags: ["Destinations"],
        summary: "Get a destination with its categories (public)",
        responses: {
          "200": { description: "Destination detail" },
          "404": { description: "Not found" },
        },
      },
      patch: {
        tags: ["Destinations"],
        summary: "Update a destination (admin)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                minProperties: 1,
                description: "Partial destination fields; categoryIds replaces all links",
              },
            },
          },
        },
        responses: {
          "200": { description: "Destination updated" },
          "403": { description: "Admin role required" },
          "404": { description: "Not found" },
        },
      },
      delete: {
        tags: ["Destinations"],
        summary: "Delete a destination (admin)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Deleted" },
          "403": { description: "Admin role required" },
          "404": { description: "Not found" },
        },
      },
    },
    "/api/regions/provinces": {
      get: {
        tags: ["Regions"],
        summary: "List provinces (public)",
        responses: {
          "200": { description: "Province list" },
        },
      },
    },
    "/api/regions/regencies": {
      get: {
        tags: ["Regions"],
        summary: "List regencies of a province (public)",
        parameters: [
          { name: "province", in: "query", required: true, schema: { type: "string", example: "35" } },
        ],
        responses: {
          "200": { description: "Regency list" },
          "422": { description: "Validation error" },
        },
      },
    },
    "/api/regions/districts": {
      get: {
        tags: ["Regions"],
        summary: "List districts of a regency (public)",
        parameters: [
          { name: "regency", in: "query", required: true, schema: { type: "string", example: "35.13" } },
        ],
        responses: {
          "200": { description: "District list" },
          "422": { description: "Validation error" },
        },
      },
    },
    "/api/regions/reverse": {
      get: {
        tags: ["Regions"],
        summary: "Approximate reverse geocode from a coordinate (public)",
        description: "Returns the nearest district centroid, not an administrative boundary lookup.",
        parameters: [
          { name: "lat", in: "query", required: true, schema: { type: "number", minimum: -90, maximum: 90 } },
          { name: "lng", in: "query", required: true, schema: { type: "number", minimum: -180, maximum: 180 } },
        ],
        responses: {
          "200": { description: "Province, regency, district and distance in km" },
          "422": { description: "Validation error" },
        },
      },
    },
  },
} as const;
