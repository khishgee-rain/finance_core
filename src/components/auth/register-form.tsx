"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction } from "@/lib/actions";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select } from "../ui/select";

const initialState = { error: "", success: "" };

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="name">
          Нэр
        </label>
        <Input id="name" name="name" required placeholder="Жишээ: Бат" />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="email">
          Имэйл
        </label>
        <Input id="email" name="email" type="email" required placeholder="ta@example.com" />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="password">
          Нууц үг
        </label>
        <Input id="password" name="password" type="password" required minLength={6} />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="currency">
            Валют
          </label>
          <Select id="currency" name="currency" defaultValue="MNT">
            <option value="MNT">MNT</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="salaryAmount">
            Сарын цалин (нэмэлт)
          </label>
          <Input id="salaryAmount" name="salaryAmount" type="number" min={0} step="0.01" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="payday15" className="h-4 w-4" /> <span>15-нд цалин</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="payday30" className="h-4 w-4" /> <span>30-нд цалин</span>
        </label>
      </div>
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <Button type="submit" className="w-full">
        Бүртгэл үүсгэх
      </Button>
      <p className="text-sm text-foreground/70">
        Аль хэдийн бүртгэлтэй юу?{" "}
        <Link href="/login" className="underline">
          Нэвтрэх
        </Link>
      </p>
    </form>
  );
}
