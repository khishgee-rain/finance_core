import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Card } from "@/components/ui/card";
import { displayCategory, formatCurrency, formatDate } from "@/lib/format";
import { getDashboardData, getLoans } from "@/lib/data";
import { GenerateSalaryButton } from "@/components/dashboard/generate-salary";
import { AddQuickTransaction } from "@/components/dashboard/add-quick-transaction";
import { AddTransactionModal } from "@/components/transactions/add-transaction";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const loans = await getLoans(session.user.id);
  const loanOptions = loans.map((loan: any) => ({
    id: loan.id,
    name: loan.name,
  }));

  const currency = session.user.currency || "MNT";

  const data = await getDashboardData(session.user.id);

  const maxValue = Math.max(data.totals.income, data.totals.expense, 1);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-white/70">
                {data.monthLabel}
              </p>
              <h1 className="text-2xl sm:text-3xl font-semibold">Самбар</h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <AddQuickTransaction />
          <AddTransactionModal loans={loanOptions} />
          <GenerateSalaryButton />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-400">Орлого</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {formatCurrency(data.totals.income, currency)}
          </p>
          <div className="mt-4 h-2 w-full rounded-full bg-slate-800">
            <div
              className="h-2 rounded-full bg-primary"
              style={{ width: `${(data.totals.income / maxValue) * 100}%` }}
            />
          </div>
        </Card>

        <Card>
          <p className="text-sm text-slate-400">Зарлага</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {formatCurrency(data.totals.expense, currency)}
          </p>
          <div className="mt-4 h-2 w-full rounded-full bg-slate-800">
            <div
              className="h-2 rounded-full bg-rose-400"
              style={{ width: `${(data.totals.expense / maxValue) * 100}%` }}
            />
          </div>
        </Card>

        <Card>
          <p className="text-sm text-slate-400">Үлдэгдэл</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {formatCurrency(data.totals.balance, currency)}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Үлдэгдэл зээл: {formatCurrency(data.outstandingTotal, currency)}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Сүүлийн гүйлгээ</h2>
            <Link href="/transactions" className="text-sm underline">
              Бүгдийг харах
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {data.recentTransactions.length === 0 ? (
              <p className="text-sm text-slate-400">Одоогоор гүйлгээ алга.</p>
            ) : (
              data.recentTransactions.map((txn: any) => (
                <div
                  key={txn.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 p-3 transition hover:-translate-y-[1px] hover:border-primary/70"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {displayCategory(txn.category)}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatDate(new Date(txn.occurredAt))}
                    </p>
                  </div>
                  <p
                    className={`text-sm font-semibold ${
                      txn.type === "EXPENSE"
                        ? "text-rose-500"
                        : "text-emerald-600"
                    }`}
                    aria-label={txn.type === "INCOME" ? "Орлого" : "Зарлага"}
                  >
                    {txn.type === "EXPENSE" ? "-" : "+"}
                    {formatCurrency(Number(txn.amount), currency)}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Зээл</h2>
            <Link href="/loans" className="text-sm underline">
              Удирдах
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {data.loanSummaries.length === 0 ? (
              <p className="text-sm text-slate-400">Зээл бүртгээгүй байна.</p>
            ) : (
              data.loanSummaries.map((loan: any) => (
                <div
                  key={loan.id}
                  className="rounded-xl border border-white/10 p-3"
                >
                  <p className="text-sm font-semibold">{loan.name}</p>
                  <p className="text-xs text-slate-400">
                    Үлдэгдэл {formatCurrency(loan.outstanding, currency)}
                  </p>
                  <div className="mt-2 h-2 w-full rounded-full bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{
                        width: `${Math.min(
                          100,
                          (loan.paid / Math.max(Number(loan.principal), 1)) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Энэ сар</h2>
          <Link href="/transactions" className="text-sm underline">
            Гүйлгээ нэмэх
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {data.monthTransactions.length === 0 ? (
            <p className="text-sm text-slate-400">Энэ сард гүйлгээ алга.</p>
          ) : (
            data.monthTransactions.map((txn: any) => (
              <div
                key={txn.id}
                className="flex items-center justify-between rounded-xl border border-white/10 p-3 transition hover:-translate-y-[1px] hover:border-primary/70"
              >
                <div>
                  <p className="text-sm font-semibold">
                    {displayCategory(txn.category)}
                  </p>
                  <p className="text-xs text-slate-400">
                    {txn.note || txn.type}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatDate(new Date(txn.occurredAt))}
                  </p>
                </div>
                <p
                  className={`text-sm font-semibold ${
                    txn.type === "EXPENSE"
                      ? "text-rose-500"
                      : "text-emerald-600"
                  }`}
                >
                  {txn.type === "EXPENSE" ? "-" : "+"}
                  {formatCurrency(Number(txn.amount), currency)}
                </p>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
