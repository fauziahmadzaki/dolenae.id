import { Search } from "lucide-react";
import { Select } from "~/components/ui/select";
import { roleOptions } from "../schema";
import { userStatusOptions } from "../status";

interface UsersToolbarProps {
  search: string;
  role: string;
  status: string;
  total: number;
  onSearchChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export function UsersToolbar({
  search,
  role,
  status,
  total,
  onSearchChange,
  onRoleChange,
  onStatusChange,
}: UsersToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="flex h-10 w-full items-center gap-2 rounded-lg border border-hairline bg-surface px-3 sm:w-72">
        <Search aria-hidden className="h-4 w-4 shrink-0 text-body" />
        <span className="sr-only">Cari pengguna</span>
        <input
          type="search"
          placeholder="Cari pengguna"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-body focus:outline-none"
        />
      </label>

      <Select
        ariaLabel="Filter role"
        size="sm"
        value={role}
        onChange={onRoleChange}
        options={[{ value: "", label: "Semua role" }, ...roleOptions]}
        className="w-full sm:w-44"
      />

      <Select
        ariaLabel="Filter status"
        size="sm"
        value={status}
        onChange={onStatusChange}
        options={[{ value: "", label: "Semua status" }, ...userStatusOptions]}
        className="w-full sm:w-44"
      />

      <span className="ml-auto text-sm text-body" aria-live="polite">
        {total} pengguna
      </span>
    </div>
  );
}
