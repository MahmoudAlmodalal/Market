"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, "id">) => string;
  removeToast: (id: string) => void;
  success: (message: string, title?: string) => string;
  error: (message: string, title?: string) => string;
  warning: (message: string, title?: string) => string;
  info: (message: string, title?: string) => string;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, duration = 3500 }: Omit<ToastItem, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, title?: string) => showToast({ type: "success", message, title }),
    [showToast]
  );

  const error = useCallback(
    (message: string, title?: string) => showToast({ type: "error", message, title }),
    [showToast]
  );

  const warning = useCallback(
    (message: string, title?: string) => showToast({ type: "warning", message, title }),
    [showToast]
  );

  const info = useCallback(
    (message: string, title?: string) => showToast({ type: "info", message, title }),
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        removeToast,
        success,
        error,
        warning,
        info,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      role="region"
      aria-live="polite"
      aria-label="Notifications"
      className="fixed top-4 inset-x-0 z-50 mx-auto w-full max-w-[400px] px-4 flex flex-col gap-2 pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastCard({
  toast,
  onRemove,
}: {
  toast: ToastItem;
  onRemove: (id: string) => void;
}) {
  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 className="w-5 h-5 text-semantic-success shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-semantic-error shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-semantic-warning shrink-0" />,
    info: <Info className="w-5 h-5 text-semantic-info shrink-0" />,
  };

  const borders: Record<ToastType, string> = {
    success: "border-s-4 border-s-semantic-success",
    error: "border-s-4 border-s-semantic-error",
    warning: "border-s-4 border-s-semantic-warning",
    info: "border-s-4 border-s-semantic-info",
  };

  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto w-full bg-white rounded-xl shadow-soft-lg border border-neutral-200/90 p-3.5 flex items-start gap-3",
        "animate-in slide-in-from-top duration-200 transition-all",
        borders[toast.type]
      )}
    >
      <div className="pt-0.5">{icons[toast.type]}</div>

      <div className="flex-1 flex flex-col gap-0.5 text-start">
        {toast.title && (
          <h4 className="text-xs font-bold text-neutral-900 leading-tight">
            {toast.title}
          </h4>
        )}
        <p className="text-xs font-medium text-neutral-700 leading-relaxed">
          {toast.message}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onRemove(toast.id)}
        className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 active:scale-95 transition-all"
        aria-label="Dismiss toast"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default ToastProvider;
