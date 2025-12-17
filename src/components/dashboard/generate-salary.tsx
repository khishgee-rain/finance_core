"use client";

import { useActionState } from "react";
import { generateSalaryForMonth } from "@/lib/actions";
import { Button } from "../ui/button";

const initialState = { error: "", success: "" };

export function GenerateSalaryButton() {
  const [state, formAction] = useActionState(generateSalaryForMonth, initialState);

  return (
    <form action={formAction} className="space-y-1">
      <Button variant="secondary" type="submit" className="w-full px-6 py-3 text-base font-semibold">
        💰 Цалин баталгаажуулах
      </Button>
      {state.error ? <p className="text-xs text-rose-400">{state.error}</p> : null}
      {state.success ? <p className="text-xs text-emerald-400">{state.success}</p> : null}
    </form>
  );
}
