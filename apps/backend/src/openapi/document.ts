import { facilityPaths, facilitySchemas, facilityTag } from "./facility-paths";

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
    { name: "Contents", description: "Editorial content (Artikel/Panduan/Tips) and admin gallery photos" },
    { name: "Destinations", description: "Nature destinations catalog & admin CRUD" },
    { name: "Regions", description: "Indonesian province/regency/district data & reverse geocoding" },
    { name: "Supports", description: "Published-destination travel support discovery" },
    { name: "Routes", description: "Route builder: track nodes, segments, trails and elevation profiles" },
    { name: "Plans", description: "Per-account saved trip plans with itinerary, briefing, sources, and checklist" },
    { name: "AI", description: "Grounded AI itineraries with retrieval + general-knowledge briefing" },
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
      PagedContents: {
        type: "object",
        properties: {
          success: { type: "boolean", enum: [true] },
          data: { type: "array", items: { type: "object" } },
          meta: { $ref: "#/components/schemas/PageMeta" },
        },
      },
      PagedGallery: {
        type: "object",
        properties: {
          success: { type: "boolean", enum: [true] },
          data: { type: "array", items: { type: "object" } },
          meta: { $ref: "#/components/schemas/PageMeta" },
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
      "TravelSupport": {
        "type": "object",
        "required": ["id", "destinationId", "name", "category", "description", "locationLabel", "capacity", "distanceLabel", "priceLabel", "priceUnit", "contactPhone", "contactWhatsapp", "contactInstagram", "imageUrl", "facilities", "routes", "cuisine", "includesDriver", "verified", "relatedDestinationName", "createdAt", "updatedAt"],
        "properties": {
          "id": {"type": "string", "format": "uuid"},
          "destinationId": {"type": "string", "format": "uuid"},
          "name": {"type": "string"},
          "category": {"type": "string", "enum": ["accommodation", "transport", "food"]},
          "description": {"type": ["string", "null"]},
          "locationLabel": {"type": ["string", "null"]},
          "capacity": {"type": ["string", "null"]},
          "distanceLabel": {"type": ["string", "null"]},
          "priceLabel": {"type": ["string", "null"]},
          "priceUnit": {"type": ["string", "null"]},
          "contactPhone": {"type": ["string", "null"]},
          "contactWhatsapp": {"type": ["string", "null"]},
          "contactInstagram": {"type": ["string", "null"]},
          "imageUrl": {"type": ["string", "null"]},
          "facilities": {
            "type": "array",
            "items": {"type": "string"}
          },
          "routes": {
            "type": "array",
            "items": {"type": "string"}
          },
          "cuisine": {
            "type": "array",
            "items": {"type": "string"}
          },
          "includesDriver": {"type": "boolean"},
          "verified": {"type": "boolean"},
          "relatedDestinationName": {"type": "string"},
          "createdAt": {"type": "string", "format": "date-time"},
          "updatedAt": {"type": "string", "format": "date-time"}
        }
      },
      "SupportResponse": {
        "type": "object",
        "required": ["success", "data"],
        "properties": {
          "success": {"type": "boolean", "enum": [true]},
          "data": {"$ref": "#/components/schemas/TravelSupport"}
        }
      },
      "PagedSupports": {
        "type": "object",
        "required": ["success", "data", "meta"],
        "properties": {
          "success": {"type": "boolean", "enum": [true]},
          "data": {
            "type": "array",
            "items": {"$ref": "#/components/schemas/TravelSupport"}
          },
          "meta": {"$ref": "#/components/schemas/PageMeta"}
        }
      },
      "TrackNode": {
        "type": "object",
        "required": ["id", "destinationId", "name", "type", "coordinate", "elevationMeters", "notes", "imageUrl", "createdAt", "updatedAt"],
        "properties": {
          "id": {"type": "string", "format": "uuid"},
          "destinationId": {"type": "string", "format": "uuid"},
          "name": {"type": "string"},
          "type": {"type": "string", "enum": ["basecamp", "gerbang", "parkir", "pos", "sumber-air", "viewpoint", "puncak", "persimpangan", "area-camp"]},
          "coordinate": {
            "type": "object",
            "required": ["latitude", "longitude"],
            "properties": {
              "latitude": {"type": "number"},
              "longitude": {"type": "number"}
            }
          },
          "elevationMeters": {"type": "number"},
          "notes": {"type": ["string", "null"]},
          "imageUrl": {"type": ["string", "null"]},
          "createdAt": {"type": "string", "format": "date-time"},
          "updatedAt": {"type": "string", "format": "date-time"}
        }
      },
      "RouteSegment": {
        "type": "object",
        "required": ["id", "destinationId", "fromNodeId", "toNodeId", "surface", "grade", "traversableBy", "bidirectional", "distanceKm", "estimatedDurationMinutes", "seasonal", "notes", "status", "createdAt", "updatedAt"],
        "properties": {
          "id": {"type": "string", "format": "uuid"},
          "destinationId": {"type": "string", "format": "uuid"},
          "fromNodeId": {"type": "string", "format": "uuid"},
          "toNodeId": {"type": "string", "format": "uuid"},
          "surface": {"type": "string", "enum": ["setapak", "aspal", "tanah", "tanah-liat", "batu", "pasir"]},
          "grade": {"type": "string", "enum": ["datar", "landai", "sedang", "terjal", "sangat-terjal"]},
          "traversableBy": {
            "type": "array",
            "items": {"type": "string"}
          },
          "bidirectional": {"type": "boolean"},
          "distanceKm": {"type": ["number", "null"]},
          "estimatedDurationMinutes": {"type": ["number", "null"]},
          "seasonal": {"type": "boolean"},
          "notes": {"type": ["string", "null"]},
          "status": {"type": "string", "enum": ["draft", "diterbitkan", "terverifikasi"]},
          "createdAt": {"type": "string", "format": "date-time"},
          "updatedAt": {"type": "string", "format": "date-time"}
        }
      },
      "RoutePoint": {
        "type": "object",
        "required": ["latitude", "longitude", "elevationMeters", "nodeId"],
        "properties": {
          "latitude": {"type": "number"},
          "longitude": {"type": "number"},
          "elevationMeters": {"type": ["number", "null"]},
          "nodeId": {"type": ["string", "null"], "format": "uuid"}
        }
      },
      "TrailRoute": {
        "type": "object",
        "required": ["id", "destinationId", "name", "description", "basecampNodeId", "nodeIds", "segmentIds", "points", "surface", "grade", "traversableBy", "difficulty", "recommended", "status", "createdAt", "updatedAt"],
        "properties": {
          "id": {"type": "string", "format": "uuid"},
          "destinationId": {"type": "string", "format": "uuid"},
          "name": {"type": "string"},
          "description": {"type": ["string", "null"]},
          "basecampNodeId": {"type": ["string", "null"], "format": "uuid"},
          "nodeIds": {
            "type": "array",
            "items": {"type": "string", "format": "uuid"}
          },
          "segmentIds": {
            "type": "array",
            "items": {"type": "string", "format": "uuid"}
          },
          "points": {
            "type": "array",
            "items": {"$ref": "#/components/schemas/RoutePoint"},
            "description": "Full ordered geometry, including free bends with nodeId null. Legacy node-only routes derive points from anchors."
          },
          "surface": {"type": "string"},
          "grade": {"type": "string", "enum": ["datar", "landai", "sedang", "terjal", "sangat-terjal"]},
          "traversableBy": {
            "type": "array",
            "items": {"type": "string"}
          },
          "difficulty": {"type": "string", "enum": ["ramah-pemula", "menengah", "sulit"]},
          "recommended": {"type": "boolean"},
          "status": {"type": "string", "enum": ["terverifikasi", "alternatif", "dalam-perbaikan", "rusak", "terlarang"]},
          "createdAt": {"type": "string", "format": "date-time"},
          "updatedAt": {"type": "string", "format": "date-time"}
        }
      },
      "RouteGraph": {
        "type": "object",
        "required": ["nodes", "segments", "routes"],
        "properties": {
          "nodes": {
            "type": "array",
            "items": {"$ref": "#/components/schemas/TrackNode"}
          },
          "segments": {
            "type": "array",
            "items": {"$ref": "#/components/schemas/RouteSegment"}
          },
          "routes": {
            "type": "array",
            "items": {"$ref": "#/components/schemas/TrailRoute"}
          }
        }
      },
      "PublicElevationPoint": {
        "type": "object",
        "required": ["distanceKm", "elevationMeters", "nodeId", "name", "type"],
        "properties": {
          "distanceKm": {"type": "number"},
          "elevationMeters": {"type": ["number", "null"]},
          "nodeId": {"type": "string", "description": "UUID for an anchor; empty string for an unanchored bend."},
          "name": {"type": "string"},
          "type": {"type": "string", "enum": ["basecamp", "gerbang", "parkir", "pos", "sumber-air", "viewpoint", "puncak", "persimpangan", "area-camp", "belokan"]}
        }
      },
      "PublicRouteProfile": {
        "type": "object",
        "required": ["routeId", "points", "totalDistanceKm", "totalGainMeters", "totalLossMeters", "maxElevationMeters", "minElevationMeters", "steepestGradePercent", "estimatedDurationMinutes", "elevationAvailable", "elevationEstimated"],
        "properties": {
          "routeId": {"type": "string", "format": "uuid"},
          "points": {
            "type": "array",
            "items": {"$ref": "#/components/schemas/PublicElevationPoint"}
          },
          "totalDistanceKm": {"type": "number"},
          "totalGainMeters": {"type": ["number", "null"]},
          "totalLossMeters": {"type": ["number", "null"]},
          "maxElevationMeters": {"type": ["number", "null"]},
          "minElevationMeters": {"type": ["number", "null"]},
          "steepestGradePercent": {"type": ["number", "null"]},
          "estimatedDurationMinutes": {"type": ["number", "null"]},
          "elevationAvailable": {"type": "boolean"},
          "elevationEstimated": {"type": "boolean"}
        },
        "description": "Public profile only. No known elevation: elevationAvailable=false, elevationEstimated=false, every point elevation and elevation-dependent statistic (including duration) is null; totalDistanceKm remains numeric. Some known elevations: missing values interpolated or nearest-known filled, elevationEstimated=true. All known: elevationEstimated=false. Admin profile unchanged."
      },
      "PublicRouteGraphResponse": {
        "type": "object",
        "required": ["success", "data"],
        "properties": {
          "success": {"type": "boolean", "enum": [true]},
          "data": {"$ref": "#/components/schemas/RouteGraph"}
        }
      },
      "PublicRouteProfileResponse": {
        "type": "object",
        "required": ["success", "data"],
        "properties": {
          "success": {"type": "boolean", "enum": [true]},
          "data": {"$ref": "#/components/schemas/PublicRouteProfile"}
        }
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
      TripPlanBriefing: {
        type: "object",
        properties: {
          grounded: { type: "array", maxItems: 30, items: { type: "string", maxLength: 600 } },
          general: { type: "array", maxItems: 30, items: { type: "string", maxLength: 600 } },
          warnings: { type: "array", maxItems: 30, items: { type: "string", maxLength: 600 } },
        },
      },
      TripPlanDayItem: {
        type: "object",
        required: ["destinationName", "activity"],
        properties: {
          destinationId: { type: ["string", "null"], maxLength: 80 },
          destinationName: { type: "string", minLength: 1, maxLength: 160 },
          routeId: { type: ["string", "null"], maxLength: 80 },
          supportIds: { type: "array", maxItems: 20, items: { type: "string", minLength: 1, maxLength: 80 } },
          activity: { type: "string", minLength: 1, maxLength: 200 },
          startTime: { type: "string", maxLength: 20 },
          costEstimate: { type: "string", maxLength: 80 },
          notes: { type: "string", maxLength: 800 },
        },
      },
      TripPlanDay: {
        type: "object",
        required: ["day", "title", "items"],
        properties: {
          day: { type: "integer", minimum: 1, maximum: 30 },
          title: { type: "string", minLength: 1, maxLength: 160 },
          items: { type: "array", maxItems: 20, items: { $ref: "#/components/schemas/TripPlanDayItem" } },
        },
      },
      TripPlanSource: {
        type: "object",
        required: ["type", "id", "label"],
        properties: {
          type: { type: "string", enum: ["destination", "route", "support"] },
          id: { type: "string", minLength: 1, maxLength: 80 },
          label: { type: "string", minLength: 1, maxLength: 160 },
        },
      },
      TripPlanChecklistItem: {
        type: "object",
        required: ["name", "category"],
        properties: {
          id: { type: "string", minLength: 1, maxLength: 80 },
          name: { type: "string", minLength: 1, maxLength: 160 },
          category: { type: "string", enum: ["perlengkapan", "kesehatan", "konservasi", "administrasi", "biaya"] },
          isRequired: { type: "boolean", default: true },
          isCompleted: { type: "boolean" },
          isOwned: { type: "boolean" },
          estimatedCost: { type: ["integer", "null"], minimum: 0, maximum: 1000000000 },
          note: { type: "string", maxLength: 300 },
          alternativeGroup: { type: "string", maxLength: 80 },
        },
      },
      TripPlan: {
        type: "object",
        required: [
          "id",
          "userId",
          "clientId",
          "title",
          "startDate",
          "endDate",
          "peopleCount",
          "totalBudget",
          "originProvince",
          "note",
          "summary",
          "engine",
          "notice",
          "aiWarning",
          "destinationIds",
          "briefing",
          "days",
          "sources",
          "checklist",
          "createdAt",
          "updatedAt",
        ],
        properties: {
          id: { type: "string", format: "uuid" },
          userId: { type: "string", format: "uuid" },
          clientId: { type: ["string", "null"], maxLength: 120 },
          title: { type: "string", maxLength: 160 },
          startDate: { type: "string", format: "date", example: "2026-07-10" },
          endDate: { type: "string", format: "date", example: "2026-07-12" },
          peopleCount: { type: "integer", minimum: 1, maximum: 30 },
          totalBudget: { type: "integer", minimum: 0 },
          originProvince: { type: "string" },
          note: { type: "string" },
          summary: { type: "string" },
          engine: { type: "string", enum: ["draft", "gemini", "deterministic"] },
          notice: { type: ["string", "null"] },
          aiWarning: { type: ["string", "null"] },
          destinationIds: { type: "array", items: { type: "string" } },
          briefing: { $ref: "#/components/schemas/TripPlanBriefing" },
          days: { type: "array", items: { $ref: "#/components/schemas/TripPlanDay" } },
          sources: { type: "array", items: { $ref: "#/components/schemas/TripPlanSource" } },
          checklist: { type: "array", items: { $ref: "#/components/schemas/TripPlanChecklistItem" } },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CreateTripPlanRequest: {
        type: "object",
        required: ["title", "startDate", "endDate"],
        properties: {
          clientId: { type: "string", minLength: 1, maxLength: 120 },
          title: { type: "string", minLength: 1, maxLength: 160 },
          startDate: { type: "string", format: "date", example: "2026-07-10" },
          endDate: { type: "string", format: "date", example: "2026-07-12" },
          peopleCount: { type: "integer", minimum: 1, maximum: 30, default: 1 },
          totalBudget: { type: "integer", minimum: 0, maximum: 1000000000, default: 0 },
          originProvince: { type: "string", maxLength: 100, default: "" },
          note: { type: "string", maxLength: 1000, default: "" },
          summary: { type: "string", maxLength: 2000, default: "" },
          engine: {
            type: "string",
            enum: ["draft", "gemini", "deterministic"],
            default: "draft",
          },
          notice: { type: ["string", "null"], maxLength: 600 },
          aiWarning: { type: ["string", "null"], maxLength: 600 },
          destinationIds: {
            type: "array",
            maxItems: 20,
            items: { type: "string", minLength: 1, maxLength: 80 },
            default: [],
          },
          briefing: { $ref: "#/components/schemas/TripPlanBriefing" },
          days: { type: "array", maxItems: 30, items: { $ref: "#/components/schemas/TripPlanDay" }, default: [] },
          sources: { type: "array", maxItems: 50, items: { $ref: "#/components/schemas/TripPlanSource" }, default: [] },
          checklist: { type: "array", maxItems: 100, items: { $ref: "#/components/schemas/TripPlanChecklistItem" }, default: [] },
        },
      },
      UpdateTripPlanRequest: {
        type: "object",
        minProperties: 1,
        anyOf: [
          { required: ["title"] },
          { required: ["startDate"] },
          { required: ["endDate"] },
          { required: ["peopleCount"] },
          { required: ["totalBudget"] },
          { required: ["originProvince"] },
          { required: ["note"] },
          { required: ["summary"] },
          { required: ["engine"] },
          { required: ["notice"] },
          { required: ["aiWarning"] },
          { required: ["destinationIds"] },
          { required: ["briefing"] },
          { required: ["days"] },
          { required: ["sources"] },
          { required: ["checklist"] },
        ],
        properties: {
          title: { type: "string", minLength: 1, maxLength: 160 },
          startDate: { type: "string", format: "date", example: "2026-07-10" },
          endDate: { type: "string", format: "date", example: "2026-07-12" },
          peopleCount: { type: "integer", minimum: 1, maximum: 30 },
          totalBudget: { type: "integer", minimum: 0, maximum: 1000000000 },
          originProvince: { type: "string", maxLength: 100 },
          note: { type: "string", maxLength: 1000 },
          summary: { type: "string", maxLength: 2000 },
          engine: { type: "string", enum: ["draft", "gemini", "deterministic"] },
          notice: { type: ["string", "null"], maxLength: 600 },
          aiWarning: { type: ["string", "null"], maxLength: 600 },
          destinationIds: {
            type: "array",
            maxItems: 20,
            items: { type: "string", minLength: 1, maxLength: 80 },
          },
          briefing: { $ref: "#/components/schemas/TripPlanBriefing" },
          days: { type: "array", maxItems: 30, items: { $ref: "#/components/schemas/TripPlanDay" } },
          sources: { type: "array", maxItems: 50, items: { $ref: "#/components/schemas/TripPlanSource" } },
          checklist: { type: "array", maxItems: 100, items: { $ref: "#/components/schemas/TripPlanChecklistItem" } },
        },
      },
      TripPlanResponse: {
        type: "object",
        required: ["success", "data"],
        properties: {
          success: { type: "boolean", enum: [true] },
          data: { $ref: "#/components/schemas/TripPlan" },
        },
      },
      TripPlanListResponse: {
        type: "object",
        required: ["success", "data"],
        properties: {
          success: { type: "boolean", enum: [true] },
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/TripPlan" },
          },
        },
      },
    },
  },
  paths: {
    "/api/supports/{id}": {
      "get": {
        "tags": ["Supports"],
        "summary": "Get travel support (public)",
        "description": "Only supports joined to a published destination, even with an admin token. relatedDestinationName comes from that join. Anonymous access allowed; supplied invalid credentials return 401.",
        "security": [],
        "parameters": [{"name": "id", "in": "path", "required": true, "schema": {"type": "string", "format": "uuid"}}],
        "responses": {
          "200": {
            "description": "Success envelope",
            "content": {
              "application/json": {
                "schema": {"$ref": "#/components/schemas/SupportResponse"}
              }
            }
          },
          "400": {
            "description": "BAD_REQUEST: invalid UUID",
            "content": {
              "application/json": {
                "schema": {"$ref": "#/components/schemas/ApiError"}
              }
            }
          },
          "404": {
            "description": "NOT_FOUND: missing entity or parent destination not published",
            "content": {
              "application/json": {
                "schema": {"$ref": "#/components/schemas/ApiError"}
              }
            }
          },
          "401": {
            "description": "UNAUTHORIZED: supplied Authorization header is invalid",
            "content": {
              "application/json": {
                "schema": {"$ref": "#/components/schemas/ApiError"}
              }
            }
          }
        }
      }
    },
    "/api/destinations/{id}/supports": {
      "get": {
        "tags": ["Supports"],
        "summary": "List destination supports (public)",
        "description": "Published destinations only, even with an admin token. Stable category/name/id ascending order. Empty published destination returns [] and meta; missing/draft/archived destination returns 404. Only page and limit are supported.",
        "security": [],
        "parameters": [{"name": "id", "in": "path", "required": true, "schema": {"type": "string", "format": "uuid"}}, {"name": "page", "in": "query", "schema": {"type": "integer", "minimum": 1, "default": 1}}, {"name": "limit", "in": "query", "schema": {"type": "integer", "minimum": 1, "default": 20, "maximum": 100}}],
        "responses": {
          "200": {
            "description": "Success envelope",
            "content": {
              "application/json": {
                "schema": {"$ref": "#/components/schemas/PagedSupports"}
              }
            }
          },
          "400": {
            "description": "BAD_REQUEST: invalid UUID",
            "content": {
              "application/json": {
                "schema": {"$ref": "#/components/schemas/ApiError"}
              }
            }
          },
          "404": {
            "description": "NOT_FOUND: missing entity or parent destination not published",
            "content": {
              "application/json": {
                "schema": {"$ref": "#/components/schemas/ApiError"}
              }
            }
          },
          "401": {
            "description": "UNAUTHORIZED: supplied Authorization header is invalid",
            "content": {
              "application/json": {
                "schema": {"$ref": "#/components/schemas/ApiError"}
              }
            }
          },
          "422": {
            "description": "VALIDATION_ERROR: invalid page or limit",
            "content": {
              "application/json": {
                "schema": {"$ref": "#/components/schemas/ApiError"}
              }
            }
          }
        }
      }
    },
    "/api/public/destinations/{destinationId}/route-graph": {
      "get": {
        "tags": ["Routes"],
        "summary": "Get full destination route graph (public)",
        "description": "Strict published destination gate, regardless of supplied credentials. Includes all nodes, segments and trails with full ordered geometry; route/segment status is descriptive, not a publication filter. No authentication middleware.",
        "security": [],
        "parameters": [{"name": "destinationId", "in": "path", "required": true, "schema": {"type": "string", "format": "uuid"}}],
        "responses": {
          "200": {
            "description": "Success envelope",
            "content": {
              "application/json": {
                "schema": {"$ref": "#/components/schemas/PublicRouteGraphResponse"}
              }
            }
          },
          "422": {
            "description": "VALIDATION_ERROR: invalid UUID",
            "content": {
              "application/json": {
                "schema": {"$ref": "#/components/schemas/ApiError"}
              }
            }
          },
          "404": {
            "description": "NOT_FOUND: missing entity or parent destination not published",
            "content": {
              "application/json": {
                "schema": {"$ref": "#/components/schemas/ApiError"}
              }
            }
          }
        }
      }
    },
    "/api/public/routes/{id}/profile": {
      "get": {
        "tags": ["Routes"],
        "summary": "Get trail elevation profile (public)",
        "description": "Strict published parent destination gate. Route status is descriptive, not a publication filter. Public elevation flags/nulls distinguish unknown from zero. No authentication middleware.",
        "security": [],
        "parameters": [{"name": "id", "in": "path", "required": true, "schema": {"type": "string", "format": "uuid"}}],
        "responses": {
          "200": {
            "description": "Success envelope",
            "content": {
              "application/json": {
                "schema": {"$ref": "#/components/schemas/PublicRouteProfileResponse"}
              }
            }
          },
          "422": {
            "description": "VALIDATION_ERROR: invalid UUID",
            "content": {
              "application/json": {
                "schema": {"$ref": "#/components/schemas/ApiError"}
              }
            }
          },
          "404": {
            "description": "NOT_FOUND: missing entity or parent destination not published",
            "content": {
              "application/json": {
                "schema": {"$ref": "#/components/schemas/ApiError"}
              }
            }
          }
        }
      }
    },

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
    "/api/contents": {
      get: {
        tags: ["Contents"],
        summary: "List published articles (public)",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20, maximum: 100 } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "kind", in: "query", schema: { type: "string", enum: ["artikel", "panduan", "tips"] } },
        ],
        responses: {
          "200": {
            description: "Paginated published articles",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PagedContents" },
              },
            },
          },
        },
      },
    },
    "/api/contents/{slug}": {
      parameters: [
        { name: "slug", in: "path", required: true, schema: { type: "string" } },
      ],
      get: {
        tags: ["Contents"],
        summary: "Get a published article by slug (public, increments views)",
        responses: {
          "200": { description: "Article" },
          "404": { description: "Not found or not published" },
        },
      },
    },
    "/api/admin/contents": {
      get: {
        tags: ["Contents"],
        summary: "List all content for the admin table",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20, maximum: 100 } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "kind", in: "query", schema: { type: "string", enum: ["artikel", "panduan", "tips"] } },
          { name: "status", in: "query", schema: { type: "string", enum: ["draft", "pending", "published"] } },
          { name: "sort", in: "query", schema: { type: "string", enum: ["createdAt", "updatedAt", "title", "publishedAt", "views"] } },
          { name: "order", in: "query", schema: { type: "string", enum: ["asc", "desc"] } },
        ],
        responses: {
          "200": {
            description: "Paginated content",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PagedContents" },
              },
            },
          },
          "401": { description: "Missing or invalid token" },
          "403": { description: "Admin role required" },
        },
      },
      post: {
        tags: ["Contents"],
        summary: "Create content (admin)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "body"],
                properties: {
                  title: { type: "string", maxLength: 180 },
                  kind: { type: "string", enum: ["artikel", "panduan", "tips"] },
                  excerpt: { type: ["string", "null"], maxLength: 400 },
                  body: { type: "string" },
                  coverUrl: { type: ["string", "null"], description: "URL from a Gallery upload" },
                  status: { type: "string", enum: ["draft", "pending", "published"] },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Content created" },
          "401": { description: "Missing or invalid token" },
          "403": { description: "Admin role required" },
          "422": { description: "Validation error" },
        },
      },
    },
    "/api/admin/contents/{id}": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
      ],
      get: {
        tags: ["Contents"],
        summary: "Get one content entry (admin)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Content" },
          "404": { description: "Not found" },
        },
      },
      patch: {
        tags: ["Contents"],
        summary: "Update content or its status (admin)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                minProperties: 1,
                properties: {
                  title: { type: "string" },
                  kind: { type: "string", enum: ["artikel", "panduan", "tips"] },
                  excerpt: { type: ["string", "null"] },
                  body: { type: "string" },
                  coverUrl: { type: ["string", "null"], description: "Replacement URL from a Gallery upload" },
                  status: { type: "string", enum: ["draft", "pending", "published"] },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Content updated" },
          "404": { description: "Not found" },
          "422": { description: "Validation error" },
        },
      },
      delete: {
        tags: ["Contents"],
        summary: "Delete content (admin)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Deleted" },
          "404": { description: "Not found" },
        },
      },
    },
    "/api/admin/gallery": {
      get: {
        tags: ["Contents"],
        summary: "List gallery photos (admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20, maximum: 100 } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "region", in: "query", description: "Region name, or 'none' for photos without a region", schema: { type: "string" } },
          { name: "sort", in: "query", schema: { type: "string", enum: ["fileName", "createdAt", "size"] } },
          { name: "order", in: "query", schema: { type: "string", enum: ["asc", "desc"] } },
        ],
        responses: {
          "200": {
            description: "Paginated gallery photos",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PagedGallery" },
              },
            },
          },
          "401": { description: "Missing or invalid token" },
          "403": { description: "Admin role required" },
        },
      },
      post: {
        tags: ["Contents"],
        summary: "Register an uploaded gallery photo (admin)",
        description:
          "Upload the file first with POST /api/uploads?folder=gallery. The server derives the URL and metadata from the key. Retrying the same key returns the registered photo.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["key", "name", "mime", "size"],
                properties: {
                  url: { type: "string", format: "uri" },
                  key: { type: "string", description: "Must start with gallery/" },
                  name: { type: "string" },
                  mime: { type: "string" },
                  size: { type: "integer" },
                  region: { type: ["string", "null"] },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Photo registered or already registered for this key" },
          "422": { description: "Validation error" },
        },
      },
    },
    "/api/admin/gallery/{id}": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
      ],
      patch: {
        tags: ["Contents"],
        summary: "Rename a photo or set its region (admin)",
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
                  region: { type: ["string", "null"] },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Photo updated" },
          "404": { description: "Not found" },
        },
      },
      delete: {
        tags: ["Contents"],
        summary: "Delete a photo and its stored file (admin)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Deleted or already absent" },
          "409": { description: "Photo is still used as an article cover" },
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
                  location: { type: "object" },
                  access: { type: "object" },
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
    "/api/destinations/{destinationId}/route-graph": {
      get: {
        tags: ["Routes"],
        summary: "Track nodes, segments and routes of a destination (admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "destinationId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          "200": { description: "Route graph" },
          "404": { description: "Destination not found" },
        },
      },
    },
    "/api/destinations/{destinationId}/track-nodes": {
      get: {
        tags: ["Routes"],
        summary: "List track nodes (admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "destinationId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: { "200": { description: "Track nodes" } },
      },
      post: {
        tags: ["Routes"],
        summary: "Create a track node (admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "destinationId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "type", "latitude", "longitude", "elevationMeters"],
                properties: {
                  name: { type: "string" },
                  type: { type: "string", enum: ["basecamp", "gerbang", "parkir", "pos", "sumber-air", "viewpoint", "puncak", "persimpangan", "area-camp"] },
                  latitude: { type: "number" },
                  longitude: { type: "number" },
                  elevationMeters: { type: "integer" },
                  notes: { type: ["string", "null"] },
                },
              },
            },
          },
        },
        responses: { "201": { description: "Node created" }, "422": { description: "Validation error" } },
      },
    },
    "/api/track-nodes/{id}": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
      ],
      patch: {
        tags: ["Routes"],
        summary: "Update a track node (admin)",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Node updated" }, "404": { description: "Not found" } },
      },
      delete: {
        tags: ["Routes"],
        summary: "Delete a track node (admin); 409 when still used",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Deleted" }, "409": { description: "Still used by segments or routes" } },
      },
    },
    "/api/destinations/{destinationId}/segments": {
      get: {
        tags: ["Routes"],
        summary: "List segments (admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "destinationId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: { "200": { description: "Segments" } },
      },
      post: {
        tags: ["Routes"],
        summary: "Create a segment between two nodes (admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "destinationId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: { "201": { description: "Segment created" }, "409": { description: "Duplicate pair" } },
      },
    },
    "/api/segments/{id}": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
      ],
      patch: {
        tags: ["Routes"],
        summary: "Update a segment (admin)",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Segment updated" } },
      },
      delete: {
        tags: ["Routes"],
        summary: "Delete a segment (admin); 409 when used by a route",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Deleted" }, "409": { description: "Still used by routes" } },
      },
    },
    "/api/destinations/{destinationId}/routes": {
      get: {
        tags: ["Routes"],
        summary: "List trails (admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "destinationId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: { "200": { description: "Trails" } },
      },
      post: {
        tags: ["Routes"],
        summary: "Create a trail; missing segments are created automatically (admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "destinationId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: { "201": { description: "Trail created" } },
      },
    },
    "/api/routes/{id}": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
      ],
      get: {
        tags: ["Routes"],
        summary: "Get a trail (admin)",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Trail" }, "404": { description: "Not found" } },
      },
      patch: {
        tags: ["Routes"],
        summary: "Update a trail (admin)",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Trail updated" } },
      },
      delete: {
        tags: ["Routes"],
        summary: "Delete a trail (admin)",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Deleted" } },
      },
    },
    "/api/routes/{id}/profile": {
      get: {
        tags: ["Routes"],
        summary: "Elevation profile and statistics of a trail (admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: { "200": { description: "Route profile" }, "404": { description: "Not found" } },
      },
    },
    "/api/ai/options": {
      get: {
        tags: ["AI"],
        summary: "Preference options derived from the published catalog",
        description: "Returns provinces, activity/terrain categories and duration choices that exist in the catalog.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Regions, activities, terrains and durations" },
          "401": { description: "Missing token" },
        },
      },
    },
    "/api/ai/itineraries": {
      post: {
        tags: ["AI"],
        summary: "Generate a grounded itinerary (authenticated)",
        description: "Retrieves published destinations, supports and routes, then asks Gemini to compose the itinerary. Falls back to a deterministic builder when the provider is unavailable.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  destinationIds: {
                    type: "array",
                    items: { type: "string" },
                    maxItems: 7,
                  },
                  originProvince: { type: "string", maxLength: 80 },
                  rawText: { type: "string", maxLength: 1000 },
                  regions: { type: "array", items: { type: "string" } },
                  activities: { type: "array", items: { type: "string" } },
                  terrains: { type: "array", items: { type: "string" } },
                  difficulty: { type: "string", enum: ["ramah-pemula", "menengah", "sulit"] },
                  durationDays: { type: "integer", minimum: 1, maximum: 7 },
                  budgetPerPerson: { type: "integer", minimum: 0 },
                  needsAccommodation: { type: "boolean" },
                  needsTransport: { type: "boolean" },
                  peopleCount: { type: "integer", minimum: 1, maximum: 30 },
                  startDate: { type: "string", format: "date" },
                  planTitle: { type: "string", maxLength: 120 },
                  note: { type: "string", maxLength: 500 },
                  refresh: { type: "boolean" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Itinerary, briefing, checklist (with per-person estimated costs), sources, card recommendations and optional not-found notice" },
          "401": { description: "Missing token" },
          "429": { description: "Daily AI quota exceeded" },
          "422": { description: "Validation error" },
        },
      },
    },
    "/api/plans": {
      get: {
        tags: ["Plans"],
        summary: "List signed-in user's saved trip plans",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Saved trip plans",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TripPlanListResponse" },
              },
            },
          },
          "401": { description: "Missing token" },
        },
      },
      post: {
        tags: ["Plans"],
        summary: "Create a saved trip plan for the signed-in user",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateTripPlanRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Idempotent replay for an existing clientId",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TripPlanResponse" },
              },
            },
          },
          "201": {
            description: "Trip plan created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TripPlanResponse" },
              },
            },
          },
          "401": { description: "Missing token" },
          "409": { description: "Plan clientId already deleted (tombstone)" },
          "422": { description: "Validation error" },
        },
      },
    },
    "/api/plans/client/{clientId}": {
      delete: {
        tags: ["Plans"],
        summary: "Tombstone a clientId and delete any matching trip plan owned by the signed-in user",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "clientId", in: "path", required: true, schema: { type: "string", minLength: 1, maxLength: 120 } },
        ],
        responses: {
          "200": { description: "Client ID tombstoned and matching plan deleted" },
          "401": { description: "Missing token" },
          "422": { description: "Validation error" },
        },
      },
    },
    "/api/plans/{id}": {
      get: {
        tags: ["Plans"],
        summary: "Get one saved trip plan owned by the signed-in user",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          "200": {
            description: "Trip plan detail",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TripPlanResponse" },
              },
            },
          },
          "401": { description: "Missing token" },
          "404": { description: "Trip plan not found" },
          "422": { description: "Invalid UUID" },
        },
      },
      patch: {
        tags: ["Plans"],
        summary: "Update a saved trip plan owned by the signed-in user",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateTripPlanRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Trip plan updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TripPlanResponse" },
              },
            },
          },
          "401": { description: "Missing token" },
          "404": { description: "Trip plan not found" },
          "422": { description: "Validation error" },
        },
      },
      delete: {
        tags: ["Plans"],
        summary: "Delete a saved trip plan owned by the signed-in user",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          "200": { description: "Trip plan deleted" },
          "401": { description: "Missing token" },
          "404": { description: "Trip plan not found" },
          "422": { description: "Invalid UUID" },
        },
      },
    },
  },
} as const;

Object.assign(
  openApiDocument.paths as unknown as Record<string, unknown>,
  facilityPaths,
);
Object.assign(
  openApiDocument.components.schemas as unknown as Record<string, unknown>,
  facilitySchemas,
);
(openApiDocument.tags as unknown as Array<{ name: string; description: string }>).push(
  facilityTag,
);
