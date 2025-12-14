"use client";

import { useActionState } from "react";
import { createLoanAction } from "@/lib/actions";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const initialState = { error: "", success: "" };

export function CreateLoanForm() {
  const [state, formAction] = useActionState(createLoanAction, initialState);
  const today = new Date().toISOString().split("T")[0];

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="name">
          Зээлийн нэр
        </label>
        <Input id="name" name="name" required placeholder="Орон сууцны зээл" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="principal">
            Үндсэн дүн
          </label>
          <Input id="principal" name="principal" type="number" min={0} step="0.01" required />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="interestRate">
            Хүү (%)
          </label>
          <Input id="interestRate" name="interestRate" type="number" min={0} step="0.01" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="startDate">
            Эхлэх огноо
          </label>
          <Input id="startDate" name="startDate" type="date" defaultValue={today} required />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="repaymentDay">
            Төлөх өдөр (1-31)
          </label>
          <Input
            id="repaymentDay"
            name="repaymentDay"
            type="number"
            min={1}
            max={31}
            required
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="notes">
          Тэмдэглэл
        </label>
        <Input id="notes" name="notes" placeholder="Нэмэлт тэмдэглэл" />
      </div>
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <Button type="submit" className="w-full">
        Зээл үүсгэх
      </Button>
    </form>
  );
}
