"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/lib/actions";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select } from "../ui/select";

const initialState = { error: "", success: "" };

interface ProfileFormProps {
  name: string;
  email: string;
  currency: string;
  salaryAmount: number;
  payday15: boolean;
  payday30: boolean;
}

export function ProfileForm({
  name,
  email,
  currency,
  salaryAmount,
  payday15,
  payday30,
}: ProfileFormProps) {
  const [state, formAction] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="name">
            Нэр
          </label>
          <Input id="name" name="name" defaultValue={name} required />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="email">
            Имэйл
          </label>
          <Input id="email" name="email" type="email" defaultValue={email} required />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="currency">
            Валют
          </label>
          <Select id="currency" name="currency" defaultValue={currency}>
            <option value="MNT">MNT</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </Select>
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm font-medium" htmlFor="salaryAmount">
            Сарын цалин
          </label>
          <Input
            id="salaryAmount"
            name="salaryAmount"
            type="number"
            min={0}
            step="0.01"
            defaultValue={salaryAmount}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="payday15" defaultChecked={payday15} className="h-4 w-4" />{" "}
          <span>15-нд цалин</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="payday30" defaultChecked={payday30} className="h-4 w-4" />{" "}
          <span>30-нд цалин</span>
        </label>
      </div>
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-green-700">{state.success}</p> : null}
      <Button type="submit" className="w-full">
        Хадгалах
      </Button>
    </form>
  );
}
