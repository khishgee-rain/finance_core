"use client";

import { useActionState } from "react";
import { recordPaymentAction } from "@/lib/actions";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const initialState = { error: "", success: "" };

export function PaymentForm({ loanId }: { loanId: string }) {
  const [state, formAction] = useActionState(recordPaymentAction, initialState);
  const today = new Date().toISOString().split("T")[0];

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="loanId" value={loanId} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="amount">
            Дүн
          </label>
          <Input id="amount" name="amount" type="number" min={0} step="0.01" required />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="paidAt">
            Төлсөн огноо
          </label>
          <Input id="paidAt" name="paidAt" type="date" defaultValue={today} required />
        </div>
      </div>
      {state.error ? <p className="text-sm text-rose-400">{state.error}</p> : null}
      <Button type="submit" className="w-full">
        Төлбөр бүртгэх
      </Button>
    </form>
  );
}
