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
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 border-b border-stroke bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between gap-3">
            <Link href="/dashboard" className="text-lg font-semibold">
              Энгийн Санхүү
            </Link>
            <p className="text-sm text-foreground/60">Сайн уу, {session.user.name}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-full px-3 py-1 hover:bg-muted">
                {link.label}
              </Link>
            ))}
            <form action={logoutAction}>
              <Button variant="ghost" type="submit">
                Гарах
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6">{children}</main>
    </div>
  );
}
