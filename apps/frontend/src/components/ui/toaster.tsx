"use client";

import * as Toast from "@radix-ui/react-toast";
import { AlertTriangle, Check, Info, type LucideIcon } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { cn } from "~/lib/cn";

type ToastVariant = "info" | "success" | "danger";

const DEFAULT_DURATION = 2500;

interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
  /** Auto-dismiss in ms. Default 2500. */
  duration?: number;
}

interface ToastItem extends ToastInput {
  id: number;
}

interface ToastContextValue {
  toast: (input: ToastInput) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const variants: Record<ToastVariant, { bg: string; Icon: LucideIcon }> = {
  info: { bg: "bg-primary", Icon: Info },
  success: { bg: "bg-success", Icon: Check },
  danger: { bg: "bg-danger", Icon: AlertTriangle },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((input: ToastInput) => {
    setItems((prev) => [...prev, { id: Date.now() + Math.random(), ...input }]);
  }, []);

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const value = useMemo<ToastContextValue>(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      <Toast.Provider swipeDirection="right" duration={DEFAULT_DURATION}>
        {children}
        {items.map((item) => {
          const { bg, Icon } = variants[item.variant ?? "info"];
          return (
            <Toast.Root
              key={item.id}
              duration={item.duration ?? DEFAULT_DURATION}
              onOpenChange={(open) => {
                if (!open) remove(item.id);
              }}
              className={cn(
                "flex w-full items-start gap-3 rounded-lg px-3.5 py-3 text-on-primary shadow-lg",
                "data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=open]:duration-300",
                "data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:duration-200",
                "data-[swipe=end]:animate-out data-[swipe=end]:slide-out-to-right data-[swipe=end]:duration-200",
                "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
                "data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-transform",
                bg,
              )}
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <Toast.Title className="text-sm font-semibold">
                  {item.title}
                </Toast.Title>
                {item.description && (
                  <Toast.Description className="text-sm text-on-primary/80">
                    {item.description}
                  </Toast.Description>
                )}
              </div>
            </Toast.Root>
          );
        })}
        <Toast.Viewport className="fixed bottom-0 right-0 z-[100] flex w-full max-w-[380px] flex-col gap-2 p-4 outline-none sm:p-6" />
      </Toast.Provider>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast harus dipakai di dalam <ToastProvider>");
  return ctx;
}
