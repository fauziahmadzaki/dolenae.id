export interface Coordinate {
  latitude: number;
  longitude: number;
}

const EARTH_RADIUS_KM = 6371;
const rad = (value: number) => (value * Math.PI) / 180;

/** Great-circle distance between two coordinates, rounded to 2 decimals. */
export function haversineKm(from: Coordinate, to: Coordinate): number {
  const dLat = rad(to.latitude - from.latitude);
  const dLng = rad(to.longitude - from.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(from.latitude)) *
      Math.cos(rad(to.latitude)) *
      Math.sin(dLng / 2) ** 2;
  const distance =
    EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Number(distance.toFixed(2));
}

/** Total positive/negative elevation change between consecutive points. */
export function elevationGainLoss(elevations: number[]): {
  gain: number;
  loss: number;
} {
  let gain = 0;
  let loss = 0;

  for (let index = 1; index < elevations.length; index += 1) {
    const delta = (elevations[index] ?? 0) - (elevations[index - 1] ?? 0);
    if (delta > 0) gain += delta;
    else loss += Math.abs(delta);
  }

  return { gain, loss };
}

/** Average segment grade in percent (|Δelevation| / distance). */
export function gradePercent(
  elevationDeltaMeters: number,
  distanceKm: number,
): number {
  if (distanceKm <= 0) return 0;
  return Number(
    ((Math.abs(elevationDeltaMeters) / (distanceKm * 1000)) * 100).toFixed(1),
  );
}

/** Naismith's rule: 5 km/h plus 1 hour per 600 m of ascent. */
export function naismithMinutes(
  distanceKm: number,
  gainMeters: number,
): number {
  const hours = distanceKm / 5 + gainMeters / 600;
  return Math.round(hours * 60);
}

/** Map the effort of a route to the destination difficulty scale. */
export function difficultyFromEffort(
  distanceKm: number,
  gainMeters: number,
  steepestGrade: number,
): "ramah-pemula" | "menengah" | "sulit" {
  if (distanceKm >= 12 || gainMeters >= 900 || steepestGrade >= 45) {
    return "sulit";
  }
  if (distanceKm >= 5 || gainMeters >= 350 || steepestGrade >= 25) {
    return "menengah";
  }
  return "ramah-pemula";
}
