import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import type { Category, CategoryType, Destination, DestinationStatus } from "@dolenae/types";
import { useAuth } from "~/features/auth/auth-context";
import {
  adminListDestinations,
  createCategory,
  deleteCategory,
  deleteDestination,
  listCategories,
  updateCategory,
} from "~/features/destinations/api";
import {
  IconByName,
  IconChevronLeft,
  IconChevronRight,
  IconFilter,
  IconLayoutGrid,
  IconMapPin,
  IconMountain,
  IconMoreVertical,
  IconPencil,
  IconPlus,
  IconSearch,
  IconTable,
  IconTag,
  IconTrash2,
} from "~/components/icons";
import { CategoryDialog } from "~/components/admin/category-dialog";
import { SearchableSelect } from "~/components/ui/searchable-select";

type Tab = "kategori" | "destinasi";
type View = "tabel" | "card";

export const Route = createFileRoute("/admin/categories")({
  validateSearch: (search: Record<string, unknown>): { tab?: Tab } => ({
    tab: search.tab === "destinasi" ? "destinasi" : undefined,
  }),
  component: CategoriesPage,
});

const DIFF_LABEL: Record<string, string> = {
  "ramah-pemula": "Ramah pemula",
  menengah: "Menengah",
  sulit: "Sulit",
  "butuh-lokal-guide": "Butuh lokal guide",
};

const DIFF_TONE: Record<string, string> = {
  "ramah-pemula": "bg-success",
  menengah: "bg-warning",
  sulit: "bg-danger",
  "butuh-lokal-guide": "bg-danger",
};

const PAGE_LIMIT = 10;

function CategoriesPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const { tab: tabParam } = Route.useSearch();
  const tab: Tab = tabParam ?? "kategori";

  function setTab(next: Tab) {
    void navigate({
      to: "/admin/categories",
      search: next === "destinasi" ? { tab: "destinasi" } : {},
      replace: true,
    });
  }

  // Kategori
  const [categories, setCategories] = useState<Category[]>([]);
  const [katType, setKatType] = useState<CategoryType>("terrain");
  const [dialog, setDialog] = useState<{ open: boolean; editing: Category | null }>({
    open: false,
    editing: null,
  });

  // Destinasi
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [view, setView] = useState<View>("tabel");
  const [search, setSearch] = useState("");
  const [terrain, setTerrain] = useState("");
  const [status, setStatus] = useState<"" | DestinationStatus>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    void listCategories({}, token ?? undefined)
      .then(setCategories)
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!token) return;
    let active = true;
    setLoading(true);
    setError(null);
    adminListDestinations(token, {
      page,
      limit: PAGE_LIMIT,
      search: search || undefined,
      terrain: terrain || undefined,
      status: status || undefined,
    })
      .then((res) => {
        if (!active) return;
        setDestinations(res.items);
        setTotal(res.total);
      })
      .catch((e: Error) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token, page, search, terrain, status]);

  const terrainCats = useMemo(() => categories.filter((c) => c.type === "terrain"), [categories]);
  const shownCategories = useMemo(
    () => categories.filter((c) => c.type === katType),
    [categories, katType],
  );

  function countForCategory(slug: string) {
    return destinations.filter(
      (d) => (d.terrain as string[]).includes(slug) || (d.activities as string[]).includes(slug),
    ).length;
  }

  async function onSaveCategory(input: {
    name: string;
    slug?: string;
    type: CategoryType;
    icon?: string;
    description?: string;
  }) {
    if (!token) return;
    if (dialog.editing) {
      await updateCategory(token, dialog.editing.id, input);
    } else {
      await createCategory(token, input);
    }
    setDialog({ open: false, editing: null });
    setCategories(await listCategories({}, token));
  }

  async function onDeleteCategory(id: string) {
    if (!token) return;
    if (!confirm("Hapus kategori ini?")) return;
    await deleteCategory(token, id);
    setCategories(await listCategories({}, token));
  }

  async function onDeleteDestination(id: string) {
    if (!token) return;
    if (!confirm("Hapus destinasi ini beserta fasilitasnya?")) return;
    await deleteDestination(token, id);
    const res = await adminListDestinations(token, { page, limit: PAGE_LIMIT });
    setDestinations(res.items);
    setTotal(res.total);
  }

  if (!isAdmin) {
    return (
      <div className="rounded-xl border border-warning/40 bg-warning/10 p-6">
        <h1 className="font-semibold text-ink">Akses dibatasi</h1>
        <p className="mt-1 text-sm text-body">Halaman ini hanya untuk admin.</p>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));
  const from = total === 0 ? 0 : (page - 1) * PAGE_LIMIT + 1;
  const to = Math.min(page * PAGE_LIMIT, total);

  return (
    <div className="space-y-6">
      {/* PageHead */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-bold leading-6 text-ink">Kategori &amp; Destinasi</h1>
          <p className="mt-1 text-sm text-body">
            Kelola kategori destinasi serta daftar destinasi.
          </p>
        </div>
        {tab === "kategori" ? (
          <button
            onClick={() => setDialog({ open: true, editing: null })}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary hover:bg-primary-hover"
          >
            <IconPlus className="h-4 w-4" />
            Tambah kategori
          </button>
        ) : (
          <Link
            to="/admin/destinations/new"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary hover:bg-primary-hover"
          >
            <IconPlus className="h-4 w-4" />
            Tambah destinasi
          </Link>
        )}
      </div>

      {/* TabBar */}
      <div className="flex gap-6 border-b border-hairline">
        <TabButton active={tab === "kategori"} onClick={() => setTab("kategori")} icon={<IconTag className="h-4 w-4" />}>
          Kategori
        </TabButton>
        <TabButton active={tab === "destinasi"} onClick={() => setTab("destinasi")} icon={<IconMountain className="h-4 w-4" />}>
          Destinasi
        </TabButton>
      </div>

      {error && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
      )}

      {tab === "kategori" ? (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-1 rounded-full bg-surface-2 p-1">
              <SegButton active={katType === "terrain"} onClick={() => setKatType("terrain")} icon={<IconMountain className="h-3.5 w-3.5" />}>
                Terrain
              </SegButton>
              <SegButton active={katType === "activity"} onClick={() => setKatType("activity")} icon={<IconByName name="lucide:footprints" className="h-3.5 w-3.5" />}>
                Aktivitas
              </SegButton>
            </div>
            <span className="text-[13px] text-body">{shownCategories.length} kategori</span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {shownCategories.map((c) => (
              <article key={c.id} className="flex flex-col gap-3 rounded-xl border border-hairline bg-surface p-4 transition hover:border-border-strong">
                <div className="flex items-start justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-canvas-subtle text-primary">
                    <IconByName name={c.icon} className="h-[18px] w-[18px]" />
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setDialog({ open: true, editing: c })}
                      aria-label="Edit kategori"
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-2 text-body hover:text-ink"
                    >
                      <IconPencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteCategory(c.id)}
                      aria-label="Hapus kategori"
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-2 text-body hover:text-danger"
                    >
                      <IconTrash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-ink">{c.name}</p>
                  <p className="mt-0.5 text-xs text-body">{countForCategory(c.slug)} destinasi</p>
                </div>
              </article>
            ))}
            {shownCategories.length === 0 && (
              <p className="text-sm text-body">Belum ada kategori.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* DesToolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-10 w-[300px] items-center gap-2 rounded-[10px] border border-hairline bg-surface px-3 focus-within:border-border-strong">
                <IconSearch className="h-4 w-4 shrink-0 text-body" />
                <input
                  value={search}
                  onChange={(e) => {
                    setPage(1);
                    setSearch(e.target.value);
                  }}
                  placeholder="Cari destinasi"
                  className="w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-body/70"
                />
              </div>

              <FilterSelect
                icon={<IconFilter className="h-4 w-4" />}
                value={terrain}
                onChange={(v) => {
                  setPage(1);
                  setTerrain(v);
                }}
                placeholder="Terrain"
                options={terrainCats.map((c) => c.slug)}
                labels={Object.fromEntries(terrainCats.map((c) => [c.slug, c.name]))}
              />
              <FilterSelect
                value={status}
                onChange={(v) => {
                  setPage(1);
                  setStatus(v as "" | DestinationStatus);
                }}
                placeholder="Status"
                options={["published", "draft"]}
                labels={{ published: "Published", draft: "Draft" }}
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[13px] text-body">{total} destinasi</span>
              <div className="inline-flex items-center gap-1 rounded-[10px] bg-surface-2 p-1">
                <ViewButton active={view === "tabel"} onClick={() => setView("tabel")} icon={<IconTable className="h-3.5 w-3.5" />}>
                  Tabel
                </ViewButton>
                <ViewButton active={view === "card"} onClick={() => setView("card")} icon={<IconLayoutGrid className="h-3.5 w-3.5" />}>
                  Card
                </ViewButton>
              </div>
            </div>
          </div>

          {loading ? (
            <p className="py-6 text-sm text-body">Memuat...</p>
          ) : view === "tabel" ? (
            <DestinationTable
              destinations={destinations}
              onDelete={onDeleteDestination}
            />
          ) : (
            <DestinationCards
              destinations={destinations}
              onDelete={onDeleteDestination}
            />
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between text-sm text-body">
            <span>
              Menampilkan {from}-{to} dari {total} destinasi
            </span>
            <div className="flex items-center gap-2">
              <PageBtn disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                <IconChevronLeft className="h-4 w-4" />
              </PageBtn>
              <span className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-primary px-2 text-[13px] font-semibold text-on-primary">
                {page}
              </span>
              <PageBtn disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                <IconChevronRight className="h-4 w-4" />
              </PageBtn>
            </div>
          </div>
        </div>
      )}

      {dialog.open && (
        <CategoryDialog
          editing={dialog.editing}
          onClose={() => setDialog({ open: false, editing: null })}
          onSave={onSaveCategory}
        />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: Readonly<{ active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }>) {
  return (
    <button
      onClick={onClick}
      className={
        "-mb-px inline-flex items-center gap-2 border-b-2 pb-2.5 text-sm font-semibold transition " +
        (active ? "border-primary text-primary" : "border-transparent text-body hover:text-ink")
      }
    >
      {icon}
      {children}
    </button>
  );
}

function SegButton({
  active,
  onClick,
  icon,
  children,
}: Readonly<{ active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }>) {
  return (
    <button
      onClick={onClick}
      className={
        "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition " +
        (active ? "bg-surface text-ink shadow-sm" : "text-body hover:text-ink")
      }
    >
      {icon}
      {children}
    </button>
  );
}

function ViewButton({
  active,
  onClick,
  icon,
  children,
}: Readonly<{ active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }>) {
  return (
    <button
      onClick={onClick}
      className={
        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition " +
        (active ? "bg-surface text-ink shadow-sm" : "text-body hover:text-ink")
      }
    >
      {icon}
      {children}
    </button>
  );
}

function FilterSelect({
  icon,
  value,
  onChange,
  placeholder,
  options,
  labels,
}: Readonly<{
  icon?: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: string[];
  labels?: Record<string, string>;
}>) {
  return (
    <SearchableSelect
      value={value}
      options={options}
      placeholder={placeholder}
      allowCustom={false}
      emptyText="Tidak ada pilihan."
      onChange={onChange}
      className="h-10 w-auto min-w-[140px] bg-surface text-[13px]"
      renderValue={(v) => labels?.[v] ?? v}
      leading={icon}
    />
  );
}

function PageBtn({
  disabled,
  onClick,
  children,
}: Readonly<{ disabled: boolean; onClick: () => void; children: React.ReactNode }>) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-hairline bg-surface text-body transition hover:text-ink disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function DifficultyPill({ difficulty }: Readonly<{ difficulty: string }>) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold text-ink">
      <span className={`h-1.5 w-1.5 rounded-full ${DIFF_TONE[difficulty] ?? "bg-body"}`} />
      {DIFF_LABEL[difficulty] ?? difficulty}
    </span>
  );
}

function StatusPill({ status }: Readonly<{ status: string }>) {
  const published = status === "published";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold text-ink">
      <span className={`h-1.5 w-1.5 rounded-full ${published ? "bg-success" : "bg-border-strong"}`} />
      {published ? "Published" : "Draft"}
    </span>
  );
}

function TerrainChips({ values }: Readonly<{ values: string[] }>) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {values.map((v) => (
        <span key={v} className="rounded-full bg-canvas-subtle px-2 py-0.5 text-xs text-body">
          {v}
        </span>
      ))}
    </div>
  );
}

function DestinationTable({
  destinations,
  onDelete,
}: Readonly<{
  destinations: Destination[];
  onDelete: (id: string) => void;
}>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-hairline bg-surface">
      <table className="w-full min-w-[1000px] text-left text-sm">
        <thead className="bg-surface-2 text-[11px] uppercase tracking-wide text-body">
          <tr>
            <th className="w-[234px] px-6 py-3.5 font-semibold">Destinasi</th>
            <th className="w-[120px] px-6 py-3.5 font-semibold">Provinsi</th>
            <th className="w-[200px] px-6 py-3.5 font-semibold">Terrain</th>
            <th className="w-[130px] px-6 py-3.5 font-semibold">Kesulitan</th>
            <th className="w-[90px] px-6 py-3.5 font-semibold">Fasilitas</th>
            <th className="w-[120px] px-6 py-3.5 font-semibold">Status</th>
            <th className="w-[80px] px-6 py-3.5 font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline">
          {destinations.map((d, i) => (
            <tr key={d.id} className={i % 2 === 1 ? "bg-canvas" : ""}>
              <td className="px-6 py-3.5">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-canvas-subtle text-primary">
                    <IconMountain className="h-[18px] w-[18px]" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{d.name}</p>
                    <p className="truncate text-xs text-body">/{d.slug}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-3.5 text-body">{d.location.province}</td>
              <td className="px-6 py-3.5">
                <TerrainChips values={d.terrain} />
              </td>
              <td className="px-6 py-3.5">
                <DifficultyPill difficulty={d.difficulty} />
              </td>
              <td className="px-6 py-3.5 text-body">{d.supportsCount ?? 0}</td>
              <td className="px-6 py-3.5">
                <StatusPill status={d.status} />
              </td>
              <td className="px-6 py-3.5">
                <div className="flex gap-2">
                  <Link
                    to="/admin/destinations/$id/edit"
                    params={{ id: d.id }}
                    aria-label="Edit destinasi"
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-body hover:text-ink"
                  >
                    <IconPencil className="h-3.5 w-3.5" />
                  </Link>
                  <button
                    onClick={() => onDelete(d.id)}
                    aria-label="Hapus destinasi"
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-body hover:text-danger"
                  >
                    <IconTrash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {destinations.length === 0 && (
            <tr>
              <td colSpan={7} className="px-6 py-6 text-body">
                Belum ada destinasi.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function DestinationCards({
  destinations,
  onDelete,
}: Readonly<{
  destinations: Destination[];
  onDelete: (id: string) => void;
}>) {
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (!openId) return;
    const close = () => setOpenId(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [openId]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {destinations.map((d) => (
        <article key={d.id} className="rounded-2xl border border-hairline bg-surface">
          <div
            className="relative flex h-[140px] items-start justify-between rounded-t-2xl bg-canvas-subtle bg-cover bg-center p-2.5"
            style={d.images[0] ? { backgroundImage: `url(${d.images[0]})` } : undefined}
          >
            <span className="rounded-full bg-surface px-2.5 py-1 text-[11px] font-semibold text-ink shadow-sm">
              {d.status === "published" ? "Published" : "Draft"}
            </span>

            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                aria-label="Aksi destinasi"
                aria-expanded={openId === d.id}
                onClick={() => setOpenId((cur) => (cur === d.id ? null : d.id))}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface text-ink shadow-sm hover:bg-canvas"
              >
                <IconMoreVertical className="h-4 w-4" />
              </button>

              {openId === d.id && (
                <div className="absolute right-0 top-8 z-20 w-44 overflow-hidden rounded-xl border border-hairline bg-surface py-1 shadow-lg">
                  <Link
                    to="/admin/destinations/$id/edit"
                    params={{ id: d.id }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-surface-2"
                  >
                    <IconPencil className="h-4 w-4 text-body" />
                    Edit destinasi
                  </Link>
                  <a
                    href={`/destinations/${d.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-surface-2"
                  >
                    <IconMapPin className="h-4 w-4 text-body" />
                    Lihat publik
                  </a>
                  <button
                    onClick={() => {
                      setOpenId(null);
                      onDelete(d.id);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-danger hover:bg-danger/10"
                  >
                    <IconTrash2 className="h-4 w-4" />
                    Hapus destinasi
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 p-3.5">
            <p className="truncate text-[15px] font-semibold text-ink">{d.name}</p>
            <TerrainChips values={d.terrain} />
            <p className="flex items-center gap-1.5 text-xs text-body">
              <IconMapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                {d.location.province}
                {d.elevationMeters ? ` · ${d.elevationMeters} mdpl` : ""}
              </span>
            </p>
            <div className="flex items-center justify-between">
              <DifficultyPill difficulty={d.difficulty} />
              <span className="text-xs text-body">{d.supportsCount ?? 0} fasilitas</span>
            </div>
          </div>
        </article>
      ))}
      {destinations.length === 0 && (
        <p className="text-sm text-body">Belum ada destinasi.</p>
      )}
    </div>
  );
}
