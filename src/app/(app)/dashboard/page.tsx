import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { displayCategory, formatCurrency, formatDate } from "@/lib/format";
import { getDashboardData, getMonthRange } from "@/lib/data";
import { GenerateSalaryButton } from "@/components/dashboard/generate-salary";
import { ensureSalaryForCurrentMonth } from "@/lib/salary";

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

  await ensureSalaryForCurrentMonth(session.user.id);

  const currency = session.user.currency || "MNT";

  // ✅ searchParams-аа object мөн эсэхээр нь хамгаалж байна
  const sp: SearchParams = isPlainObject(searchParams)
    ? (searchParams as SearchParams)
    : {};

  const monthParam = pickFirst(sp.month);

  const monthRange = getMonthRange(monthParam);

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

  const data = await getDashboardData(session.user.id, monthParam);

  const maxValue = Math.max(data.totals.income, data.totals.expense, 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-foreground/60">
            {monthLabel}
          </p>
          <h1 className="text-3xl font-semibold">Самбар</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <form className="flex items-center gap-2" method="get">
            <input
              type="month"
              name="month"
              defaultValue={monthValue}
              className="w-full rounded-full border border-stroke bg-white px-3 py-2 text-sm"
            />
            <Button variant="ghost" type="submit">
              Шүүх
            </Button>
          </form>

          <GenerateSalaryButton />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-foreground/60">Орлого</p>
          <p className="mt-2 text-2xl font-semibold">
            {formatCurrency(data.totals.income, currency)}
          </p>
          <div className="mt-4 h-2 w-full rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-foreground"
              style={{ width: `${(data.totals.income / maxValue) * 100}%` }}
            />
          </div>
        </Card>

        <Card>
          <p className="text-sm text-foreground/60">Зарлага</p>
          <p className="mt-2 text-2xl font-semibold">
            {formatCurrency(data.totals.expense, currency)}
          </p>
          <div className="mt-4 h-2 w-full rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-foreground/60"
              style={{ width: `${(data.totals.expense / maxValue) * 100}%` }}
            />
          </div>
        </Card>

        <Card>
          <p className="text-sm text-foreground/60">Үлдэгдэл</p>
          <p className="mt-2 text-2xl font-semibold">
            {formatCurrency(data.totals.balance, currency)}
          </p>
          <p className="mt-1 text-sm text-foreground/60">
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
              <p className="text-sm text-foreground/60">
                Одоогоор гүйлгээ алга.
              </p>
            ) : (
              data.recentTransactions.map((txn: any) => (
                <div
                  key={txn.id}
                  className="flex items-center justify-between rounded-xl border border-stroke p-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {displayCategory(txn.category)}
                    </p>
                    <p className="text-xs text-foreground/60">
                      {formatDate(new Date(txn.occurredAt))}
                    </p>
                  </div>
                  <p
                    className="text-sm font-semibold"
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
              <p className="text-sm text-foreground/60">
                Зээл бүртгээгүй байна.
              </p>
            ) : (
              data.loanSummaries.map((loan: any) => (
                <div
                  key={loan.id}
                  className="rounded-xl border border-stroke p-3"
                >
                  <p className="text-sm font-semibold">{loan.name}</p>
                  <p className="text-xs text-foreground/60">
                    Үлдэгдэл {formatCurrency(loan.outstanding, currency)}
                  </p>
                  <div className="mt-2 h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-foreground"
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
            <p className="text-sm text-foreground/60">Энэ сард гүйлгээ алга.</p>
          ) : (
            data.monthTransactions.map((txn: any) => (
              <div
                key={txn.id}
                className="flex items-center justify-between rounded-xl border border-stroke p-3"
              >
                <div>
                  <p className="text-sm font-semibold">
                    {displayCategory(txn.category)}
                  </p>
                  <p className="text-xs text-foreground/60">
                    {txn.note || txn.type}
                  </p>
                  <p className="text-xs text-foreground/60">
                    {formatDate(new Date(txn.occurredAt))}
                  </p>
                </div>
                <p className="text-sm font-semibold">
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
