import { useMemo, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Command } from "cmdk";
import { IconCheck, IconChevronDown, IconSearch } from "~/components/icons";

/** Ambang jumlah opsi: kolom cari muncul hanya bila opsi lebih dari ini. */
const SEARCH_THRESHOLD = 7;

export interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  /** Izinkan nilai bebas di luar daftar (default true). */
  allowCustom?: boolean;
  emptyText?: string;
  className?: string;
  /** Kustom label nilai terpilih (mis. slug → nama). */
  renderValue?: (value: string) => string;
  /** Ikon di kiri trigger (mis. ikon filter). */
  leading?: React.ReactNode;
}

/**
 * Select bergaya shadcn (Radix Popover + cmdk) dengan pencarian.
 * Kolom cari hanya tampil saat jumlah opsi > {@link SEARCH_THRESHOLD}.
 */
export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Pilih...",
  allowCustom = true,
  emptyText = "Tidak ada hasil.",
  className,
  renderValue,
  leading,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const showSearch = options.length > SEARCH_THRESHOLD;

  const filtered = useMemo(() => {
    if (!showSearch || !query) return options;
    const q = query.toLowerCase();
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, query, showSearch]);

  function commit(next: string) {
    onChange(next);
    setOpen(false);
    setQuery("");
  }

  return (
    <Popover.Root
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setQuery("");
      }}
    >
      <Popover.Trigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className={
            "flex h-11 w-full items-center gap-2 rounded-[10px] border border-hairline bg-canvas px-3.5 text-left text-sm text-ink outline-none hover:border-border-strong focus:border-border-strong data-[state=open]:border-border-strong " +
            (className ?? "")
          }
        >
          {leading && <span className="shrink-0 text-body">{leading}</span>}
          <span className={"flex-1 truncate " + (value ? "" : "text-body/60")}>
            {value ? (renderValue ? renderValue(value) : value) : placeholder}
          </span>
          <IconChevronDown className="h-4 w-4 shrink-0 text-body" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="z-50 w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-[10px] border border-hairline bg-surface shadow-lg outline-none"
        >
          <Command shouldFilter={false} loop className="flex flex-col">
            {showSearch && (
              <div className="flex items-center gap-2 border-b border-hairline px-3">
                <IconSearch className="h-4 w-4 shrink-0 text-body" />
                <Command.Input
                  value={query}
                  onValueChange={setQuery}
                  placeholder="Cari..."
                  className="h-10 w-full bg-transparent text-sm text-ink outline-none placeholder:text-body/60"
                />
              </div>
            )}

            <Command.List className="max-h-64 overflow-y-auto p-1">
              {filtered.length === 0 && (
                <Command.Empty className="px-3 py-6 text-center text-sm text-body">
                  {emptyText}
                </Command.Empty>
              )}
              {filtered.map((option) => {
                const selected = option === value;
                return (
                  <Command.Item
                    key={option}
                    value={option}
                    onSelect={() => commit(option)}
                    className={
                      "flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm text-ink data-[selected=true]:bg-canvas-subtle " +
                      (selected ? "font-semibold" : "")
                    }
                  >
                    <span className="flex-1 truncate">{option}</span>
                    {selected && <IconCheck className="h-4 w-4 shrink-0 text-primary" />}
                  </Command.Item>
                );
              })}
            </Command.List>

            {allowCustom && query.trim() && !options.includes(query.trim()) && (
              <button
                type="button"
                onClick={() => commit(query.trim())}
                className="flex w-full items-center gap-2 border-t border-hairline px-3 py-2.5 text-left text-sm text-primary hover:bg-canvas-subtle"
              >
                <span className="truncate">
                  Pakai &ldquo;{query.trim()}&rdquo;
                </span>
              </button>
            )}

            {!showSearch && value && (
              <button
                type="button"
                onClick={() => commit("")}
                className="w-full border-t border-hairline px-3 py-2.5 text-left text-sm text-body hover:bg-canvas-subtle"
              >
                Kosongkan
              </button>
            )}
          </Command>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
