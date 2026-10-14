import { z } from "zod";
export const userFormSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(120),
  email: z.string().trim().email("Format email tidak valid").max(255),
  role: z.enum(["wisatawan", "merchant", "admin"]),
  password: z.string().max(128).refine((s) => !s || s.length >= 8, "Kata sandi minimal 8 karakter"),
});
export type UserForm = z.infer<typeof userFormSchema>;
export interface ManagedUser { id: string; name: string; email: string; role: UserForm["role"]; createdAt: string; updatedAt: string; }
export const roleLabels = { admin: "Admin", merchant: "Merchant", wisatawan: "Wisatawan" };
