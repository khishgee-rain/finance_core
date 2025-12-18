"use client";

import { useState, useActionState } from "react";
import { createTransactionAction } from "@/lib/actions";
import { TRANSACTION_TYPES, TRANSACTION_CATEGORIES } from "@/lib/constants";
import { displayCategory } from "@/lib/format";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { Modal } from "../ui/modal";

const initialState = { error: "", success: "" };

export function AddQuickTransaction() {
  const [open, setOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [state, formAction] = useActionState(createTransactionAction, initialState);

  const handleAction = async (formData: FormData) => {
    const data = new FormData();

    data.append("type", formData.get("type") as string);
    data.append("amount", formData.get("amount") as string);
    data.append("category", formData.get("category") as string);
    data.append("occurredAt", new Date().toISOString().split("T")[0]);

    const note = formData.get("note");
    if (note) data.append("note", note as string);

    const result = await formAction(data);
    if ((result as any)?.success) {
      setOpen(false);
      setSuccessMessage((result as any).success);
      setSuccessOpen(true);
    }
    return result;
  };

  const closeSuccess = () => {
    setSuccessOpen(false);
    setSuccessMessage("");
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="primary"
        className="w-full px-6 py-3 text-base font-semibold"
      >
        + Гүйлгээ нэмэх
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Гүйлгээ нэмэх">
        <form action={handleAction} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-white text-xs">
                1
              </span>
              Төрөл сонгох
            </label>
            <Select id="type" name="type" defaultValue="INCOME">
              {TRANSACTION_TYPES.map((type) => {
                const label = type === "INCOME" ? "💰 Орлого" : "💸 Зарлага";
                return (
                  <option key={type} value={type}>
                    {label}
                  </option>
                );
              })}
            </Select>
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-semibold text-slate-200 flex items-center gap-2"
              htmlFor="amount"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-white text-xs">
                2
              </span>
              Дүн оруулах
            </label>
            <Input
              id="amount"
              name="amount"
              type="number"
              placeholder="0.00"
              min={0}
              step="0.01"
              required
              autoFocus
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-semibold text-slate-200 flex items-center gap-2"
              htmlFor="category"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-white text-xs">
                3
              </span>
              Ангилал сонгох
            </label>
            <Select id="category" name="category" defaultValue="OTHER">
              {TRANSACTION_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {displayCategory(category)}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-semibold text-slate-200 flex items-center gap-2"
              htmlFor="note"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-700 text-white text-xs">
                4
              </span>
              Тэмдэглэл (сонголтоор)
            </label>
            <Input
              id="note"
              name="note"
              type="text"
              placeholder="Жишээ: Хоол хүнс, Такси зардал..."
            />
          </div>

          {state.error ? <p className="text-sm text-rose-400">{state.error}</p> : null}

          <Button type="submit" className="w-full text-base py-3">
            ✓ Хадгалах
          </Button>
        </form>
      </Modal>

      <Modal open={successOpen} onClose={closeSuccess} title="Амжилттай">
        <p className="text-sm text-slate-300">{successMessage || "Гүйлгээг хадгаллаа."}</p>
        <div className="flex justify-end">
          <Button type="button" variant="primary" onClick={closeSuccess}>
            OK
          </Button>
        </div>
      </Modal>
    </>
  );
}
