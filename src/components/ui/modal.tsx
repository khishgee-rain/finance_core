import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-neutral-950 p-6 text-slate-100 shadow-card backdrop-blur">
        <div className="mb-4 flex items-center justify-between gap-2">
          {title ? <h3 className="text-lg font-semibold">{title}</h3> : <div />}
          <Button
            variant="ghost"
            aria-label="Close"
            onClick={onClose}
            className="text-slate-300 hover:bg-white/10"
          >
            ✕
          </Button>
        </div>
        <div className={cn("space-y-4")}>{children}</div>
      </div>
    </div>
  );
}
