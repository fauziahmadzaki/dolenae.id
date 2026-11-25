import { z } from "zod";
export const userFormSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(120),
  email: z.string().trim().email("Format email tidak valid").max(255),
  role: z.enum(["wisatawan", "merchant", "admin"]),
  password: z.string().max(128).refine((s) => !s || s.length >= 8, "Kata sandi minimal 8 karakter"),
});
export type UserForm = z.infer<typeof userFormSchema>;
export interface ManagedUser { id: string; name: string; email: string; role: UserForm["role"]; emailVerifiedAt: string | null; lastLoginAt: string | null; createdAt: string; updatedAt: string; }
export const roleLabels = { admin: "Admin", merchant: "Merchant", wisatawan: "Wisatawan" };

/** Opsi role untuk komponen Select. */
export const roleOptions = Object.entries(roleLabels).map(([value, label]) => ({
  value,
  label,
}));

/** Dialog state for the users page (create, edit, detail, delete). */
export type UserMode =
  | { kind: "create" }
  | { kind: "edit" | "detail" | "delete"; user: ManagedUser };
