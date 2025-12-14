import React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({ className, children, variant = "primary", ...props }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:cursor-not-allowed disabled:opacity-50";
  const styles: Record<ButtonVariant, string> = {
    primary: "bg-foreground text-white hover:bg-black",
    secondary: "bg-muted text-foreground hover:bg-foreground hover:text-white border border-stroke",
    ghost: "text-foreground hover:bg-muted",
  };

  return (
    <button className={cn(base, styles[variant], className)} {...props}>
      {children}
    </button>
  );
}
