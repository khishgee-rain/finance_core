import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/actions";

const links = [
  { href: "/dashboard", label: "Самбар" },
  { href: "/transactions", label: "Гүйлгээ" },
  { href: "/loans", label: "Зээл" },
  { href: "/settings", label: "Тохиргоо" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-foreground bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.08),transparent_35%)]">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-neutral-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between gap-3">
            <Link href="/dashboard" className="text-lg font-semibold text-white">
              Энгийн Санхүү
            </Link>
            <p className="text-sm text-slate-400">Сайн уу, {session.user.name}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-100">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-3 py-1 transition hover:bg-white/10 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <form action={logoutAction}>
              <Button variant="ghost" type="submit" className="text-slate-100">
                Гарах
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 text-slate-100 md:px-6">
        {children}
      </main>
    </div>
  );
}
