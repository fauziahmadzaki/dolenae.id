"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "~/lib/cn";

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  danger?: boolean;
  onSelect: () => void;
}

interface MapContextMenuProps {
  /** Position relative to the map container. */
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

/**
 * Floating menu anchored at the cursor inside the map wrapper. It clamps to the
 * parent bounds, closes on outside click/Esc and supports arrow-key navigation.
 */
export function MapContextMenu({ x, y, items, onClose }: MapContextMenuProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState({ x, y });

  useLayoutEffect(() => {
    const menu = menuRef.current;
    const parent = menu?.offsetParent as HTMLElement | null;
    if (!menu || !parent) return;

    const width = menu.offsetWidth;
    const height = menu.offsetHeight;
    const maxX = parent.clientWidth - width - 8;
    const maxY = parent.clientHeight - height - 8;

    setPosition({
      x: Math.max(8, Math.min(x, maxX)),
      y: Math.max(8, Math.min(y, maxY)),
    });
  }, [x, y]);

  useEffect(() => {
    menuRef.current
      ?.querySelector<HTMLButtonElement>('[role="menuitem"]')
      ?.focus();

    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) onClose();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const moveFocus = (direction: 1 | -1) => {
    const buttons = [
      ...(menuRef.current?.querySelectorAll<HTMLButtonElement>(
        '[role="menuitem"]',
      ) ?? []),
    ];
    if (buttons.length === 0) return;
    const current = buttons.findIndex((button) => button === document.activeElement);
    const next = (current + direction + buttons.length) % buttons.length;
    buttons[next]?.focus();
  };

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Menu peta"
      style={{ left: position.x, top: position.y }}
      onKeyDown={(event) => {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          moveFocus(1);
        }
        if (event.key === "ArrowUp") {
          event.preventDefault();
          moveFocus(-1);
        }
      }}
      className="absolute z-[1000] min-w-[210px] rounded-lg border border-hairline bg-surface p-1 shadow-lg outline-none"
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            role="menuitem"
            onClick={() => {
              item.onSelect();
              onClose();
            }}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-ink hover:bg-canvas-subtle focus:bg-canvas-subtle focus:outline-none",
              item.danger && "text-danger hover:bg-danger/10 focus:bg-danger/10",
            )}
          >
            {Icon ? <Icon aria-hidden className="h-4 w-4 shrink-0" /> : null}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
