import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import {
  getSeedData,
  seedDestinations,
  seedTravelSupports,
} from "@dolenae/seed";

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: "*",
  }),
);

app.get("/", (c) =>
  c.json({
    service: "Dolenae API",
    version: "0.1.0",
    note: "Static prototype - data served from @dolenae/seed",
    endpoints: [
      "GET /health",
      "GET /destinations",
      "GET /destinations/:slug",
      "GET /supports",
      "GET /supports?destinationId=:id",
    ],
  }),
);

app.get("/health", (c) => c.json({ status: "ok" }));

app.get("/destinations", (c) => {
  const seed = getSeedData();
  const destinations = Object.values(seed.destinations);
  return c.json(destinations);
});

app.get("/destinations/:slug", (c) => {
  const slug = c.req.param("slug");
  const destination = Object.values(seedDestinations).find(
    (d) => d.slug === slug,
  );
  if (!destination) return c.json({ error: "Destination not found" }, 404);

  const supports = Object.values(seedTravelSupports).filter(
    (s) => s.destinationId === destination.id,
  );
  return c.json({ ...destination, supports });
});

app.get("/supports", (c) => {
  const destinationId = c.req.query("destinationId");
  let supports = Object.values(seedTravelSupports);
  if (destinationId) supports = supports.filter((s) => s.destinationId === destinationId);
  return c.json(supports);
});

const port = Number(process.env.PORT) || 3001;

serve({
  fetch: app.fetch,
  port,
});

console.log(`Dolenae API running at http://localhost:${port}`);