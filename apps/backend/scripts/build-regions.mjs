// Generates the region fixtures used by /api/regions from the `geografis`
// dataset (34 provinces, 514 regencies, 7.230 districts + coordinates).
//
// Usage (from apps/backend):
//   node scripts/build-regions.mjs
//
// The generated JSON is committed, so the API has no runtime dependency on the
// dataset package.
import { createRequire } from "node:module";
import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, "../src/data/regions");

function geografisDir() {
  try {
    const require = createRequire(import.meta.url);
    return dirname(require.resolve("geografis/package.json"));
  } catch {
    // Fallback used while the dataset lives in packages/regions/node_modules.
    return resolve(here, "../../../packages/regions/node_modules/geografis");
  }
}

const source = geografisDir();
const collection = JSON.parse(
  readFileSync(join(source, "data/json/collection.json"), "utf8"),
);
const villages = JSON.parse(
  readFileSync(join(source, "data/json/data.json"), "utf8"),
);

const provinces = [];
const regencies = [];
const districts = [];

for (const province of collection) {
  provinces.push({ code: province.code, name: province.province });

  for (const city of province.cities ?? []) {
    regencies.push({
      code: city.code,
      name: city.city,
      provinceCode: province.code,
    });

    for (const district of city.districts ?? []) {
      districts.push({
        code: district.code,
        name: district.district,
        regencyCode: city.code,
        provinceCode: province.code,
      });
    }
  }
}

// Average the village coordinates per district to get a usable centroid,
// and build a compact adm4 village lookup grouped by 8-char adm3 code.
const ADM4_RE = /^\d{2}\.\d{2}\.\d{2}\.\d{4}$/;
const sums = new Map();
const villagesByDistrict = {};
let villageCount = 0;

for (const village of villages) {
  const code = String(village.code ?? "").trim();
  const latRaw = String(village.latitude ?? "").trim();
  const lngRaw = String(village.longitude ?? "").trim();
  if (!ADM4_RE.test(code) || !latRaw || !lngRaw) {
    continue;
  }
  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    continue;
  }

  const adm3 = code.slice(0, 8);
  const suffix = code.slice(9, 13);
  const entry = sums.get(adm3) ?? { lat: 0, lng: 0, count: 0 };
  entry.lat += lat;
  entry.lng += lng;
  entry.count += 1;
  sums.set(adm3, entry);

  (villagesByDistrict[adm3] ??= []).push([
    suffix,
    Number(lat.toFixed(4)),
    Number(lng.toFixed(4)),
  ]);
  villageCount += 1;
}

const centroids = [];
for (const district of districts) {
  const entry = sums.get(district.code);
  if (!entry || entry.count === 0) continue;
  centroids.push({
    code: district.code,
    lat: Number((entry.lat / entry.count).toFixed(5)),
    lng: Number((entry.lng / entry.count).toFixed(5)),
  });
}

mkdirSync(outDir, { recursive: true });
const files = {
  "provinces.json": provinces,
  "regencies.json": regencies,
  "districts.json": districts,
  "district-centroids.json": centroids,
};

for (const [file, data] of Object.entries(files)) {
  const target = join(outDir, file);
  writeFileSync(target, JSON.stringify(data));
  const { size } = statSync(target);
  console.log(`${file}: ${data.length} entri, ${(size / 1024).toFixed(1)} KB`);
}

const villagesTarget = join(outDir, "villages.json.gz");
writeFileSync(villagesTarget, gzipSync(JSON.stringify(villagesByDistrict)));
const { size: villagesSize } = statSync(villagesTarget);
console.log(
  `villages.json.gz: ${villageCount} desa, ${(villagesSize / 1024).toFixed(1)} KB`,
);

console.log(
  `Selesai: ${provinces.length} provinsi, ${regencies.length} kabupaten/kota, ${districts.length} kecamatan, ${centroids.length} centroid, ${villageCount} desa.`,
);
