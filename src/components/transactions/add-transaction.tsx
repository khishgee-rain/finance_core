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

interface AddTransactionModalProps {
  loans: LoanOption[];
  defaultType?: "INCOME" | "EXPENSE";
  buttonLabel?: string;
  buttonVariant?: "primary" | "secondary" | "ghost";
}

export function AddTransactionModal({
  loans,
  defaultType = TRANSACTION_TYPES[0],
  buttonLabel = "Гүйлгээ нэмэх",
  buttonVariant = "primary"
}: AddTransactionModalProps) {
  const [open, setOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [state, formAction] = useActionState(createTransactionAction, initialState);

  const handleAction = async (formData: FormData) => {
    const result = await formAction(formData);
    if ((result as any)?.success) {
      setOpen(false);
      setSuccessMessage((result as any).success);
      setSuccessOpen(true);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <>
      <Button onClick={() => setOpen(true)} variant={buttonVariant} className="w-full px-6 py-3 text-base font-semibold">{buttonLabel}</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Гүйлгээ нэмэх">
        <form action={handleAction} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="type">
                Төрөл
              </label>
              <Select id="type" name="type" defaultValue={defaultType}>
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
          {state.error ? <p className="text-sm text-rose-400">{state.error}</p> : null}
          <Button type="submit" className="w-full">
            Хадгалах
          </Button>
        </form>
      </Modal>

      <Modal
        open={successOpen}
        onClose={() => {
          setSuccessOpen(false);
          setSuccessMessage("");
        }}
        title="Амжилттай"
      >
        <p className="text-sm text-slate-300">{successMessage || "Гүйлгээг хадгаллаа."}</p>
        <div className="flex justify-end">
          <Button
            type="button"
            variant="primary"
            onClick={() => {
              setSuccessOpen(false);
              setSuccessMessage("");
            }}
          >
            OK
          </Button>
        </div>
      </Modal>
    </>
  );
}
