import { facilityRepository } from "../../repositories/FacilityRepository";
import { aiItinerarySchema } from "../../schemas/ai.schema";
import type {
  AiContext,
  AiContextDestination,
  AiContextRoute,
  AiContextSupport,
  AiPreferenceInput,
} from "../../types/ai";
import type { PublicDestination } from "../../types/destination";
import { destinationService } from "../DestinationService";
import { routeService } from "../RouteService";

type DroppedFilter =
  | "activities"
  | "terrains"
  | "budget"
  | "regions"
  | "difficulty";

type DestinationCostInfo = {
  minFood: number | null;
  minTransport: number | null;
  minStay: number | null;
  dayCost: number;
  fullStayCost: number;
  hasDayPricingData: boolean;
  hasPricingData: boolean;
};

class AiRetrievalService {
  private static readonly FILTER_LABEL: Record<DroppedFilter, string> = {
    activities: "aktivitas",
    terrains: "medan",
    budget: "budget",
    regions: "wilayah",
    difficulty: "tingkat kesulitan",
  };

  /** Filler/intent words that should not trigger a "not found" notice. */
  private static readonly QUERY_STOPWORDS = new Set([
    "acak",
    "ada",
    "adalah",
    "adem",
    "adventure",
    "agak",
    "agar",
    "agustus",
    "aja",
    "akan",
    "akhir",
    "akses",
    "aksesnya",
    "aku",
    "alam",
    "alami",
    "alamnya",
    "aman",
    "ambil",
    "anda",
    "antara",
    "apa",
    "apakah",
    "apapun",
    "april",
    "arah",
    "arahnya",
    "area",
    "asik",
    "asri",
    "asyik",
    "atau",
    "awal",
    "awan",
    "ayo",
    "backpacking",
    "bagaimana",
    "bagus",
    "bagusnya",
    "baik",
    "baiknya",
    "bajet",
    "bajetnya",
    "balik",
    "banget",
    "bantu",
    "bantuin",
    "banyak",
    "barat",
    "bareng",
    "barengan",
    "baru",
    "batas",
    "bawa",
    "bebas",
    "begini",
    "begitu",
    "belum",
    "berangkat",
    "berat",
    "berdua",
    "berempat",
    "berikan",
    "berkemah",
    "berlima",
    "bersama",
    "bertiga",
    "besok",
    "biasa",
    "biaya",
    "biayanya",
    "bikin",
    "bikinin",
    "bikinkan",
    "bila",
    "bingung",
    "bintang",
    "bisa",
    "boleh",
    "booking",
    "bosan",
    "bosen",
    "buat",
    "buatkan",
    "buatin",
    "budget",
    "budgetnya",
    "bukan",
    "bulan",
    "butuh",
    "camping",
    "cantik",
    "capek",
    "cari",
    "carikan",
    "cariin",
    "carter",
    "cepat",
    "chill",
    "coba",
    "cobain",
    "cocok",
    "cocoknya",
    "cukup",
    "cuma",
    "cuman",
    "cuti",
    "dadakan",
    "daerah",
    "daerahnya",
    "damai",
    "dana",
    "dananya",
    "dapat",
    "dari",
    "darimana",
    "darisana",
    "darisini",
    "datang",
    "deh",
    "dekat",
    "dengan",
    "depan",
    "desember",
    "destinasi",
    "di",
    "diatas",
    "dibawah",
    "dimana",
    "dimanapun",
    "dingin",
    "disana",
    "disini",
    "disitu",
    "dolan",
    "dong",
    "dua",
    "ekonomis",
    "eksplor",
    "ekstrem",
    "empat",
    "enak",
    "enaknya",
    "enam",
    "engga",
    "enggak",
    "estimasi",
    "explore",
    "favorit",
    "februari",
    "fleksibel",
    "foto",
    "fotografi",
    "gampang",
    "gimana",
    "gini",
    "gitu",
    "gratis",
    "grup",
    "gunakan",
    "hanya",
    "harga",
    "harganya",
    "hari",
    "harus",
    "healing",
    "hemat",
    "hendak",
    "hening",
    "hijau",
    "hiking",
    "hingga",
    "hits",
    "homestay",
    "hotel",
    "ikonik",
    "ikut",
    "indah",
    "indonesia",
    "ingin",
    "irit",
    "istri",
    "itinerary",
    "itu",
    "jalan",
    "jalur",
    "jalurnya",
    "jangan",
    "januari",
    "jauh",
    "jeep",
    "jelajah",
    "jika",
    "juga",
    "juli",
    "jumat",
    "juni",
    "juta",
    "jutaan",
    "kabupaten",
    "kabut",
    "kah",
    "kalau",
    "kalo",
    "kami",
    "kamis",
    "kamu",
    "kantong",
    "kapan",
    "kasih",
    "kawan",
    "kawasan",
    "kayak",
    "ke",
    "keliling",
    "keluarga",
    "kemah",
    "kemana",
    "kemanapun",
    "kepengen",
    "kepingin",
    "keren",
    "kesana",
    "kesini",
    "kesitu",
    "kira",
    "kirakira",
    "kisaran",
    "kita",
    "kok",
    "kondisi",
    "kota",
    "kotanya",
    "kunjung",
    "kunjungi",
    "kurang",
    "lagi",
    "lah",
    "lain",
    "lainnya",
    "lama",
    "langit",
    "lebih",
    "legendaris",
    "lelah",
    "lewat",
    "libur",
    "liburan",
    "liburannya",
    "lihat",
    "liatin",
    "lima",
    "lokasi",
    "lokasinya",
    "low",
    "lumayan",
    "lusa",
    "mahal",
    "mahasiswa",
    "main",
    "makan",
    "makanan",
    "maksimal",
    "malam",
    "mampir",
    "mana",
    "manapun",
    "maret",
    "mari",
    "masih",
    "mau",
    "mei",
    "melalui",
    "memakai",
    "membawa",
    "memesan",
    "mempunyai",
    "menantang",
    "mendaki",
    "mendapat",
    "mending",
    "mendingan",
    "menengah",
    "mengambil",
    "menggunakan",
    "mengikuti",
    "menginap",
    "menuju",
    "menyewa",
    "mewah",
    "minggu",
    "minim",
    "minimal",
    "minta",
    "mirip",
    "modal",
    "moderat",
    "mohon",
    "mudah",
    "murah",
    "murmer",
    "naik",
    "nanti",
    "nature",
    "ngga",
    "nggak",
    "nginap",
    "nih",
    "nikmati",
    "normal",
    "november",
    "nusantara",
    "nyaman",
    "nyantai",
    "ojek",
    "oktober",
    "ongkos",
    "ongkosnya",
    "open",
    "orang",
    "orangtua",
    "ortu",
    "outdoor",
    "pacar",
    "pagi",
    "pakai",
    "pake",
    "paket",
    "paling",
    "panjang",
    "pas",
    "pasangan",
    "pasan",
    "pekan",
    "pelajar",
    "pemandangan",
    "pemula",
    "penat",
    "pendaki",
    "pendakian",
    "pengen",
    "pengin",
    "penginapan",
    "pergi",
    "perjalanan",
    "perlu",
    "pertengahan",
    "pesan",
    "petualangan",
    "pewe",
    "pilih",
    "pilihan",
    "pilihannya",
    "pilihkan",
    "pilihin",
    "pingin",
    "please",
    "populer",
    "provinsi",
    "pulang",
    "puncak",
    "punya",
    "rabu",
    "ramah",
    "ramai",
    "rame",
    "ramean",
    "random",
    "recommended",
    "refreshing",
    "rekom",
    "rekomen",
    "rekomendasi",
    "rekomendasikan",
    "rekomennya",
    "relax",
    "rencana",
    "rencanakan",
    "rencananya",
    "ribu",
    "ribuan",
    "rindang",
    "ringan",
    "romantis",
    "rombongan",
    "rupiah",
    "rute",
    "rutenya",
    "sabtu",
    "sahabat",
    "saja",
    "salah",
    "sama",
    "sampai",
    "sana",
    "sangat",
    "santai",
    "santuy",
    "saran",
    "sarankan",
    "sarannya",
    "satu",
    "saya",
    "sebaiknya",
    "sebelah",
    "sebentar",
    "sebuah",
    "sedang",
    "segar",
    "sehari",
    "sejuk",
    "sekali",
    "sekitar",
    "selama",
    "selasa",
    "selatan",
    "semacam",
    "semalam",
    "sendiri",
    "sendirian",
    "senin",
    "senja",
    "sepi",
    "september",
    "seperti",
    "seputar",
    "seru",
    "serunya",
    "setiap",
    "sewa",
    "siang",
    "siapa",
    "sih",
    "singkat",
    "sini",
    "situ",
    "solo",
    "sore",
    "spontan",
    "spot",
    "standar",
    "stres",
    "stress",
    "suami",
    "suasana",
    "suatu",
    "subuh",
    "sudah",
    "sulit",
    "suntuk",
    "sunyi",
    "susun",
    "susunkan",
    "tahun",
    "tampilkan",
    "tanggal",
    "tanpa",
    "tapi",
    "tarif",
    "tarifnya",
    "teduh",
    "tektok",
    "telah",
    "teman",
    "temen",
    "tempat",
    "tempatnya",
    "tenang",
    "tengah",
    "tentang",
    "terbaik",
    "terbatas",
    "terdekat",
    "terjangkau",
    "terkenal",
    "terlalu",
    "terserah",
    "tgl",
    "thn",
    "tiap",
    "tidak",
    "tiga",
    "tiket",
    "tiketnya",
    "timur",
    "tipis",
    "tolong",
    "tour",
    "transport",
    "transportasi",
    "travel",
    "traveling",
    "trekking",
    "trip",
    "tripnya",
    "tuh",
    "tujuan",
    "tujuannya",
    "tujuh",
    "tunjukkan",
    "turun",
    "uang",
    "uangnya",
    "udara",
    "untuk",
    "utara",
    "vibes",
    "view",
    "villa",
    "viral",
    "wajib",
    "weekend",
    "wilayah",
    "wilayahnya",
    "wisata",
    "wisatawan",
    "worth",
    "yah",
    "yang",
    "yuk",
  ]);

  private static readonly TERRAIN_SYNONYMS: Array<[RegExp, string]> = [
    [/\b(gunung|pegunungan)\b/i, "Gunung"],
    [/\b(bukit|perbukitan)\b/i, "Bukit"],
    [/\b(danau|ranu|telaga)\b/i, "Danau"],
    [/\b(air\s+terjun|curug)\b/i, "Air Terjun"],
    [/\b(pantai|pulau|laut)\b/i, "Pantai"],
    [/\b(hutan|rimba|goa|gua)\b/i, "Hutan"],
    [/\bsavana\b/i, "Savana"],
  ];

  private static readonly ACTIVITY_SYNONYMS: Array<[RegExp, string]> = [
    [/\b(camping|kemah|berkemah)\b/i, "Camping Ground"],
    [/\b(hiking|trekking|mendaki|pendakian)\b/i, "Hiking"],
  ];

  private static readonly REGION_SYNONYMS: Array<[RegExp, string]> = [
    [/\b(jatim|jawa\s+timur)\b/i, "Jawa Timur"],
    [/\b(jabar|jawa\s+barat)\b/i, "Jawa Barat"],
    [/\b(jateng|jawa\s+tengah)\b/i, "Jawa Tengah"],
    [/\b(jogja|yogya|diy|yogyakarta)\b/i, "Yogyakarta"],
    [/\b(ntb|lombok)\b/i, "Nusa Tenggara Barat"],
    [/\b(ntt|flores)\b/i, "Nusa Tenggara Timur"],
    [/\bsumut\b/i, "Sumatera Utara"],
    [/\b(babel|belitung)\b/i, "Bangka Belitung"],
  ];

  private async loadBalancedSupports(
    destinationId: string,
    costInfo?: DestinationCostInfo,
    skipNullCategories = false,
  ): Promise<AiContextSupport[]> {
    const facilityResult = await facilityRepository.list({
      page: 1,
      limit: 10,
      offset: 0,
      sort: "priceMin",
      order: "asc",
      destinationId,
      statuses: ["published"],
      publishedDestinationOnly: true,
    });
    const pool = [...facilityResult.items];

    if (facilityResult.items.length >= 10) {
      const presentCategories = new Set(
        facilityResult.items.map((item) => item.category),
      );
      const categoryKnownNull = (
        category: "food" | "transport" | "accommodation",
      ): boolean => {
        if (!skipNullCategories) return false;
        if (!costInfo) return true;
        if (category === "food") return costInfo.minFood === null;
        if (category === "transport") return costInfo.minTransport === null;
        return costInfo.minStay === null;
      };

      for (const category of ["food", "transport", "accommodation"] as const) {
        if (presentCategories.has(category) || categoryKnownNull(category)) {
          continue;
        }
        const extra = await facilityRepository.list({
          page: 1,
          limit: 1,
          offset: 0,
          sort: "priceMin",
          order: "asc",
          destinationId,
          category,
          statuses: ["published"],
          publishedDestinationOnly: true,
        });
        pool.push(...extra.items);
      }
    }

    const uniqueById = new Map<string, (typeof pool)[number]>();
    for (const item of pool) {
      if (!uniqueById.has(item.id)) {
        uniqueById.set(item.id, item);
      }
    }
    const sorted = [...uniqueById.values()].sort(
      (a, b) =>
        (a.priceMin ?? Number.POSITIVE_INFINITY) -
          (b.priceMin ?? Number.POSITIVE_INFINITY) ||
        a.name.localeCompare(b.name) ||
        a.id.localeCompare(b.id),
    );

    const balanced: (typeof sorted)[number][] = [];
    const pickedIds = new Set<string>();
    const seenCategories = new Set<string>();
    for (const item of sorted) {
      if (seenCategories.has(item.category)) continue;
      seenCategories.add(item.category);
      pickedIds.add(item.id);
      balanced.push(item);
      if (balanced.length >= 10) break;
    }
    for (const item of sorted) {
      if (balanced.length >= 10) break;
      if (pickedIds.has(item.id)) continue;
      pickedIds.add(item.id);
      balanced.push(item);
    }

    return balanced.map((facility) => this.mapFacilitySupport(facility));
  }

  private normalize(value: string): string {
    return value.trim().toLowerCase();
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  private normalizeCasualIndonesian(value: string): string {
    return value.replace(
      /(^|[^a-z0-9])(ke|di|dari)(gunung|pegunungan|bukit|perbukitan|pantai|pulau|laut|danau|ranu|telaga|hutan|rimba|goa|gua|savana|curug|air\s+terjun|kawah|puncak|alam|mana|manapun|sini|sana|situ|daerah|kawasan|tempat|lokasi|wilayah|kota|desa|jawa|jatim|jabar|jateng|jogja|yogya|yogyakarta|lombok|ntb|ntt|flores|sumut|babel|belitung|bali|papua|jambi|bandung|malang|garut|cianjur|wonosobo|dieng|magelang|sleman|gunungkidul|probolinggo|banyuwangi|situbondo|buleleng|badung|bantul|ende|samosir|jayapura|kerinci)\b/gi,
      "$1$2 $3",
    );
  }

  private isStopword(token: string): boolean {
    if (AiRetrievalService.QUERY_STOPWORDS.has(token)) {
      return true;
    }
    const withoutClitic = token.replace(/(?:lah|kah|nya|ku|mu)$/, "");
    const withoutSuffix = withoutClitic.replace(/(?:kan|an|in)$/, "");
    for (const candidate of [token, withoutClitic, withoutSuffix]) {
      if (
        candidate.length >= 3 &&
        AiRetrievalService.QUERY_STOPWORDS.has(candidate)
      ) {
        return true;
      }
      const withoutPrefix = candidate.replace(
        /^(?:meng|meny|mem|men|ber|ter|per|me|pe|se|di|ke)/,
        "",
      );
      if (
        withoutPrefix.length >= 3 &&
        AiRetrievalService.QUERY_STOPWORDS.has(withoutPrefix)
      ) {
        return true;
      }
    }
    return false;
  }

  private extractQueryTerms(rawText: string): string[] {
    return [
      ...new Set(
        this.normalizeCasualIndonesian(rawText)
          .toLowerCase()
          .split(/[^a-z0-9]+/)
          .filter(
            (token) =>
              token.length >= 4 &&
              !/\d/.test(token) &&
              !this.isStopword(token),
          ),
      ),
    ];
  }

  private parsePromptIntent(
    rawTextInput: string | undefined,
    noteInput: string | undefined,
    all: PublicDestination[],
    baseInput: AiPreferenceInput,
  ): {
    effectiveInput: AiPreferenceInput;
    matchedIntentTokens: Set<string>;
    explicitMatchedIds: Set<string>;
    explicitMatchedProvinces: Set<string>;
    lexicalQueryText: string;
  } {
    const rawText = (rawTextInput ?? "").trim().slice(0, 1000);
    const note = (noteInput ?? "").trim().slice(0, 500);
    const normalizedRawText = this.normalizeCasualIndonesian(rawText);
    const normalizedNote = this.normalizeCasualIndonesian(note);
    const normalizedText = [normalizedRawText, normalizedNote]
      .filter(Boolean)
      .join(" ")
      .trim();
    const matchedIntentTokens = new Set<string>();

    const recordMatched = (phrase: string) => {
      for (const token of phrase.toLowerCase().split(/[^a-z0-9]+/)) {
        if (token) matchedIntentTokens.add(token);
      }
    };

    const explicitMatchedEntries = normalizedText
      ? all
          .map((destination) => {
            const name = this.normalize(destination.name);
            const rawShortName = name
              .replace(
                /^(?:gunung|bukit|danau|air\s+terjun|pantai|pulau|goa|gua|kawah|ranu|taman\s+nasional)\s+/i,
                "",
              )
              .trim();
            const shortName =
              rawShortName.length >= 4 &&
              rawShortName !== name &&
              !this.isStopword(rawShortName)
                ? rawShortName
                : null;
            const fullMatched =
              name.length >= 4 &&
              new RegExp(`\\b${this.escapeRegex(name)}\\b`, "i").test(
                normalizedText,
              );
            const shortMatched =
              shortName !== null &&
              new RegExp(`\\b${this.escapeRegex(shortName)}\\b`, "i").test(
                normalizedText,
              );
            return fullMatched || shortMatched
              ? { destination, name, shortName }
              : null;
          })
          .filter(
            (
              entry,
            ): entry is {
              destination: PublicDestination;
              name: string;
              shortName: string | null;
            } => entry !== null,
          )
      : [];
    const explicitMatchedIds = new Set<string>();
    const explicitMatchedProvinces = new Set<string>();
    const matchedNameVariants = new Set<string>();
    for (const { destination, name, shortName } of explicitMatchedEntries) {
      explicitMatchedIds.add(destination.id);
      const province = this.normalize(destination.location.province ?? "");
      if (province) {
        explicitMatchedProvinces.add(province);
      }
      recordMatched(destination.name);
      if (name.length >= 4) {
        matchedNameVariants.add(name);
      }
      if (shortName) {
        recordMatched(shortName);
        matchedNameVariants.add(shortName);
      }
    }

    const matchedDestinationNames = [...matchedNameVariants].sort(
      (a, b) => b.length - a.length,
    );

    const stripExplicitNames = (value: string): string => {
      if (matchedDestinationNames.length === 0 || !value) {
        return value;
      }
      let stripped = value;
      for (const name of matchedDestinationNames) {
        stripped = stripped.replace(
          new RegExp(`\\b${this.escapeRegex(name)}\\b`, "gi"),
          " ",
        );
      }
      return stripped.replace(/\s+/g, " ").trim();
    };

    const terrainText = stripExplicitNames(normalizedText);
    const lexicalQueryText = stripExplicitNames(normalizedRawText);

    let parsedBudget: number | undefined;
    const acceptBudget = (value: number, phrase: string) => {
      if (Number.isFinite(value) && value >= 0 && value <= 1_000_000_000) {
        parsedBudget = value;
        recordMatched(phrase);
      }
    };

    let lowCostMatch: RegExpMatchArray | null = null;
    let parsedDuration: number | undefined;
    let parsedDifficulty: AiPreferenceInput["difficulty"];
    const detectedTerrains = new Set<string>();
    const detectedActivities = new Set<string>();
    const detectedRegions = new Set<string>();
    let stayMatch: RegExpMatchArray | null = null;
    let transportMatch: RegExpMatchArray | null = null;

    if (normalizedText) {
      const budgetText = normalizedText
        .replace(
          /\b(?:(?:[12]\d|3[01]|0?[1-9])\s+)?(?:jan(?:uari)?|feb(?:ruari)?|mar(?:et)?|apr(?:il)?|mei|jun(?:i)?|jul(?:i)?|agu(?:stus)?|sep(?:tember)?|okt(?:ober)?|nov(?:ember)?|des(?:ember)?)(?:\s+(?:19|20)\d{2}\b(?![.,]\d)(?![.,]{2})(?!\s*(?:jt|juta|rb|ribu|k)\b))?\b/gi,
          " ; ",
        )
        .replace(/\b\d{1,4}[/-]\d{1,2}(?:[/-]\d{1,4})?\b/g, " ; ")
        .replace(
          /\b\d+\s*(?:hari|malam|minggu|bulan|tahun|orang|pax)\b/gi,
          " ; ",
        )
        .replace(
          /\b(?:tahun|thn\.?)\s+(?:19|20)\d{2}\b(?![.,]\d)(?![.,]{2})(?!\s*(?:jt|juta|rb|ribu|k)\b)/gi,
          " ; ",
        )
        .replace(
          /(?<!\b(?:rp\.?|budget|anggaran|biaya|harga|tarif|maks(?:imal)?|max)\s*)(?<!\d[.,\s]*)\b(?:19|20)\d{2}\b(?![.,]\d)(?![.,]{2})(?!\.\s+\d)(?![.\s]+\d{3}\b(?!\s*(?:jt|juta|rb|ribu|k)\b))(?!\s*(?:jt|juta|rb|ribu|k)\b)/gi,
          " ; ",
        )
        .replace(/\s+/g, " ")
        .trim();
      const unitMatch = budgetText.match(
        /(?:\brp\.?\s*|(?<!\d[.,\s]*))(\d+(?:[.,\s]+\d+)*)\s*(jt|juta|rb|ribu|k)\b/i,
      );
      if (unitMatch) {
        const rawNum = unitMatch[1]!.trim();
        const unit = unitMatch[2]!;
        const multiplier = /^(?:jt|juta)$/i.test(unit) ? 1_000_000 : 1_000;
        let numeric: number | null = null;
        if (
          /^\d{1,3}(?:\.\d{3})+$/.test(rawNum) ||
          /^\d{1,3}(?:\s\d{3})+$/.test(rawNum)
        ) {
          numeric = Number.parseInt(rawNum.replace(/[.\s]/g, ""), 10);
        } else if (/^\d+(?:[.,]\d{1,2})?$/.test(rawNum)) {
          numeric = Number.parseFloat(rawNum.replace(",", "."));
        }
        if (numeric != null) {
          acceptBudget(Math.round(numeric * multiplier), unitMatch[0]);
        }
      } else {
        const rpMatch = budgetText.match(
          /\brp\.?\s*(\d+(?:[.,\s]+\d+)*)(?![.,\s]*\d)/i,
        );
        if (rpMatch) {
          const rawRp = rpMatch[1]!.trim();
          if (
            /^\d{1,3}(?:\.\d{3})+$/.test(rawRp) ||
            /^\d{1,3}(?:\s\d{3})+$/.test(rawRp) ||
            /^\d+$/.test(rawRp)
          ) {
            const parsed = Number(rawRp.replace(/[.\s]/g, ""));
            acceptBudget(parsed, rpMatch[0]);
          }
        }
      }

      lowCostMatch = normalizedText.match(
        /\b(murah(?:nya)?|termurah|murmer|hemat|terjangkau|ekonomis|irit|terbatas|pas-pasan|ramah\s+kantong|low\s+budget|(?:budget(?:ku|mu|nya)?|bajet(?:ku|mu|nya)?|dana(?:ku|mu|nya)?|uang(?:ku|mu|nya)?|biaya(?:nya)?|modal(?:ku|mu|nya)?)\s+(?:tipis|minim|terbatas|pas-pasan|kecil|rendah)|kantong\s+(?:mahasiswa|pelajar)|gratis)\b/i,
      );
      if (lowCostMatch) {
        recordMatched(lowCostMatch[0]);
      }

      const daysMatch = normalizedText.match(/\b([1-7])\s*hari\b/i);
      if (daysMatch) {
        parsedDuration = Number.parseInt(daysMatch[1]!, 10);
        recordMatched(daysMatch[0]);
      } else {
        const oneDayMatch = normalizedText.match(/\b(sehari|tektok)\b/i);
        if (oneDayMatch) {
          parsedDuration = 1;
          recordMatched(oneDayMatch[0]);
        } else {
          const weekendMatch = normalizedText.match(/\b(weekend|akhir\s+pekan)\b/i);
          if (weekendMatch) {
            parsedDuration = 2;
            recordMatched(weekendMatch[0]);
          }
        }
      }

      const easyMatch = normalizedText.match(
        /\b(ramah\s+pemula|pemula|mudah|gampang|santai|ringan)\b/i,
      );
      const midMatch = normalizedText.match(/\b(menengah|sedang|moderat)\b/i);
      const hardMatch = normalizedText.match(/\b(sulit|berat|ekstrem|menantang)\b/i);
      if (easyMatch) {
        parsedDifficulty = "ramah-pemula";
        recordMatched(easyMatch[0]);
      } else if (midMatch) {
        parsedDifficulty = "menengah";
        recordMatched(midMatch[0]);
      } else if (hardMatch) {
        parsedDifficulty = "sulit";
        recordMatched(hardMatch[0]);
      }

      for (const [pattern, terrain] of AiRetrievalService.TERRAIN_SYNONYMS) {
        const match = terrainText.match(pattern);
        if (match) {
          detectedTerrains.add(terrain);
          recordMatched(match[0]);
        }
      }
      for (const [pattern, activity] of AiRetrievalService.ACTIVITY_SYNONYMS) {
        const match = normalizedText.match(pattern);
        if (match) {
          recordMatched(match[0]);
          if (all.some((d) => this.matchesAny(d.activities, [activity]))) {
            detectedActivities.add(activity);
          } else if (
            activity === "Hiking" &&
            detectedTerrains.size === 0 &&
            explicitMatchedIds.size === 0 &&
            all.some((d) => this.matchesAny(d.terrain, ["Gunung"]))
          ) {
            detectedTerrains.add("Gunung");
          }
        }
      }
      for (const destination of all) {
        for (const terrain of destination.terrain) {
          if (
            new RegExp(`\\b${this.escapeRegex(terrain)}\\b`, "i").test(
              terrainText,
            )
          ) {
            detectedTerrains.add(terrain);
            recordMatched(terrain);
          }
        }
        for (const activity of destination.activities) {
          if (
            new RegExp(`\\b${this.escapeRegex(activity)}\\b`, "i").test(
              normalizedText,
            )
          ) {
            detectedActivities.add(activity);
            recordMatched(activity);
          }
        }
        for (const tag of destination.tags) {
          const trimmed = tag.trim();
          if (
            trimmed.length >= 3 &&
            new RegExp(`\\b${this.escapeRegex(trimmed)}\\b`, "i").test(
              normalizedText,
            )
          ) {
            recordMatched(tag);
          }
        }
      }

      for (const [pattern, region] of AiRetrievalService.REGION_SYNONYMS) {
        const match = normalizedText.match(pattern);
        if (match) {
          detectedRegions.add(region);
          recordMatched(match[0]);
        }
      }
      for (const destination of all) {
        const province = destination.location.province?.trim();
        const regency = destination.location.regency?.trim();
        if (
          province &&
          new RegExp(`\\b${this.escapeRegex(province)}\\b`, "i").test(
            normalizedText,
          )
        ) {
          detectedRegions.add(province);
          recordMatched(province);
        }
        if (regency) {
          const shortRegency = regency
            .replace(/^(?:Kabupaten|Kota)\s+/i, "")
            .trim();
          if (
            new RegExp(`\\b${this.escapeRegex(regency)}\\b`, "i").test(
              normalizedText,
            ) ||
            (shortRegency.length >= 3 &&
              new RegExp(`\\b${this.escapeRegex(shortRegency)}\\b`, "i").test(
                normalizedText,
              ))
          ) {
            detectedRegions.add(regency);
            recordMatched(regency);
          }
        }
      }

      stayMatch = normalizedText.match(
        /\b(menginap|nginap|homestay|penginapan|hotel|villa)\b/i,
      );
      if (stayMatch) recordMatched(stayMatch[0]);
      transportMatch = normalizedText.match(
        /\b(transport|transportasi|jeep|ojek|open\s+trip)\b/i,
      );
      if (transportMatch) recordMatched(transportMatch[0]);
    }

    const sanitizedBase: AiPreferenceInput = {
      ...baseInput,
      ...(baseInput.rawText !== undefined ? { rawText } : {}),
      ...(baseInput.note !== undefined ? { note } : {}),
    };
    const effectiveBudget = baseInput.budgetPerPerson ?? parsedBudget;
    const boundedRegions = [...detectedRegions]
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 5);
    const boundedActivities = [...detectedActivities]
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 8);
    const boundedTerrains = [...detectedTerrains]
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 8);

    const candidateInput: AiPreferenceInput = {
      ...sanitizedBase,
      ...(effectiveBudget != null ? { budgetPerPerson: effectiveBudget } : {}),
      ...(baseInput.durationDays == null && parsedDuration != null
        ? { durationDays: parsedDuration }
        : {}),
      ...(baseInput.difficulty == null && parsedDifficulty != null
        ? { difficulty: parsedDifficulty }
        : {}),
      ...(!(baseInput.terrains?.length) && boundedTerrains.length > 0
        ? { terrains: boundedTerrains }
        : {}),
      ...(!(baseInput.activities?.length) && boundedActivities.length > 0
        ? { activities: boundedActivities }
        : {}),
      ...(!(baseInput.regions?.length) && boundedRegions.length > 0
        ? { regions: boundedRegions }
        : {}),
      ...(baseInput.needsAccommodation !== true && stayMatch
        ? { needsAccommodation: true }
        : {}),
      ...(baseInput.needsTransport !== true && transportMatch
        ? { needsTransport: true }
        : {}),
    };

    const validated = aiItinerarySchema.safeParse(candidateInput);
    let safeFields: AiPreferenceInput;
    if (validated.success) {
      safeFields = validated.data;
    } else {
      const baseValidated = aiItinerarySchema.safeParse(sanitizedBase);
      safeFields = baseValidated.success
        ? baseValidated.data
        : {
            ...(baseInput.rawText !== undefined ? { rawText } : {}),
            ...(baseInput.note !== undefined ? { note } : {}),
          };
    }

    const validatedBudget = safeFields.budgetPerPerson;
    const preferLowCost =
      baseInput.preferLowCost ??
      (Boolean(lowCostMatch) ||
        (validatedBudget != null && validatedBudget <= 600_000)
        ? true
        : undefined);

    const effectiveInput: AiPreferenceInput = {
      ...safeFields,
      ...(preferLowCost !== undefined ? { preferLowCost } : {}),
    };

    return {
      effectiveInput,
      matchedIntentTokens,
      explicitMatchedIds,
      explicitMatchedProvinces,
      lexicalQueryText,
    };
  }

  private useFullStayCost(input: AiPreferenceInput): boolean {
    if (input.needsAccommodation) return true;
    if (input.budgetPerPerson != null) return false;
    return Boolean(input.preferLowCost);
  }

  private hasModePricingData(
    costInfo: DestinationCostInfo,
    useFullStay: boolean,
  ): boolean {
    return useFullStay ? costInfo.hasPricingData : costInfo.hasDayPricingData;
  }

  private computeDestinationCostFromMins(mins: {
    minFood: number | null;
    minTransport: number | null;
    minStay: number | null;
  }): DestinationCostInfo {
    const dayCost = (mins.minTransport ?? 50_000) + (mins.minFood ?? 20_000);
    const fullStayCost = dayCost + (mins.minStay ?? 175_000);
    const hasDayPricingData =
      mins.minFood != null || mins.minTransport != null;
    const hasPricingData = hasDayPricingData || mins.minStay != null;

    return {
      minFood: mins.minFood,
      minTransport: mins.minTransport,
      minStay: mins.minStay,
      dayCost,
      fullStayCost,
      hasDayPricingData,
      hasPricingData,
    };
  }

  private computeDestinationCost(supports: AiContextSupport[]): DestinationCostInfo {
    const minByCategory = (category: string): number | null => {
      const prices = supports
        .filter((s) => s.category === category && s.priceMin != null)
        .map((s) => s.priceMin as number);
      return prices.length > 0 ? Math.min(...prices) : null;
    };

    return this.computeDestinationCostFromMins({
      minFood: minByCategory("food"),
      minTransport: minByCategory("transport"),
      minStay: minByCategory("accommodation"),
    });
  }

  private mapFacilitySupport(facility: {
    id: string;
    destinationId: string;
    name: string;
    category: string;
    priceMin: number | null;
    priceMax: number | null;
    status: string;
  }): AiContextSupport {
    return {
      id: facility.id,
      destinationId: facility.destinationId,
      name: facility.name,
      category: facility.category,
      priceMin: facility.priceMin,
      priceMax: facility.priceMax,
      priceLabel:
        facility.priceMin == null
          ? null
          : `Rp ${facility.priceMin.toLocaleString("id-ID")}`,
      locationLabel: null,
      verified: facility.status === "published",
    };
  }

  private catalogHaystack(destinations: PublicDestination[]): string {
    return this.normalize(
      destinations
        .map((destination) =>
          [
            destination.name,
            destination.tagline ?? "",
            destination.description ?? "",
            destination.tags.join(" "),
            destination.terrain.join(" "),
            destination.activities.join(" "),
            destination.location.province ?? "",
            destination.location.regency ?? "",
          ].join(" "),
        )
        .join(" "),
    );
  }

  private matchesAny(values: string[], needles: string[]): boolean {
    return (
      needles.length === 0 ||
      needles.some((needle) =>
        values.some((value) => this.normalize(value).includes(this.normalize(needle))),
      )
    );
  }

  private matchesFilters(
    destination: PublicDestination,
    input: AiPreferenceInput,
    dropped: DroppedFilter[],
    costInfo: DestinationCostInfo,
    anyHasPricingData: boolean,
    explicitMatchedIds: Set<string>,
  ): boolean {
    if (explicitMatchedIds.has(destination.id)) {
      return true;
    }
    if (
      !dropped.includes("regions") &&
      input.regions?.length &&
      !this.matchesAny(
        [destination.location.province ?? "", destination.location.regency ?? ""],
        input.regions,
      )
    ) {
      return false;
    }
    if (
      !dropped.includes("terrains") &&
      !this.matchesAny(destination.terrain, input.terrains ?? [])
    ) {
      return false;
    }
    if (
      !dropped.includes("activities") &&
      !this.matchesAny(destination.activities, input.activities ?? [])
    ) {
      return false;
    }
    if (!dropped.includes("budget")) {
      if (input.budgetPerPerson != null) {
        const compared = input.needsAccommodation
          ? costInfo.fullStayCost
          : costInfo.dayCost;
        if (compared > input.budgetPerPerson) {
          return false;
        }
      } else if (input.preferLowCost && anyHasPricingData) {
        if (
          !costInfo.hasPricingData ||
          costInfo.fullStayCost > 260_000 ||
          (costInfo.minTransport ?? 50_000) > 60_000
        ) {
          return false;
        }
      }
    }
    if (
      !dropped.includes("difficulty") &&
      input.difficulty != null &&
      destination.difficulty !== input.difficulty
    ) {
      return false;
    }
    return true;
  }

  private lexicalScore(destination: PublicDestination, rawText: string): number {
    const haystack = this.normalize(
      [
        destination.name,
        destination.tagline ?? "",
        destination.description ?? "",
        destination.tags.join(" "),
        destination.terrain.join(" "),
        destination.activities.join(" "),
      ].join(" "),
    );
    const haystackWords = new Set(haystack.split(/[^a-z0-9]+/).filter(Boolean));
    const tokens = this.normalizeCasualIndonesian(rawText)
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length > 2 && !this.isStopword(token));

    return tokens.reduce(
      (score, token) => score + (haystackWords.has(token) ? 1 : 0),
      0,
    );
  }

  /**
   * Lexical + structured retrieval over published destinations, their supports
   * and routes. Hard filters are relaxed one by one when no destination matches,
   * so the itinerary can still be useful instead of returning an empty context.
   */
  async build(input: AiPreferenceInput): Promise<AiContext> {
    const rawText = (input.rawText ?? "").trim().slice(0, 1000);
    const note = (input.note ?? "").trim().slice(0, 500);
    const list = await destinationService.list({
      page: 1,
      limit: 100,
      sort: "name",
      order: "asc",
      status: "published",
    });
    const all = list.items;

    const {
      effectiveInput,
      matchedIntentTokens,
      explicitMatchedIds,
      explicitMatchedProvinces,
      lexicalQueryText,
    } = this.parsePromptIntent(rawText, note, all, input);

    const queryTerms = this.extractQueryTerms(rawText);
    const haystack = this.catalogHaystack(all);
    const unmatchedTerms = queryTerms.filter(
      (term) => !matchedIntentTokens.has(term) && !haystack.includes(term),
    );

    const facilitiesByDestination = new Map<string, AiContextSupport[]>();
    const costByDestination = new Map<string, DestinationCostInfo>();
    const hasMinPriceAggregate =
      typeof facilityRepository.minPricesByCategory === "function";

    if (hasMinPriceAggregate) {
      const priceRows = await facilityRepository.minPricesByCategory(
        all.map((destination) => destination.id),
      );
      const minsByDestination = new Map<
        string,
        {
          minFood: number | null;
          minTransport: number | null;
          minStay: number | null;
        }
      >();
      for (const row of priceRows) {
        if (row.minPrice == null) continue;
        const mins = minsByDestination.get(row.destinationId) ?? {
          minFood: null,
          minTransport: null,
          minStay: null,
        };
        if (row.category === "food") {
          mins.minFood =
            mins.minFood == null
              ? row.minPrice
              : Math.min(mins.minFood, row.minPrice);
        } else if (row.category === "transport") {
          mins.minTransport =
            mins.minTransport == null
              ? row.minPrice
              : Math.min(mins.minTransport, row.minPrice);
        } else if (row.category === "accommodation") {
          mins.minStay =
            mins.minStay == null
              ? row.minPrice
              : Math.min(mins.minStay, row.minPrice);
        }
        minsByDestination.set(row.destinationId, mins);
      }
      for (const destination of all) {
        const mins = minsByDestination.get(destination.id);
        if (mins) {
          costByDestination.set(
            destination.id,
            this.computeDestinationCostFromMins(mins),
          );
        }
      }
    } else {
      for (const destination of all) {
        const facilityResult = await facilityRepository.list({
          page: 1,
          limit: 10,
          offset: 0,
          sort: "priceMin",
          order: "asc",
          destinationId: destination.id,
          statuses: ["published"],
          publishedDestinationOnly: true,
        });
        const mappedSupports = facilityResult.items.map((facility) =>
          this.mapFacilitySupport(facility),
        );
        facilitiesByDestination.set(destination.id, mappedSupports);
        costByDestination.set(
          destination.id,
          this.computeDestinationCost(mappedSupports),
        );
      }
    }

    const anyHasPricingData = all.some(
      (destination) => costByDestination.get(destination.id)?.hasPricingData,
    );

    const requestedIds = [...new Set(effectiveInput.destinationIds ?? [])];
    const requestedDestinations = requestedIds
      .map((id) => all.find((destination) => destination.id === id))
      .filter(
        (destination): destination is PublicDestination => Boolean(destination),
      );
    const invalidDestinationIds = requestedIds.filter(
      (id) => !all.some((destination) => destination.id === id),
    );

    const present: DroppedFilter[] = [];
    if (effectiveInput.activities?.length) present.push("activities");
    if (effectiveInput.terrains?.length) present.push("terrains");
    if (effectiveInput.budgetPerPerson != null || effectiveInput.preferLowCost) {
      present.push("budget");
    }
    if (effectiveInput.regions?.length) present.push("regions");
    if (effectiveInput.difficulty != null) present.push("difficulty");

    // Explicit destination IDs win over preference filters: the user picked
    // these destinations, so keep all published ones in the given order.
    let selected: Array<{
      destination: PublicDestination;
      lexical: number;
      isExplicit: boolean;
      isSameProvince: boolean;
      costInfo: DestinationCostInfo;
    }> = [];
    let relaxed: DroppedFilter[] = [];
    const defaultCostInfo: DestinationCostInfo = {
      minFood: null,
      minTransport: null,
      minStay: null,
      dayCost: 70_000,
      fullStayCost: 245_000,
      hasDayPricingData: false,
      hasPricingData: false,
    };

    const useFullStay = this.useFullStayCost(effectiveInput);
    const isSameProvince = (destination: PublicDestination): boolean =>
      explicitMatchedProvinces.size > 0 &&
      explicitMatchedProvinces.has(
        this.normalize(destination.location.province ?? ""),
      );

    if (requestedIds.length > 0) {
      selected = requestedDestinations.map((destination) => ({
        destination,
        lexical: this.lexicalScore(destination, lexicalQueryText),
        isExplicit: explicitMatchedIds.has(destination.id),
        isSameProvince: isSameProvince(destination),
        costInfo: costByDestination.get(destination.id) ?? defaultCostInfo,
      }));
    } else {
      const sortByCost = Boolean(
        effectiveInput.preferLowCost || effectiveInput.budgetPerPerson != null,
      );
      // Try the full filter set first, then progressively drop one filter.
      for (let index = 0; index <= present.length; index += 1) {
        const dropped = present.slice(0, index);
        const result = all
          .filter((destination) =>
            this.matchesFilters(
              destination,
              effectiveInput,
              dropped,
              costByDestination.get(destination.id) ?? defaultCostInfo,
              anyHasPricingData,
              explicitMatchedIds,
            ),
          )
          .map((destination) => ({
            destination,
            lexical: this.lexicalScore(destination, lexicalQueryText),
            isExplicit: explicitMatchedIds.has(destination.id),
            isSameProvince: isSameProvince(destination),
            costInfo: costByDestination.get(destination.id) ?? defaultCostInfo,
          }))
          .sort((a, b) => {
            if (sortByCost) {
              const aPrimaryCost = useFullStay
                ? a.costInfo.fullStayCost
                : a.costInfo.dayCost;
              const bPrimaryCost = useFullStay
                ? b.costInfo.fullStayCost
                : b.costInfo.dayCost;
              const aSecondaryCost = useFullStay
                ? a.costInfo.dayCost
                : a.costInfo.fullStayCost;
              const bSecondaryCost = useFullStay
                ? b.costInfo.dayCost
                : b.costInfo.fullStayCost;
              return (
                Number(b.isExplicit) - Number(a.isExplicit) ||
                b.lexical - a.lexical ||
                Number(this.hasModePricingData(b.costInfo, useFullStay)) -
                  Number(this.hasModePricingData(a.costInfo, useFullStay)) ||
                aPrimaryCost - bPrimaryCost ||
                aSecondaryCost - bSecondaryCost ||
                a.destination.name.localeCompare(b.destination.name) ||
                a.destination.id.localeCompare(b.destination.id)
              );
            }
            return (
              Number(b.isExplicit) - Number(a.isExplicit) ||
              b.lexical - a.lexical ||
              Number(b.isSameProvince) - Number(a.isSameProvince) ||
              a.destination.name.localeCompare(b.destination.name) ||
              a.destination.id.localeCompare(b.destination.id)
            );
          })
          .slice(0, 8);

        relaxed = dropped;
        if (result.length > 0) {
          selected = result;
          break;
        }
      }
    }

    const destinationIds = selected.map((entry) => entry.destination.id);
    const supports: AiContextSupport[] = [];
    const routes: AiContextRoute[] = [];

    for (const entry of selected) {
      const cachedSupports = facilitiesByDestination.get(entry.destination.id);
      if (cachedSupports) {
        supports.push(...cachedSupports);
      } else {
        const balancedSupports = await this.loadBalancedSupports(
          entry.destination.id,
          entry.costInfo,
          hasMinPriceAggregate,
        );
        supports.push(...balancedSupports);
      }

      const trailRoutes = await routeService.listRoutes(entry.destination.id);
      for (const route of trailRoutes.slice(0, 2)) {
        const profile = await routeService.profile(route.id);
        routes.push({
          id: route.id,
          destinationId: entry.destination.id,
          name: route.name,
          surface: route.surface,
          status: route.status,
          totalDistanceKm: profile.totalDistanceKm ?? 0,
          totalGainMeters: profile.totalGainMeters ?? 0,
          estimatedDurationMinutes: profile.estimatedDurationMinutes ?? 0,
        });
      }
    }

    return {
      preference: effectiveInput,
      destinations: selected.map((entry) => {
        const { costInfo } = entry;
        const hasModePricing = this.hasModePricingData(costInfo, useFullStay);
        const estimatedCostPerPerson = hasModePricing
          ? useFullStay
            ? costInfo.fullStayCost
            : costInfo.dayCost
          : null;
        return {
          id: entry.destination.id,
          name: entry.destination.name,
          slug: entry.destination.slug,
          tagline: entry.destination.tagline,
          images: entry.destination.images,
          province: entry.destination.location.province,
          regency: entry.destination.location.regency,
          difficulty: entry.destination.difficulty,
          elevationMeters: entry.destination.elevationMeters,
          bestSeason: entry.destination.bestSeason,
          guideRequired: entry.destination.guideRequired,
          description: entry.destination.description,
          categories: [
            ...entry.destination.terrain,
            ...entry.destination.activities,
          ],
          estimatedCostPerPerson,
          costSummary:
            estimatedCostPerPerson != null
              ? `Estimasi mulai Rp ${estimatedCostPerPerson.toLocaleString("id-ID")}/orang`
              : null,
          isExplicit: entry.isExplicit,
        };
      }),
      supports,
      // Only include routes that belong to the selected destinations.
      routes: routes.filter((route) =>
        destinationIds.includes(route.destinationId),
      ),
      relaxed: relaxed.map((filter) => AiRetrievalService.FILTER_LABEL[filter]),
      queryMatched: unmatchedTerms.length === 0,
      unmatchedTerms,
      invalidDestinationIds,
    };
  }
}

export const aiRetrieval = new AiRetrievalService();
