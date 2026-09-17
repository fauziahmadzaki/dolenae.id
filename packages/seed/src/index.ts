import { destinations } from "./destinations";
import { travelSupports } from "./travel-supports";

export const seedDestinations = destinations();
export const seedTravelSupports = travelSupports();

export const seedUsers = {
  wisatawanDemo: {
    id: "usr-wisatawan-demo",
    name: "Dimas",
    email: "dimas@dolenae.id",
    role: "wisatawan",
    createdAt: new Date("2026-01-05T00:00:00.000Z").toISOString(),
  },
  merchantDemo: {
    id: "usr-merchant-demo",
    name: "Budi",
    email: "budi@bromojeeptour.id",
    role: "merchant",
    businessName: "Bromo Jeep Tour",
    description: "Penyedia sewa jeep dan open trip Bromo",
    createdAt: new Date("2026-01-06T00:00:00.000Z").toISOString(),
  },
  adminDemo: {
    id: "usr-admin-demo",
    name: "Admin Dolenae",
    email: "admin@dolenae.id",
    role: "admin",
    createdAt: new Date("2026-01-01T00:00:00.000Z").toISOString(),
  },
} as const;

export type SeedData = {
  destinations: typeof seedDestinations;
  travelSupports: typeof seedTravelSupports;
  users: typeof seedUsers;
};

export function getSeedData(): SeedData {
  return {
    destinations: seedDestinations,
    travelSupports: seedTravelSupports,
    users: seedUsers,
  };
}