"use client";

import { useState, useActionState } from "react";
import { useRouter } from "next/navigation";

import { createTransactionAction } from "@/lib/actions";
import { TRANSACTION_CATEGORIES, TRANSACTION_TYPES } from "@/lib/constants";
import { displayCategory } from "@/lib/format";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { Modal } from "../ui/modal";
import { cn } from "@/lib/utils";

const initialState = { error: "", success: "" };

type LoanOption = { id: string; name: string };

interface AddTransactionModalProps {
  loans: LoanOption[];
  defaultType?: "INCOME" | "EXPENSE";
  buttonLabel?: string;
  buttonVariant?: "primary" | "secondary" | "ghost";
  buttonClassName?: string;
}

export function AddTransactionModal({
  loans,
  defaultType = TRANSACTION_TYPES[0],
  buttonLabel = "Гүйлгээ нэмэх",
  buttonVariant = "primary",
  buttonClassName,
}: AddTransactionModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [successDismissed, setSuccessDismissed] = useState(true);
  const [state, formAction] = useActionState(createTransactionAction, initialState);

  const handleAction = async (formData: FormData) => {
    setSuccessDismissed(false);
    return formAction(formData);
  };

  const today = new Date().toISOString().split("T")[0];
  const successVisible = Boolean(state.success) && !successDismissed;
  const closeSuccess = () => {
    setOpen(false);
    setSuccessDismissed(true);
    router.refresh();
  };

  return (
    <>
      <Button
        onClick={() => {
          setSuccessDismissed(true);
          setOpen(true);
        }}
        variant={buttonVariant}
        className={cn("w-full px-6 py-3 text-base font-semibold", buttonClassName)}
      >
        {buttonLabel}
      </Button>
      <Modal open={open && !successVisible} onClose={() => setOpen(false)} title="Гүйлгээ нэмэх">
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

      <Modal open={successVisible} onClose={closeSuccess} title="Амжилттай">
        <p className="text-sm text-slate-300">{state.success || "Гүйлгээг хадгаллаа."}</p>
        <div className="flex justify-end">
          <Button type="button" variant="primary" onClick={closeSuccess}>
            OK
          </Button>
        </div>
      </Modal>
    </>
  );
}
