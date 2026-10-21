import type { RouteProfile } from "../schema";

const WIDTH = 720;
const HEIGHT = 220;
const PAD = { top: 18, right: 18, bottom: 28, left: 44 };

export function ElevationChart({ profile }: { profile: RouteProfile }) {
  const points = profile.points;

  if (points.length < 2) {
    return (
      <p className="rounded-lg bg-canvas-subtle p-4 text-sm text-body">
        Profil elevasi muncul setelah jalur punya minimal dua titik.
      </p>
    );
  }

  const maxDistance = Math.max(profile.totalDistanceKm, 0.1);
  const minElevation = profile.minElevationMeters;
  const maxElevation = profile.maxElevationMeters;
  const span = Math.max(maxElevation - minElevation, 50);

  const chartW = WIDTH - PAD.left - PAD.right;
  const chartH = HEIGHT - PAD.top - PAD.bottom;

  const x = (distanceKm: number) =>
    PAD.left + (distanceKm / maxDistance) * chartW;
  const y = (elevation: number) =>
    PAD.top + (1 - (elevation - minElevation) / span) * chartH;

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${x(point.distanceKm)} ${y(point.elevationMeters)}`)
    .join(" ");

  const areaPath = `${linePath} L ${x(maxDistance)} ${PAD.top + chartH} L ${PAD.left} ${PAD.top + chartH} Z`;

  const gridValues = [0, 0.25, 0.5, 0.75, 1].map(
    (ratio) => minElevation + ratio * span,
  );

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label="Profil elevasi jalur"
      className="w-full"
    >
      {gridValues.map((value) => (
        <g key={value}>
          <line
            x1={PAD.left}
            x2={WIDTH - PAD.right}
            y1={y(value)}
            y2={y(value)}
            stroke="#e3e0d6"
            strokeWidth={1}
          />
          <text
            x={PAD.left - 8}
            y={y(value) + 3}
            textAnchor="end"
            fontSize={10}
            fill="#6b7280"
          >
            {Math.round(value)}
          </text>
        </g>
      ))}

      <path d={areaPath} fill="#1e3b2e14" />
      <path
        d={linePath}
        fill="none"
        stroke="#1e3b2e"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />

      {points.map((point) => (
        <g key={`${point.nodeId}-${point.distanceKm}`}>
          <circle
            cx={x(point.distanceKm)}
            cy={y(point.elevationMeters)}
            r={4}
            fill="#fff"
            stroke="#1e3b2e"
            strokeWidth={2}
          />
          <text
            x={x(point.distanceKm)}
            y={y(point.elevationMeters) - 9}
            textAnchor="middle"
            fontSize={10}
            fontWeight={600}
            fill="#1e3b2e"
          >
            {point.name}
          </text>
        </g>
      ))}

      <text
        x={WIDTH - PAD.right}
        y={HEIGHT - 6}
        textAnchor="end"
        fontSize={10}
        fill="#6b7280"
      >
        {maxDistance.toFixed(2)} km
      </text>
      <text x={PAD.left} y={HEIGHT - 6} fontSize={10} fill="#6b7280">
        0 km
      </text>
    </svg>
  );
}
