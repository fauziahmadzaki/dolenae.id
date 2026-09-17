import type { ID, ISODateString } from "./common";

export type UserRole = "wisatawan" | "merchant" | "admin";

export interface User {
  id: ID;
  name: string;
  email: string;
  role: UserRole;
  createdAt: ISODateString;
}

export interface Merchant extends User {
  role: "merchant";
  businessName: string;
  description?: string;
}