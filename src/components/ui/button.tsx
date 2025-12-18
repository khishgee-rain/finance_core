import React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  asChild?: boolean;
}

export function Button({ className, children, variant = "primary", asChild, ...props }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50";
  const styles: Record<ButtonVariant, string> = {
    primary:
      "bg-primary text-slate-950 shadow-[0_15px_35px_rgba(56,189,248,0.35)] hover:bg-primary-dark",
    secondary:
      "bg-white text-slate-900 hover:bg-slate-100 border border-stroke hover:border-primary/80 shadow-sm",
    ghost: "text-white hover:bg-white/10",
  };

  if (asChild && React.isValidElement(children)) {
    const childClassName = (children.props as any).className;
    return React.cloneElement(children, {
      className: cn(base, styles[variant], childClassName, className),
    });
  }

  return (
    <button className={cn(base, styles[variant], className)} {...props}>
      {children}
    </button>
  );
}
