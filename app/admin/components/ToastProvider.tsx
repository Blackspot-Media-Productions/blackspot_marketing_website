"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

type ToastKind = "success" | "error";

type Toast = {
  id: number;
  kind: ToastKind;
  message: string;
};

type ToastApi = {
  success: (message: string) => void;
  error: (message: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

const SUCCESS_MS = 3500;
const ERROR_MS = 5500;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);
  const timers = useRef(new Map<number, number>());

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback((kind: ToastKind, message: string) => {
    const id = nextId.current++;
    setToasts((current) => [...current, { id, kind, message }]);
    const timeout = window.setTimeout(() => dismiss(id), kind === "error" ? ERROR_MS : SUCCESS_MS);
    timers.current.set(id, timeout);
  }, [dismiss]);

  const api = useMemo<ToastApi>(() => ({
    success: (message) => show("success", message),
    error: (message) => show("error", message),
  }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toastStack" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={toast.kind === "error" ? "saveToast saveToastError" : "saveToast"}
            role={toast.kind === "error" ? "alert" : "status"}
          >
            <span>{toast.message}</span>
            <button type="button" onClick={() => dismiss(toast.id)} aria-label="Dismiss notification">
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const toast = useContext(ToastContext);
  if (!toast) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return toast;
}
