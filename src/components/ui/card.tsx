import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-stroke bg-white p-5 shadow-card",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
