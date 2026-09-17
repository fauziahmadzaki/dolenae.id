import { createServerFn } from "@tanstack/react-start";
import { getSeedData } from "@dolenae/seed";

export const listDestinations = createServerFn({ method: "GET" }).handler(() => {
  const seed = getSeedData();
  return Object.values(seed.destinations);
});

export const getDestinationBySlug = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(({ data: slug }) => {
    const seed = getSeedData();
    const destination = Object.values(seed.destinations).find(
      (d) => d.slug === slug,
    );
    if (!destination) return null;
    const supports = Object.values(seed.travelSupports).filter(
      (s) => s.destinationId === destination.id,
    );
    return { ...destination, supports };
  });