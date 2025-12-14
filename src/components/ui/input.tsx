import React from "react";
import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-md border border-stroke bg-white px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-foreground focus:ring-opacity-40",
        className
      )}
      {...props}
    />
  );
});
