"use client";

import {
  ArrowDownUp,
  Download,
  FileText,
  Filter,
  Image as ImageIcon,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActiveSearchChip } from "~/components/ui/active-search-chip";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Select } from "~/components/ui/select";
import { useToast } from "~/components/ui/toaster";
import {
  useRegisterShellSearch,
  useUrlSearchSync,
} from "~/features/admin/components/shell-search-context";
import { useAuth } from "~/features/auth/hooks/use-auth";
import { uploadsApi } from "~/features/media/api";
import { cn } from "~/lib/cn";
import { exportCsv } from "~/lib/export-csv";
import type {
  AdminContent,
  ContentKind,
  ContentPayload,
  ContentStatus,
  GalleryPhoto,
} from "./api";
import { ContentFormDialog } from "./components/content-form-dialog";
import { ContentTable } from "./components/content-table";
import { GalleryGrid } from "./components/gallery-grid";
import { GalleryUploader, type GalleryUploadInput } from "./components/gallery-uploader";
import {
  useAdminContents,
  useAdminGallery,
  useContentMutation,
  useGalleryMutation,
} from "./hooks/use-content";
import { contentKindLabels, contentStatusLabels } from "./types";

type ContentTab = "artikel" | "galeri";

const KIND_FILTERS: { value: "all" | ContentKind; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "artikel", label: "Artikel" },
  { value: "panduan", label: "Panduan" },
  { value: "tips", label: "Tips" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "Semua status" },
  { value: "published", label: "Terbit" },
  { value: "pending", label: "Menunggu" },
  { value: "draft", label: "Draf" },
];

const SORT_OPTIONS = [
  { value: "updatedAt:desc", label: "Terbaru diperbarui" },
  { value: "createdAt:desc", label: "Terbaru dibuat" },
  { value: "publishedAt:desc", label: "Terbaru terbit" },
  { value: "title:asc", label: "Judul A–Z" },
  { value: "views:desc", label: "Paling dilihat" },
];

const GALLERY_SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Terbaru diunggah" },
  { value: "createdAt:asc", label: "Terlama diunggah" },
  { value: "fileName:asc", label: "Nama berkas A–Z" },
  { value: "fileName:desc", label: "Nama berkas Z–A" },
  { value: "size:desc", label: "Ukuran terbesar" },
  { value: "size:asc", label: "Ukuran terkecil" },
];

const REGION_OPTIONS = [
  { value: "all", label: "Semua wilayah" },
  { value: "Jawa Timur", label: "Jawa Timur" },
  { value: "Jawa Tengah", label: "Jawa Tengah" },
  { value: "Jawa Barat", label: "Jawa Barat" },
  { value: "Bali", label: "Bali" },
  { value: "Nusa Tenggara Barat", label: "Nusa Tenggara Barat" },
  { value: "Sumatera Utara", label: "Sumatera Utara" },
  { value: "Sulawesi Selatan", label: "Sulawesi Selatan" },
  { value: "none", label: "Tanpa wilayah" },
];

const PAGE_SIZE = 20;

/** Admin Konten page — Figma `292:5016` (Artikel) and `292:7276` (Galeri). */
export function AdminContentPage() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const token = auth.token ?? undefined;

  const [tab, setTab] = useState<ContentTab>("artikel");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [kindFilter, setKindFilter] = useState<"all" | ContentKind>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ContentStatus>("all");
  const [sortValue, setSortValue] = useState("updatedAt:desc");
  const [gallerySort, setGallerySort] = useState("createdAt:desc");
  const [regionFilter, setRegionFilter] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { clearUrlSearch } = useUrlSearchSync(
    useCallback((next: string) => {
      setSearch(next);
      setDebouncedSearch(next);
      setPage(1);
    }, []),
    auth.isAuthenticated,
  );
  const handleSearchChange = useCallback(
    (next: string) => {
      setSearch(next);
      setPage(1);
      if (!next.trim()) clearUrlSearch();
    },
    [clearUrlSearch],
  );
  const isArtikel = tab === "artikel";
  useRegisterShellSearch({
    scopeKey: isArtikel ? "admin-konten-artikel" : "admin-konten-galeri",
    value: search,
    onChange: handleSearchChange,
    placeholder: isArtikel ? "Cari judul konten…" : "Cari nama berkas…",
    enabled: auth.isAuthenticated,
  });

  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminContent | null>(null);
  const [deletingContentId, setDeletingContentId] = useState<string | null>(null);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
  const [uploadQueue, setUploadQueue] = useState<GalleryUploadInput[]>([]);

  const [sortField, sortOrder] = sortValue.split(":") as [
    string,
    "asc" | "desc",
  ];

  const contentQuery = useAdminContents(
    {
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch,
      sort: sortField,
      order: sortOrder,
      kind: kindFilter === "all" ? undefined : kindFilter,
      status: statusFilter === "all" ? undefined : statusFilter,
    },
    token,
    auth.isAuthenticated,
  );

  const galleryQuery = useAdminGallery(
    {
      page,
      limit: PAGE_SIZE * 2,
      search: debouncedSearch,
      sort: gallerySort.split(":")[0],
      order: gallerySort.split(":")[1] === "asc" ? "asc" : "desc",
      region: regionFilter === "all" ? undefined : regionFilter,
    },
    token,
    auth.isAuthenticated,
  );

  const onUnauthorized = () => {
    auth.logout();
    router.replace("/auth/login");
  };
  const onError = (error: unknown) =>
    toast({
      title: "Aksi gagal",
      description:
        error instanceof Error ? error.message : "Permintaan gagal.",
      variant: "danger",
    });

  const contentMutation = useContentMutation({
    token,
    onSaved: (message) => toast({ title: message, variant: "success" }),
    onUnauthorized,
    onError,
  });

  const galleryMutation = useGalleryMutation({
    token,
    onSaved: (message) => toast({ title: message, variant: "success" }),
    onUnauthorized,
    onError,
  });

  const contents = contentQuery.data?.data ?? [];
  const photos = galleryQuery.data?.data ?? [];
  const contentMeta = contentQuery.data?.meta as
    | { total?: number; totalPages?: number }
    | undefined;
  const galleryMeta = galleryQuery.data?.meta as
    | { total?: number; totalPages?: number }
    | undefined;

  const activeCount = isArtikel ? contents.length : photos.length;
  const activeTotal = (isArtikel ? contentMeta?.total : galleryMeta?.total) ?? 0;
  const totalPages = (isArtikel ? contentMeta?.totalPages : galleryMeta?.totalPages) ?? 1;

  const activeError = useMemo(() => {
    const error = isArtikel ? contentQuery.error : galleryQuery.error;
    if (!error) return null;
    return error instanceof Error
      ? error.message
      : "Gagal memuat data dari server.";
  }, [isArtikel, contentQuery.error, galleryQuery.error]);

  const retry = () => {
    if (isArtikel) void contentQuery.refetch();
    else void galleryQuery.refetch();
  };

  const changeTab = (next: ContentTab) => {
    if (next === tab) return;
    setTab(next);
    setDebouncedSearch("");
    handleSearchChange("");
  };

  /** Sort applies to the active tab and always restarts at page 1. */
  const applySort = (value: string) => {
    if (isArtikel) setSortValue(value);
    else setGallerySort(value);
    setPage(1);
  };

  const applyRegion = (value: string) => {
    setRegionFilter(value);
    setPage(1);
  };

  const handleExport = () => {
    if (isArtikel) {
      exportCsv("konten.csv", [
        ["Konten", "Jenis", "Penulis", "Status", "Dipublikasi", "Dilihat"],
        ...contents.map((item) => [
          item.title,
          contentKindLabels[item.kind],
          item.author?.name ?? "",
          contentStatusLabels[item.status],
          item.publishedAt ?? "",
          String(item.views),
        ]),
      ]);
      return;
    }
    exportCsv("galeri.csv", [
      ["Berkas", "Wilayah", "Ukuran", "URL"],
      ...photos.map((photo) => [
        photo.fileName,
        photo.region ?? "",
        String(photo.size),
        photo.url,
      ]),
    ]);
  };

  const submitContent = (payload: ContentPayload) => {
    if (editing) {
      contentMutation.update.mutate(
        { id: editing.id, payload },
        {
          onSuccess: () => {
            setFormOpen(false);
            setEditing(null);
          },
        },
      );
      return;
    }
    contentMutation.create.mutate(payload, {
      onSuccess: () => {
        setFormOpen(false);
        setEditing(null);
      },
    });
  };

  const deleteContent = (item: AdminContent) => {
    setDeletingContentId(item.id);
    contentMutation.remove.mutate(item.id, {
      onSettled: () => setDeletingContentId(null),
    });
  };

  const deletePhoto = async (photo: GalleryPhoto) => {
    setDeletingPhotoId(photo.id);
    try {
      await galleryMutation.remove.mutateAsync(photo.id);
      return true;
    } catch {
      return false;
    } finally {
      setDeletingPhotoId(null);
    }
  };

  const [failedUploads, setFailedUploads] = useState<GalleryUploadInput[]>([]);

  const registerUpload = async (file: GalleryUploadInput) => {
    setUploadQueue((queue) => [...queue, file]);
    setFailedUploads((list) => list.filter((item) => item.key !== file.key));
    try {
      await galleryMutation.create.mutateAsync({
        url: file.url,
        key: file.key,
        name: file.name,
        mime: file.mime,
        size: file.size,
        region: null,
      });
    } catch {
      setFailedUploads((list) => [...list, file]);
    } finally {
      setUploadQueue((queue) => queue.filter((item) => item.key !== file.key));
    }
  };

  const discardFailedUpload = async (file: GalleryUploadInput) => {
    setUploadQueue((queue) => [...queue, file]);
    setFailedUploads((list) => list.filter((item) => item.key !== file.key));
    try {
      await uploadsApi.remove(file.url, token);
    } catch (error) {
      onError(error);
      setFailedUploads((list) => [...list, file]);
    } finally {
      setUploadQueue((queue) => queue.filter((item) => item.key !== file.key));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs text-body">
            {isArtikel ? "Admin / Konten" : "Admin / Konten / Galeri"}
          </p>
          <h1 className="mt-0.5 font-display text-2xl font-bold text-ink">
            {isArtikel ? "Konten" : "Galeri"}
          </h1>
          <p className="mt-1 text-sm text-body">
            {isArtikel
              ? "Kelola artikel, panduan, dan tips yang tampil di aplikasi."
              : "Kelola foto destinasi yang dipakai di aplikasi dan web."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            onClick={handleExport}
            disabled={activeCount === 0}
            title={isArtikel ? "Ekspor daftar konten" : "Ekspor daftar galeri"}
          >
            <Download aria-hidden className="h-4 w-4" /> Ekspor
          </Button>
          <Button
            className="gap-1.5"
            onClick={() => {
              if (isArtikel) {
                setEditing(null);
                setFormOpen(true);
              } else {
                setUploadOpen(true);
              }
            }}
          >
            <Plus aria-hidden className="h-4 w-4" />
            {isArtikel ? "Tambah Konten" : "Unggah Foto"}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="Jenis konten"
        >
          {(
            [
              { value: "artikel" as const, label: "Artikel", icon: FileText },
              { value: "galeri" as const, label: "Galeri", icon: ImageIcon },
            ] satisfies {
              value: ContentTab;
              label: string;
              icon: typeof FileText;
            }[]
          ).map((item) => {
            const active = tab === item.value;
            const Icon = item.icon;
            const count = item.value === "artikel" ? activeTotal : 0;
            return (
              <button
                key={item.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => changeTab(item.value)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors",
                  active
                    ? "border-primary bg-primary text-on-primary"
                    : "border-hairline bg-surface text-body hover:text-ink",
                )}
              >
                <Icon aria-hidden className="h-4 w-4" />
                {item.label}
                {item.value === "artikel" ? (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px]",
                      active ? "bg-on-primary/20" : "bg-canvas-subtle",
                    )}
                  >
                    {count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setSortOpen(true)}>
            <ArrowDownUp aria-hidden className="h-4 w-4" /> Urutkan
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setFilterOpen(true)}
            title={isArtikel ? "Filter konten" : "Filter wilayah foto"}
          >
            <Filter aria-hidden className="h-4 w-4" /> Filter
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <ActiveSearchChip
          query={search}
          onClear={() => handleSearchChange("")}
        />
        <p className="ml-auto text-xs text-body" aria-live="polite">
          Menampilkan {activeCount} dari {activeTotal}{" "}
          {isArtikel ? "konten" : "foto"}
        </p>
      </div>

      {isArtikel ? (
        <ContentTable
          items={contents}
          pending={contentQuery.isPending}
          errorMessage={activeError}
          onRetry={retry}
          onEdit={(item) => {
            setEditing(item);
            setFormOpen(true);
          }}
          onDelete={deleteContent}
          deletingId={deletingContentId}
          emptyMessage={
            search || kindFilter !== "all" || statusFilter !== "all"
              ? "Tidak ada konten yang cocok dengan filter."
              : "Belum ada konten. Klik Tambah Konten untuk membuat artikel pertama."
          }
        />
      ) : (
        <GalleryGrid
          photos={photos}
          pending={galleryQuery.isPending}
          errorMessage={activeError}
          onRetry={retry}
          onEditRegion={async (photo, region) => {
            try {
              await galleryMutation.update.mutateAsync({
                id: photo.id,
                payload: { region: region === "" ? null : region },
              });
              return true;
            } catch {
              return false;
            }
          }}
          savingRegion={galleryMutation.update.isPending}
          onDelete={deletePhoto}
          deletingId={deletingPhotoId}
          emptyMessage={
            search || regionFilter !== "all"
              ? "Tidak ada foto yang cocok dengan pencarian atau filter."
              : "Belum ada foto. Klik Unggah Foto untuk menambah foto pertama."
          }
        />
      )}

      {totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3 text-xs text-body">
          <span>
            Halaman {page} dari {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Sebelumnya
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              Berikutnya
            </Button>
          </div>
        </div>
      ) : null}

      <ContentFormDialog
        open={formOpen}
        content={editing}
        token={token}
        saving={contentMutation.create.isPending || contentMutation.update.isPending}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={submitContent}
      />

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="w-[460px]">
          <DialogHeader>
            <DialogTitle>Unggah foto</DialogTitle>
            <DialogDescription>
              Foto langsung tersimpan ke galeri setelah unggahan selesai.
            </DialogDescription>
          </DialogHeader>
          <GalleryUploader
            token={token}
            onUploaded={registerUpload}
            disabled={!auth.isAuthenticated}
          />
          {uploadQueue.length > 0 ? (
            <p className="text-xs text-body">
              {uploadQueue.length} foto sedang disimpan…
            </p>
          ) : null}
          {failedUploads.length > 0 ? (
            <div className="space-y-2 rounded-xl border border-danger/40 bg-danger/5 p-3">
              <p className="text-xs font-semibold text-danger">
                {failedUploads.length} foto sudah terunggah tapi gagal disimpan
                ke galeri.
              </p>
              {failedUploads.map((file) => (
                <div
                  key={file.key}
                  className="flex items-center justify-between gap-2 text-xs text-body"
                >
                  <span className="truncate">{file.name}</span>
                  <span className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      className="font-semibold text-primary hover:underline"
                      onClick={() => void registerUpload(file)}
                    >
                      Coba lagi
                    </button>
                    <button
                      type="button"
                      className="font-semibold text-danger hover:underline"
                      onClick={() => void discardFailedUpload(file)}
                    >
                      Buang
                    </button>
                  </span>
                </div>
              ))}
            </div>
          ) : null}
          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setUploadOpen(false)}>
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={sortOpen} onOpenChange={setSortOpen}>
        <DialogContent className="w-[360px]">
          <DialogHeader>
            <DialogTitle>Urutkan</DialogTitle>
          </DialogHeader>
          <Select
            options={isArtikel ? SORT_OPTIONS : GALLERY_SORT_OPTIONS}
            value={isArtikel ? sortValue : gallerySort}
            ariaLabel="Urutan data"
            onChange={applySort}
          />
          <div className="flex justify-end">
            <Button onClick={() => setSortOpen(false)}>Terapkan</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent className="w-[360px]">
          <DialogHeader>
            <DialogTitle>Filter</DialogTitle>
          </DialogHeader>
          {isArtikel ? (
            <div className="space-y-3">
              <div>
                <p className="mb-1 text-xs font-semibold text-ink">Jenis</p>
                <Select
                  options={KIND_FILTERS}
                  value={kindFilter}
                  size="sm"
                  ariaLabel="Filter jenis"
                  onChange={(value) => {
                    setKindFilter(value as "all" | ContentKind);
                    setPage(1);
                  }}
                />
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold text-ink">Status</p>
                <Select
                  options={STATUS_OPTIONS}
                  value={statusFilter}
                  size="sm"
                  ariaLabel="Filter status"
                  onChange={(value) => {
                    setStatusFilter(value as "all" | ContentStatus);
                    setPage(1);
                  }}
                />
              </div>
            </div>
          ) : (
            <div>
              <p className="mb-1 text-xs font-semibold text-ink">Wilayah</p>
              <Select
                options={REGION_OPTIONS}
                value={regionFilter}
                size="sm"
                ariaLabel="Filter wilayah"
                onChange={applyRegion}
              />
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={() => setFilterOpen(false)}>Terapkan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
