import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreateLoanForm } from "@/components/loans/create-loan-form";
import { formatCurrency, formatDate } from "@/lib/format";
import { getLoans } from "@/lib/data";

export default async function LoansPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const loans = await getLoans(session.user.id);
  const currency = session.user.currency || "MNT";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Зээл</p>
          <h1 className="text-3xl font-semibold">Зээлүүд</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Таны зээлүүд</h2>
          </div>
          {loans.length === 0 ? (
            <p className="text-sm text-slate-400">Одоогоор зээл бүртгээгүй байна.</p>
          ) : (
            <div className="space-y-3">
              {loans.map((loan) => (
                <Card key={loan.id} className="border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{loan.name}</p>
                      <p className="text-xs text-slate-400">
                        Эхэлсэн {formatDate(new Date(loan.startDate))} • Төлөх өдөр {loan.repaymentDay}
                      </p>
                    </div>
                    <Link href={`/loans/${loan.id}`}>
                      <Button variant="secondary">Дэлгэрэнгүй</Button>
                    </Link>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-slate-400">Үндсэн</p>
                      <p className="font-semibold">{formatCurrency(Number(loan.principal), currency)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Төлсөн</p>
                      <p className="font-semibold">{formatCurrency(loan.paid, currency)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Үлдэгдэл</p>
                      <p className="font-semibold">{formatCurrency(loan.outstanding, currency)}</p>
                    </div>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{
                        width: `${Math.min(
                          100,
                          (loan.paid / Math.max(Number(loan.principal), 1)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Зээл үүсгэх</h2>
          <p className="text-sm text-slate-400">Төлөлт, үлдэгдлээ хянах.</p>
          <div className="mt-4">
            <CreateLoanForm />
          </div>
        </Card>
      </div>
    </div>
  );
}
