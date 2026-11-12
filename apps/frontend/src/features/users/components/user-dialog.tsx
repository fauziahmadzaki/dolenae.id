"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { useToast } from "~/components/ui/toaster";
import { formatUserDate } from "../format";
import { useUser, useUserMutation } from "../hooks/use-users";
import {
  roleLabels,
  roleOptions,
  userFormSchema,
  type UserForm,
  type UserMode,
} from "../schema";

interface UserDialogProps {
  mode: UserMode;
  token: string;
  onClose: () => void;
  onSaved: (message: string) => void;
  onUnauthorized: () => void;
}

const SAVED_MESSAGES: Record<"create" | "edit" | "delete", string> = {
  create: "Pengguna berhasil ditambahkan.",
  edit: "Perubahan pengguna berhasil disimpan.",
  delete: "Pengguna berhasil dihapus.",
};

const TITLES: Record<UserMode["kind"], string> = {
  create: "Tambah pengguna",
  edit: "Edit pengguna",
  detail: "Detail pengguna",
  delete: "Hapus pengguna",
};

const FIELDS = ["name", "email", "password"] as const;

const message = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "Permintaan gagal. Silakan coba lagi.";

export function UserDialog({
  mode,
  token,
  onClose,
  onSaved,
  onUnauthorized,
}: UserDialogProps) {
  const user = "user" in mode ? mode.user : null;
  const form = useForm<UserForm>({
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      role: user?.role ?? "wisatawan",
      password: "",
    },
  });

  const detail = useUser(user?.id, token, mode.kind === "detail");
  const mutation = useUserMutation({
    token,
    onSaved: () => {
      if (mode.kind === "detail") return;
      onSaved(SAVED_MESSAGES[mode.kind]);
    },
    onUnauthorized,
  });
  const role = form.watch("role");
  const { toast } = useToast();

  useEffect(() => {
    if (!mutation.isError) return;
    toast({
      title: "Aksi gagal",
      description: message(mutation.error),
      variant: "danger",
    });
  }, [mutation.isError, mutation.error, toast]);

  const submit = form.handleSubmit((values) => {
    const parsed = userFormSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        form.setError(issue.path[0] as keyof UserForm, {
          message: issue.message,
        });
      }
      return;
    }
    if (mode.kind === "create" && !parsed.data.password) {
      form.setError("password", { message: "Kata sandi wajib diisi" });
      return;
    }

    const { password, ...fields } = parsed.data;
    const payload = password ? { ...fields, password } : fields;

    mutation.mutate(
      mode.kind === "create"
        ? { kind: "create", payload }
        : { kind: "edit", id: user!.id, payload },
    );
  });

  const record = detail.data?.data;

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !mutation.isPending) onClose();
      }}
    >
      <DialogContent className="w-[480px] max-h-[90dvh] overflow-y-auto">
        <DialogTitle>{TITLES[mode.kind]}</DialogTitle>
        <DialogDescription>
          {mode.kind === "delete"
            ? `Hapus ${user?.name}? Tindakan ini tidak dapat dibatalkan.`
            : mode.kind === "create"
              ? "Buat akun baru. Undangan email belum tersedia."
              : "Data pengguna dari Dolenae API."}
        </DialogDescription>

        {mutation.isError && (
          <p role="alert" className="text-sm text-danger">
            {message(mutation.error)}
          </p>
        )}

        {mode.kind === "detail" ? (
          <>
            {detail.isPending ? (
              <p role="status" className="text-sm text-body">
                Memuat detail…
              </p>
            ) : detail.isError ? (
              <p role="alert" className="text-sm text-danger">
                {message(detail.error)}
              </p>
            ) : (
              record && (
                <dl className="space-y-3 text-sm">
                  {[
                    ["Nama", record.name],
                    ["Email", record.email],
                    ["Role", roleLabels[record.role]],
                    ["ID", record.id],
                    ["Terdaftar", formatUserDate(record.createdAt)],
                    ["Diperbarui", formatUserDate(record.updatedAt)],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="font-semibold text-ink">{label}</dt>
                      <dd className="break-all text-body">{value}</dd>
                    </div>
                  ))}
                </dl>
              )
            )}
            <Button variant="secondary" onClick={onClose}>
              Tutup
            </Button>
          </>
        ) : mode.kind === "delete" ? (
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              disabled={mutation.isPending}
              onClick={onClose}
            >
              Batal
            </Button>
            <Button
              className="bg-danger hover:bg-danger/90"
              disabled={mutation.isPending}
              onClick={() =>
                mutation.mutate({ kind: "delete", id: user!.id })
              }
            >
              {mutation.isPending ? "Menghapus…" : "Hapus permanen"}
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4" noValidate>
            <fieldset disabled={mutation.isPending} className="space-y-4">
              {FIELDS.map((field) => (
                <div key={field} className="space-y-1.5">
                  <label
                    htmlFor={`user-${field}`}
                    className="block text-sm font-semibold text-ink"
                  >
                    {
                      {
                        name: "Nama",
                        email: "Email",
                        password:
                          mode.kind === "create"
                            ? "Kata sandi"
                            : "Kata sandi baru (opsional)",
                      }[field]
                    }
                  </label>
                  <Input
                    id={`user-${field}`}
                    type={
                      field === "password"
                        ? "password"
                        : field === "email"
                          ? "email"
                          : "text"
                    }
                    autoComplete={field === "password" ? "new-password" : "off"}
                    placeholder={
                      field === "password"
                        ? mode.kind === "create"
                          ? "Minimal 8 karakter"
                          : "Kosongkan jika tidak diubah"
                        : field === "email"
                          ? "nama@email.com"
                          : "Nama lengkap"
                    }
                    aria-invalid={!!form.formState.errors[field]}
                    {...form.register(field)}
                  />
                  {form.formState.errors[field] && (
                    <p role="alert" className="text-xs text-danger">
                      {form.formState.errors[field]?.message}
                    </p>
                  )}
                </div>
              ))}

              <div className="space-y-1.5">
                <label
                  htmlFor="user-role"
                  className="block text-sm font-semibold text-ink"
                >
                  Role
                </label>
                <Select
                  id="user-role"
                  options={roleOptions}
                  value={role}
                  onChange={(value) =>
                    form.setValue("role", value as UserForm["role"], {
                      shouldValidate: true,
                    })
                  }
                />
              </div>
            </fieldset>

            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                disabled={mutation.isPending}
                onClick={onClose}
              >
                Batal
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Menyimpan…" : "Simpan"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
