import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-neutral-900/80 p-5 text-slate-100 shadow-card backdrop-blur",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
