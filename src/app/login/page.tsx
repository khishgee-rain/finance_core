import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { Card } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-12">
      <Card className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Дахин тавтай</p>
          <h1 className="text-3xl font-semibold">Нэвтрэх</h1>
          <p className="text-sm text-slate-500">Баталгаатай нэвтрэлт, өгөгдөл нь Postgres дээр хадгалагдана.</p>
        </div>
        <LoginForm />
        <div className="text-sm text-slate-400">
          Эсвэл{" "}
          <Link href="/register" className="underline">
            шинэ бүртгэл үүсгэх
          </Link>
        </div>
      </Card>
    </main>
  );
}
