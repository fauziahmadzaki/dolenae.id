"use client";

import * as Popover from "@radix-ui/react-popover";
import { Command } from "cmdk";
import { Check, ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "~/lib/cn";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  /** `md` mengikuti `Input (Alam)` (48px); `sm` untuk toolbar (40px). */
  size?: "sm" | "md";
  disabled?: boolean;
  id?: string;
  ariaLabel?: string;
  className?: string;
}

/**
 * Select/combobox sesuai komponen `Input (Alam)` di design system:
 * radius 12, border hairline 1px (border-strong saat fokus), fill canvas-subtle.
 * Kotak pencarian muncul bila opsi lebih dari 7.
 */
export function Select({
  options,
  value,
  onChange,
  placeholder = "Pilih...",
  searchPlaceholder = "Cari...",
  emptyText = "Tidak ada hasil.",
  size = "md",
  disabled = false,
  id,
  ariaLabel,
  className,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = options.find((option) => option.value === value);
  const showSearch = options.length > 7;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(needle),
    );
  }, [options, query]);

  return (
    <Popover.Root
      open={open && !disabled}
      onOpenChange={(next) => {
        if (disabled) return;
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <Popover.Trigger asChild disabled={disabled}>
        <button
          id={id}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-label={ariaLabel}
          disabled={disabled}
          className={cn(
            "flex w-full items-center justify-between gap-2 rounded-lg border border-hairline bg-canvas-subtle text-left text-sm",
            "focus-visible:border-border-strong focus-visible:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            size === "md" ? "h-12 px-3.5" : "h-10 px-3",
            className,
          )}
        >
          <span
            className={cn("truncate", selected ? "text-ink" : "text-body")}
          >
            {selected?.label ?? placeholder}
          </span>
          <ChevronDown aria-hidden className="h-4 w-4 shrink-0 text-body" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          sideOffset={4}
          className={cn(
            "z-50 w-[var(--radix-popover-trigger-width)] rounded-lg border border-hairline bg-surface p-1 shadow-md outline-none",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:duration-150",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:duration-100",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
            "data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2",
          )}
        >
          <Command shouldFilter={false}>
            {showSearch && (
              <Command.Input
                value={query}
                onValueChange={setQuery}
                placeholder={searchPlaceholder}
                className="h-10 w-full rounded-md bg-canvas-subtle px-3 text-sm text-ink outline-none placeholder:text-body"
              />
            )}
            <Command.List className="max-h-64 overflow-auto py-1">
              <Command.Empty className="px-3 py-6 text-center text-sm text-body">
                {emptyText}
              </Command.Empty>
              {filtered.map((option) => (
                <Command.Item
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    onChange?.(option.value);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-ink data-[selected=true]:bg-canvas-subtle"
                >
                  <Check
                    className={cn(
                      "h-4 w-4 text-primary",
                      value === option.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="truncate">{option.label}</span>
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
