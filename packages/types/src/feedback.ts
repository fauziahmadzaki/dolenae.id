import type { ID, ISODateString } from "./common";

export type FeedbackCategory = "bug" | "saran" | "konten" | "lainnya";

export interface FeedbackSubmission {
  id: ID;
  category: FeedbackCategory;
  subject: string;
  message: string;
  /** Rating bintang 1 sampai 5. */
  rating: number;
  createdAt: ISODateString;
}
