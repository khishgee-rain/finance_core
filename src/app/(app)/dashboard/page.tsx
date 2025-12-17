import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { displayCategory, formatCurrency, formatDate } from "@/lib/format";
import { getDashboardData, getLoans, getMonthRange } from "@/lib/data";
import { GenerateSalaryButton } from "@/components/dashboard/generate-salary";
import { AddTransactionModal } from "@/components/transactions/add-transaction";

type SearchParams = Record<string, string | string[] | undefined>;

interface DashboardProps {
  searchParams?: unknown; // ✅ юу ч байж магадгүй гэж үзнэ
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pickFirst(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function DashboardPage({ searchParams }: DashboardProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const loans = await getLoans(session.user.id);
  const loanOptions = loans.map((loan: any) => ({
    id: loan.id,
    name: loan.name,
  }));

  const currency = session.user.currency || "MNT";

  // ✅ searchParams-аа object мөн эсэхээр нь хамгаалж байна
  const sp: SearchParams = isPlainObject(searchParams)
    ? (searchParams as SearchParams)
    : {};

  const monthParam = pickFirst(sp.month);
  const periodParam = pickFirst(sp.period);
  const activePeriod = periodParam || "default";

  const monthRange = getMonthRange(monthParam, periodParam);

  // input type="month" заавал YYYY-MM
  const monthValue =
    typeof monthRange?.label === "string" &&
    /^\d{4}-\d{2}$/.test(monthRange.label)
      ? monthRange.label
      : new Date().toISOString().slice(0, 7);

  const monthLabel =
    typeof monthRange?.label === "string" && monthRange.label.length > 0
      ? monthRange.label
      : monthValue;

  const data = await getDashboardData(session.user.id, monthParam, periodParam);

  const maxValue = Math.max(data.totals.income, data.totals.expense, 1);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-white/70">
                {monthLabel}
              </p>
              <h1 className="text-2xl sm:text-3xl font-semibold">Самбар</h1>
            </div>

            <form
              className="flex items-center gap-2 w-full sm:w-auto"
              method="get"
            >
              <input
                type="month"
                name="month"
                defaultValue={monthValue}
                className="flex-1 sm:flex-none rounded-full border border-stroke bg-white px-3 py-2 text-sm min-w-[160px]"
              />
              <Button variant="secondary" type="submit">
                Шүүх
              </Button>
            </form>
          </div>

          {/* Quick Filter Pills */}
          <div className="flex flex-wrap gap-2">
            <Link
              href="?period=today"
              className={`px-4 py-2 text-xs font-medium rounded-full border-2 transition ${
                activePeriod === "today"
                  ? "border-primary bg-primary text-white"
                  : "border-white/10 bg-neutral-900 text-white hover:border-primary/60 hover:bg-neutral-800"
              }`}
            >
              🕐 Өнөөдөр
            </Link>
            <Link
              href="?period=3days"
              className={`px-4 py-2 text-xs font-medium rounded-full border-2 transition ${
                activePeriod === "3days"
                  ? "border-primary bg-primary text-white"
                  : "border-white/10 bg-neutral-900 text-white hover:border-primary/60 hover:bg-neutral-800"
              }`}
            >
              📆 3 хоног
            </Link>
            <Link
              href="?period=7days"
              className={`px-4 py-2 text-xs font-medium rounded-full border-2 transition ${
                activePeriod === "7days"
                  ? "border-primary bg-primary text-white"
                  : "border-white/10 bg-neutral-900 text-white hover:border-primary/60 hover:bg-neutral-800"
              }`}
            >
              📅 7 хоног
            </Link>
            <Link
              href="?period=1month"
              className={`px-4 py-2 text-xs font-medium rounded-full border-2 transition ${
                activePeriod === "1month"
                  ? "border-primary bg-primary text-white"
                  : "border-white/10 bg-neutral-900 text-white hover:border-primary/60 hover:bg-neutral-800"
              }`}
            >
              📊 1 сар
            </Link>
            <Link
              href="?period=3months"
              className={`px-4 py-2 text-xs font-medium rounded-full border-2 transition ${
                activePeriod === "3months"
                  ? "border-primary bg-primary text-white"
                  : "border-white/10 bg-neutral-900 text-white hover:border-primary/60 hover:bg-neutral-800"
              }`}
            >
              📈 3 сар
            </Link>
            <Link
              href="/dashboard"
              className={`px-4 py-2 text-xs font-medium rounded-full border-2 transition ${
                activePeriod === "default"
                  ? "border-primary bg-primary text-white"
                  : "border-white/10 bg-neutral-900 text-white hover:border-primary/60 hover:bg-neutral-800"
              }`}
            >
              🔄 Бүгд
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
