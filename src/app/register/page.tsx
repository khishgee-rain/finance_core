import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Card } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/register-form";

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-4 py-12">
      <Card className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Нэгдэх</p>
          <h1 className="text-3xl font-semibold">Бүртгэл үүсгэх</h1>
          <p className="text-sm text-slate-500">Цалин, цалингийн өдрөө одоо тохируулаад дараагийн тооцоогоо жигд аваарай.</p>
        </div>
        <RegisterForm />
      </Card>
    </main>
  );
}
