export function travelSupports() {
  return {
    bromoJeep: {
      id: "sup-bromo-jp-01",
      type: "transport",
      name: "Bromo Jeep Tour Probolinggo",
      destinationId: "dst-bromo-001",
      description:
        "Sewa jeep 4x4 untuk sunrise tour Bromo (Penanjakan - lautan pasir - kawah). Termasuk driver dengan pengalaman jalur Bromo.",
      priceRange: "menengah",
      contact: { whatsapp: "+6281234567801", instagram: "@bromojeeptour" },
      verified: true,
      tags: ["jeep", "sunrise-tour", "sewa"],
      mode: "mobil",
      capacitySeats: 4,
      routes: ["Probolinggo", "Cemoro Lawang", "Penanjakan"],
      price: 650000,
    },
    bromoHomestay: {
      id: "sup-bromo-hs-02",
      type: "accommodation",
      name: "Homestay Cemoro Indah",
      destinationId: "dst-bromo-001",
      description:
        "Penginapan sederhana dekat lautan pasir, hangat dan mudah mengakses titik sunrise. Fasilitas air hangat.",
      priceRange: "ekonomis",
      contact: { phone: "+6281345678902" },
      verified: true,
      tags: ["homestay", "dekat-basecamp"],
      pricePerNight: 250000,
      capacity: "2-4 orang",
      facilities: ["air hangat", "wifi", "kamar mandi dalam"],
    },
    papandayanWarung: {
      id: "sup-papandayan-wr-03",
      type: "food",
      name: "Warung Edelweiss Basecamp",
      destinationId: "dst-papandayan-002",
      description:
        "Warung sederhana di area basecamp dengan kebutuhan logistik pendakian. Menyediakan solar mini dan makanan khas Garut.",
      priceRange: "ekonomis",
      contact: { whatsapp: "+6281556789003" },
      verified: false,
      tags: ["warung", "basecamp", "logistik"],
      cuisine: ["sunda", "nusantara"],
    },
    prauOpenTrip: {
      id: "sup-prau-ot-04",
      type: "transport",
      name: "Open Trip Prau from Wonosobo",
      destinationId: "dst-prau-004",
      description:
        "Paket open trip termasuk transportasi PP + porter + tiket masuk. Jadwal pemberangkatan malam di akhir pekan.",
      priceRange: "menengah",
      contact: { whatsapp: "+6281767890004", instagram: "@opentripprau" },
      verified: true,
      tags: ["open-trip", "paket", "porter"],
      mode: "open-trip",
      capacitySeats: 10,
      routes: ["Wonosobo", "Dieng", "Patak Banteng"],
      price: 350000,
    },
  } as const;
}