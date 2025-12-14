import React from "react";
import { cn } from "@/lib/utils";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, children, ...props },
  ref
) {
  return (
    <select
      ref={ref}
      className={cn(
        "w-full rounded-md border border-stroke bg-white px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-foreground focus:ring-opacity-40",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
});
