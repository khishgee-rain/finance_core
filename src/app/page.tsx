import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center gap-10 px-4 py-12">
      <div className="space-y-4">
        <p className="text-sm uppercase tracking-[0.3em] text-foreground/60">Энгийн санхүү</p>
        <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
          Орлого, зарлага, зээлийн мэдээллээ цэвэр хар цагаан орчинд удирдаарай.
        </h1>
        <p className="max-w-2xl text-lg text-foreground/70">
          Имэйл + нууц үгээр нэвтэрч, Prisma + Postgres дээр хадгалсан бодит өгөгдлийг самбар дээр нэг дор харна.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/register">
            <Button>Эхлэх</Button>
          </Link>
          <Link href="/login">
            <Button variant="ghost">Нэвтрэх</Button>
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-stroke bg-white p-4">
          <p className="text-sm font-medium text-foreground/70">Өгөгдөл</p>
          <p className="mt-2 text-lg font-semibold">PostgreSQL + Prisma</p>
        </div>
        <div className="rounded-2xl border border-stroke bg-white p-4">
          <p className="text-sm font-medium text-foreground/70">Нэвтрэлт</p>
          <p className="mt-2 text-lg font-semibold">NextAuth Credentials</p>
        </div>
        <div className="rounded-2xl border border-stroke bg-white p-4">
          <p className="text-sm font-medium text-foreground/70">Цалин</p>
          <p className="mt-2 text-lg font-semibold">15 ба/эсвэл 30-ны өдөр, давхцахгүй</p>
        </div>
      </div>
    </main>
  );
}
