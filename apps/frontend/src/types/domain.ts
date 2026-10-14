// Manual domain types (kept in sync with the backend by hand).
export type UserRole = "wisatawan" | "merchant" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}
