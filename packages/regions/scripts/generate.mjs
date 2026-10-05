/**
 * Generator dataset wilayah ringkas dari paket `geografis`.
 *
 * Sumber: 83.449 desa/kelurahan (Kepmendagri via `geografis`, MIT) →
 * diringkas menjadi provinsi, kabupaten/kota, dan kecamatan (centroid + elevasi).
 *
 * Jalankan: pnpm --filter @dolenae/regions generate
 */
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const geografis = require("geografis");

const all = geografis.dump();
if (!Array.isArray(all) || all.length === 0) {
  throw new Error("Data geografis kosong / tidak dikenali");
}

const provinces = new Map();
const regencies = new Map();
const districts = new Map();

for (const v of all) {
  const province = (v.province || "").trim();
  const regency = (v.city || "").trim();
  const district = (v.district || "").trim();
  if (!province || !regency || !district) continue;

  provinces.set(province, province);
  regencies.set(`${province}|${regency}`, { name: regency, province });

  const key = `${province}|${regency}|${district}`;
  const d =
    districts.get(key) ??
    {
      name: district,
      regency,
      province,
      latSum: 0,
      lngSum: 0,
      coordN: 0,
      elevSum: 0,
      elevN: 0,
    };

  const lat = Number(v.latitude);
  const lng = Number(v.longitude);
  if (Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0)) {
    d.latSum += lat;
    d.lngSum += lng;
    d.coordN += 1;
  }
  const elev = Number(v.elevation);
  if (Number.isFinite(elev) && elev > 0) {
    d.elevSum += elev;
    d.elevN += 1;
  }
  districts.set(key, d);
}

const provinceList = [...provinces.values()]
  .sort((a, b) => a.localeCompare(b))
  .map((name) => ({ name }));

const regencyList = [...regencies.values()].sort(
  (a, b) => a.province.localeCompare(b.province) || a.name.localeCompare(b.name),
);

const districtList = [...districts.values()]
  .filter((d) => d.coordN > 0)
  .map((d) => ({
    name: d.name,
    regency: d.regency,
    province: d.province,
    lat: Number((d.latSum / d.coordN).toFixed(5)),
    lng: Number((d.lngSum / d.coordN).toFixed(5)),
    elevation: d.elevN > 0 ? Math.round(d.elevSum / d.elevN) : undefined,
  }))
  .sort(
    (a, b) =>
      a.province.localeCompare(b.province) ||
      a.regency.localeCompare(b.regency) ||
      a.name.localeCompare(b.name),
  );

const out = { provinces: provinceList, regencies: regencyList, districts: districtList };
const target = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "data.json");
writeFileSync(target, JSON.stringify(out));

console.log(
  `Regions: ${provinceList.length} provinsi, ${regencyList.length} kabupaten/kota, ${districtList.length} kecamatan (dengan koordinat).`,
);
console.log(`Tersimpan: ${target}`);
