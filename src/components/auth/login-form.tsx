"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "@/lib/actions";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const initialState = { error: "", success: "" };

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium">
          Имэйл
        </label>
        <Input id="email" name="email" type="email" required placeholder="ta@example.com" />
      </div>
      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium">
          Нууц үг
        </label>
        <Input id="password" name="password" type="password" required minLength={6} />
      </div>
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <Button type="submit" className="w-full">
        Нэвтрэх
      </Button>
      <p className="text-sm text-slate-400">
        Бүртгэлгүй юу?{" "}
        <Link href="/register" className="underline">
          Бүртгүүлэх
        </Link>
      </p>
    </form>
  );
}
