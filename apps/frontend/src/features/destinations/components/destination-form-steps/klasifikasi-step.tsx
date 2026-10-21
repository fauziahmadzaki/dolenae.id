import type { Category } from "~/types/domain";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { cn } from "~/lib/cn";
import type { DestinationForm } from "../../schema";
import { difficultyOptions } from "../../schema";
import { CategoryIcon } from "../../category-icon";
import { Field } from "../form-field";
import type { StepProps } from "./types";

interface KlasifikasiStepProps extends StepProps {
  categories: Category[];
  categoriesPending: boolean;
  selectedCount: number;
}

export function KlasifikasiStep({
  values,
  errors,
  set,
  categories,
  categoriesPending,
  selectedCount,
}: KlasifikasiStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-semibold text-ink">
          Kategori{" "}
          <span className="font-normal text-body">({selectedCount} dipilih)</span>
        </p>
        {categoriesPending ? (
          <p className="text-sm text-body">Memuat kategori…</p>
        ) : categories.length === 0 ? (
          <p className="text-sm text-body">
            Belum ada kategori. Tambahkan kategori dari tab Kategori di halaman
            daftar.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const active = values.categoryIds.includes(category.id);
              return (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    set(
                      "categoryIds",
                      active
                        ? values.categoryIds.filter((id) => id !== category.id)
                        : [...values.categoryIds, category.id],
                    )
                  }
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold",
                    active
                      ? "border-primary bg-primary text-on-primary"
                      : "border-hairline bg-surface text-body hover:bg-canvas-subtle",
                  )}
                >
                  <CategoryIcon name={category.icon} className="h-3.5 w-3.5" />
                  {category.name}
                </button>
              );
            })}
          </div>
        )}
        {errors.categoryIds && (
          <p role="alert" className="mt-1 text-xs text-danger">
            {errors.categoryIds}
          </p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Kesulitan" error={errors.difficulty}>
          <Select
            ariaLabel="Kesulitan"
            value={values.difficulty}
            onChange={(value) =>
              set("difficulty", value as DestinationForm["difficulty"])
            }
            options={difficultyOptions}
          />
        </Field>
        <Field
          label="Ketinggian (mdpl)"
          htmlFor="elevationMeters"
          optional
          error={errors.elevationMeters}
        >
          <Input
            id="elevationMeters"
            inputMode="numeric"
            placeholder="2329"
            value={values.elevationMeters}
            onChange={(event) => set("elevationMeters", event.target.value)}
          />
        </Field>
        <Field
          label="Terrain"
          htmlFor="terrain"
          optional
          hint="Pisahkan dengan koma."
          error={errors.terrain}
        >
          <Input
            id="terrain"
            placeholder="Gunung, Bukit"
            value={values.terrain}
            onChange={(event) => set("terrain", event.target.value)}
          />
        </Field>
        <Field
          label="Aktivitas"
          htmlFor="activities"
          optional
          hint="Pisahkan dengan koma."
          error={errors.activities}
        >
          <Input
            id="activities"
            placeholder="Hiking, Camping"
            value={values.activities}
            onChange={(event) => set("activities", event.target.value)}
          />
        </Field>
        <Field
          label="Musim terbaik"
          htmlFor="bestSeason"
          optional
          error={errors.bestSeason}
        >
          <Input
            id="bestSeason"
            placeholder="April – Oktober"
            value={values.bestSeason}
            onChange={(event) => set("bestSeason", event.target.value)}
          />
        </Field>
        <Field label="Tag" htmlFor="tags" optional error={errors.tags}>
          <Input
            id="tags"
            placeholder="sunrise, kawah"
            value={values.tags}
            onChange={(event) => set("tags", event.target.value)}
          />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={values.guideRequired}
          onChange={(event) => set("guideRequired", event.target.checked)}
          className="h-4 w-4 rounded border-border-strong text-primary focus-visible:ring-primary"
        />
        Wajib didampingi pemandu
      </label>
    </div>
  );
}
