"use client";

import * as React from "react";
import * as Toast from "@radix-ui/react-toast";
import { cn } from "@/lib/utils";

type ToastMessage = {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "success" | "destructive";
};

const ToastContext = React.createContext<{
  toasts: ToastMessage[];
  add: (t: Omit<ToastMessage, "id">) => void;
}>({ toasts: [], add: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);
  const add = React.useCallback((t: Omit<ToastMessage, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...t, id }]);
  }, []);
  const remove = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);
  return (
    <ToastContext.Provider value={{ toasts, add }}>
      {children}
      <Toast.Provider>
        {toasts.map((t) => (
          <Toast.Root
            key={t.id}
            onOpenChange={(open) => {
              if (!open) remove(t.id);
            }}
            duration={4000}
            className={cn(
              "pointer-events-auto rounded-md border p-4 shadow-lg",
              t.variant === "destructive" && "border-[#FEE2E2] bg-[#FEF2F2] text-[#991B1B]",
              t.variant === "success" && "border-[#D1FAE5] bg-[#ECFDF5] text-[#065F46]",
              (!t.variant || t.variant === "default") && "border-[#E2E8F0] bg-white text-[#0F172A]"
            )}
          >
            {t.title && <Toast.Title className="font-semibold">{t.title}</Toast.Title>}
            {t.description && (
              <Toast.Description className="text-sm opacity-90">{t.description}</Toast.Description>
            )}
            <Toast.Close className="absolute right-2 top-2 rounded p-1 hover:bg-[#F1F5F9]" />
          </Toast.Root>
        ))}
        <Toast.Viewport className="fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]" />
      </Toast.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    return {
      toast: (opts: { title?: string; description?: string; variant?: "default" | "success" | "destructive" }) => {},
    };
  }
  return {
    toast: (opts: { title?: string; description?: string; variant?: "default" | "success" | "destructive" }) => {
      ctx.add({ title: opts.title, description: opts.description, variant: opts.variant });
    },
  };
}
