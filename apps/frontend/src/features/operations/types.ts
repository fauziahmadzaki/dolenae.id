// Manual types synchronized with docs/specs/integration-contract.md.
export type SupportCategory = "accommodation" | "transport" | "food";
export interface TravelSupport {
  id: string; destinationId: string; relatedDestinationName?: string; name: string;
  category: SupportCategory; description: string | null; locationLabel: string | null;
  capacity: string | null; distanceLabel: string | null; priceLabel: string | null;
  priceUnit: string | null; priceMin: number | null; priceMax: number | null;
  contactPhone: string | null; contactWhatsapp: string | null; contactInstagram: string | null;
  imageUrl: string | null; facilities: string[]; routes: string[]; cuisine: string[];
  includesDriver: boolean; verified: boolean; createdAt: string; updatedAt: string;
}
export interface Proposal {
  id: string; userId: string; name: string; type: SupportCategory;
  destinationId: string | null; nearestDestinationName: string; address: string;
  note: string | null; status: "menunggu" | "terverifikasi" | "ditolak";
  reviewNote: string | null; createdAt: string; updatedAt: string;
}
export interface Metrics {
  users: number; destinations: number; publishedDestinations: number; supports: number;
  pendingProposals: number; pendingPayments: number; paidPayments: number; dummyRevenue: number;
}
export interface Activity {
  id: string; actorId: string | null; action: string; targetType: string;
  targetId: string; targetLabel: string; createdAt: string;
}
export interface Promo {
  id: string; code: string; title: string; discountType: "percentage" | "fixed";
  value: number; minAmount: number; maxDiscount: number | null;
  startsAt: string; endsAt: string; active: boolean;
}
export type PaymentStatus = "pending" | "paid" | "cancelled";
export interface Payment {
  id: string; userId: string; supportId: string; supportName: string; quantity: number;
  subtotal: number; discount: number; total: number; promoCode: string | null;
  status: PaymentStatus; method: "dummy_qr"; isDummy: true; qrPayload: string;
  qrMatrix: boolean[][]; createdAt: string; updatedAt: string; paidAt: string | null;
}
export interface Faq {
  id: string; category: "akun" | "perjalanan" | "fasilitas" | "data";
  question: string; answer: string;
}
export interface Feedback {
  id: string; userId: string; category: "bug" | "saran" | "konten" | "lainnya";
  subject: string; message: string; rating: number | null; createdAt: string;
}
export const supportCategories = [
  { value: "accommodation", label: "Penginapan" },
  { value: "transport", label: "Transportasi" },
  { value: "food", label: "Makanan" },
];
export const faqCategories = ["akun", "perjalanan", "fasilitas", "data"].map((value) => ({ value, label: value[0].toUpperCase() + value.slice(1) }));
export const rupiah = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
export const dateTime = (value: string | null) => value ? new Date(value).toLocaleString("id-ID") : "Belum tersedia";
