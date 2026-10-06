import type { ID } from "./common";

export type FaqCategory = "akun" | "perjalanan" | "fasilitas" | "data";

export interface FaqItem {
  id: ID;
  category: FaqCategory;
  question: string;
  answer: string;
}
