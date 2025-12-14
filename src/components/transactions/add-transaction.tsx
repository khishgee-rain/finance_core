"use client";

import { useState, useActionState } from "react";

import { createTransactionAction } from "@/lib/actions";
import { TRANSACTION_CATEGORIES, TRANSACTION_TYPES } from "@/lib/constants";
import { displayCategory } from "@/lib/format";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { Modal } from "../ui/modal";

const initialState = { error: "", success: "" };

type LoanOption = { id: string; name: string };

export function AddTransactionModal({ loans }: { loans: LoanOption[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(createTransactionAction, initialState);

  const handleAction = async (formData: FormData) => {
    const result = await formAction(formData);
    if ((result as any)?.success) {
      setOpen(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <>
      <Button onClick={() => setOpen(true)}>Гүйлгээ нэмэх</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Гүйлгээ нэмэх">
        <form action={handleAction} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="type">
                Төрөл
              </label>
              <Select id="type" name="type" defaultValue={TRANSACTION_TYPES[0]}>
                {TRANSACTION_TYPES.map((type) => {
                  const label = type === "INCOME" ? "Орлого" : "Зарлага";
                  return (
                    <option key={type} value={type}>
                      {label}
                    </option>
                  );
                })}
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="amount">
                Дүн
              </label>
              <Input id="amount" name="amount" type="number" min={0} step="0.01" required />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="category">
              Ангилал
            </label>
            <Select id="category" name="category" defaultValue="OTHER">
              {TRANSACTION_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {displayCategory(category)}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="occurredAt">
              Огноо
            </label>
            <Input id="occurredAt" name="occurredAt" type="date" defaultValue={today} required />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="loanId">
              Зээлтэй холбох (сонголтоор)
            </label>
            <Select id="loanId" name="loanId" defaultValue="">
              <option value="">Холбохгүй</option>
              {loans.map((loan) => (
                <option key={loan.id} value={loan.id}>
                  {loan.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="note">
              Тэмдэглэл
            </label>
            <Input id="note" name="note" placeholder="Нэмэлт тэмдэглэл" />
          </div>
          {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
          <Button type="submit" className="w-full">
            Хадгалах
          </Button>
        </form>
      </Modal>
    </>
  );
}
