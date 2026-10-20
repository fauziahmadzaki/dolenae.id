import { Search } from "lucide-react";
import type { Category } from "~/types/domain";
import { difficultyOptions, statusOptions } from "../schema";

interface DestinationsToolbarProps {
  search: string;
  difficulty: string;
  status: string;
  categoryId: string;
  categories: Category[];
  total: number;
  onSearchChange: (value: string) => void;
  onDifficultyChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

const selectClass =
  "h-10 rounded-lg border border-hairline bg-surface px-3 text-sm text-ink";

export function DestinationsToolbar({
  search,
  difficulty,
  status,
  categoryId,
  categories,
  total,
  onSearchChange,
  onDifficultyChange,
  onStatusChange,
  onCategoryChange,
}: DestinationsToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="flex h-10 w-full items-center gap-2 rounded-lg border border-hairline bg-surface px-3 sm:w-72">
        <Search aria-hidden className="h-4 w-4 shrink-0 text-body" />
        <span className="sr-only">Cari destinasi</span>
        <input
          type="search"
          placeholder="Cari destinasi"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-body focus:outline-none"
        />
      </label>

      <select
        aria-label="Filter kesulitan"
        value={difficulty}
        onChange={(event) => onDifficultyChange(event.target.value)}
        className={selectClass}
      >
        <option value="">Semua kesulitan</option>
        {difficultyOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter status"
        value={status}
        onChange={(event) => onStatusChange(event.target.value)}
        className={selectClass}
      >
        <option value="">Semua status</option>
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter kategori"
        value={categoryId}
        onChange={(event) => onCategoryChange(event.target.value)}
        className={selectClass}
      >
        <option value="">Semua kategori</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      <span className="ml-auto text-sm text-body" aria-live="polite">
        {total} destinasi
      </span>
    </div>
  );
}
