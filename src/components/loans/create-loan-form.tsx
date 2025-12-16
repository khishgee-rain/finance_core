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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="paymentInterval">
            Төлбөрийн давтамж (хоног)
          </label>
          <select
            id="paymentInterval"
            name="paymentInterval"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            defaultValue="15"
          >
            <option value="7">7 хоног тутам</option>
            <option value="10">10 хоног тутам</option>
            <option value="15">15 хоног тутам</option>
            <option value="30">30 хоног тутам</option>
            <option value="60">60 хоног тутам</option>
            <option value="90">90 хоног тутам</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="installments">
            Хэдэн хэсэгт хуваах
          </label>
          <select
            id="installments"
            name="installments"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            defaultValue="4"
          >
            <option value="2">2 хэсэг</option>
            <option value="3">3 хэсэг</option>
            <option value="4">4 хэсэг</option>
            <option value="5">5 хэсэг</option>
            <option value="6">6 хэсэг</option>
            <option value="8">8 хэсэг</option>
            <option value="10">10 хэсэг</option>
            <option value="12">12 хэсэг</option>
            <option value="24">24 хэсэг</option>
          </select>
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
