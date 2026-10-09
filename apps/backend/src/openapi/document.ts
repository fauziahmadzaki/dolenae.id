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
  },
} as const;
