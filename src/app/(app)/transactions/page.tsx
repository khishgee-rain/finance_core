import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddTransactionModal } from "@/components/transactions/add-transaction";
import { getLoans, getTransactionsData, getMonthRange } from "@/lib/data";
import { displayCategory, formatCurrency, formatDate } from "@/lib/format";
import { TRANSACTION_TYPES } from "@/lib/constants";

type SearchParams = Record<string, string | string[] | undefined>;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pickFirst(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams?: unknown;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const sp: SearchParams = isPlainObject(searchParams)
    ? (searchParams as SearchParams)
    : {};
  const monthParam = pickFirst(sp.month);
  const periodParam = pickFirst(sp.period);
  const activePeriod = periodParam || "default";
  const typeParam = pickFirst(sp.type);

  const typeFilter =
    typeParam === "INCOME" || typeParam === "EXPENSE"
      ? (typeParam as "INCOME" | "EXPENSE")
      : undefined;

  const monthRange = getMonthRange(monthParam, periodParam);
  const monthLabel = monthRange.label;
  const monthValue =
    typeof monthRange.label === "string" &&
    /^\d{4}-\d{2}$/.test(monthRange.label)
      ? monthRange.label
      : new Date().toISOString().slice(0, 7);

  const hrefWith = (next: {
    month?: string;
    type?: string;
    period?: string;
  }) => {
    const params = new URLSearchParams();
    if (next.month) params.set("month", next.month);
    if (next.type) params.set("type", next.type);
    if (next.period && next.period !== "default")
      params.set("period", next.period);
    const qs = params.toString();
    return qs ? `?${qs}` : "/transactions";
  };

  const { transactions } = await getTransactionsData(session.user.id, {
    monthParam,
    periodParam,
    type: typeFilter,
  });
  const loans = await getLoans(session.user.id);
  const loanOptions = loans.map((loan) => ({ id: loan.id, name: loan.name }));
  const currency = session.user.currency || "MNT";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
            {monthLabel}
          </p>
          <h1 className="text-3xl font-semibold">Бүх хөдөлгөөн</h1>
        </div>
        <AddTransactionModal loans={loanOptions} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={hrefWith({
            month: monthParam,
            type: typeFilter,
            period: "today",
          })}
          className={`px-4 py-2 text-xs font-medium rounded-full border-2 transition ${
            activePeriod === "today"
              ? "border-primary bg-primary text-white"
              : "border-white/10 bg-neutral-900 text-white hover:border-primary/60 hover:bg-neutral-800"
          }`}
        >
          🕐 Өнөөдөр
        </Link>
        <Link
          href={hrefWith({
            month: monthParam,
            type: typeFilter,
            period: "3days",
          })}
          className={`px-4 py-2 text-xs font-medium rounded-full border-2 transition ${
            activePeriod === "3days"
              ? "border-primary bg-primary text-white"
              : "border-white/10 bg-neutral-900 text-white hover:border-primary/60 hover:bg-neutral-800"
          }`}
        >
          📆 3 хоног
        </Link>
        <Link
          href={hrefWith({
            month: monthParam,
            type: typeFilter,
            period: "7days",
          })}
          className={`px-4 py-2 text-xs font-medium rounded-full border-2 transition ${
            activePeriod === "7days"
              ? "border-primary bg-primary text-white"
              : "border-white/10 bg-neutral-900 text-white hover:border-primary/60 hover:bg-neutral-800"
          }`}
        >
          📅 7 хоног
        </Link>
        <Link
          href={hrefWith({
            month: monthParam,
            type: typeFilter,
            period: "1month",
          })}
          className={`px-4 py-2 text-xs font-medium rounded-full border-2 transition ${
            activePeriod === "1month"
              ? "border-primary bg-primary text-white"
              : "border-white/10 bg-neutral-900 text-white hover:border-primary/60 hover:bg-neutral-800"
          }`}
        >
          📊 1 сар
        </Link>
        <Link
          href={hrefWith({
            month: monthParam,
            type: typeFilter,
            period: "3months",
          })}
          className={`px-4 py-2 text-xs font-medium rounded-full border-2 transition ${
            activePeriod === "3months"
              ? "border-primary bg-primary text-white"
              : "border-white/10 bg-neutral-900 text-white hover:border-primary/60 hover:bg-neutral-800"
          }`}
        >
          📈 3 сар
        </Link>
        <Link
          href={hrefWith({
            month: monthParam,
            type: typeFilter,
            period: "default",
          })}
          className={`px-4 py-2 text-xs font-medium rounded-full border-2 transition ${
            activePeriod === "default"
              ? "border-primary bg-primary text-white"
              : "border-white/10 bg-neutral-900 text-white hover:border-primary/60 hover:bg-neutral-800"
          }`}
        >
          🔄 Бүгд
        </Link>
      </div>

      {/* <Card>
        <form className="flex flex-wrap items-end gap-3" action="" method="get">
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="month">
              Сар
            </label>
            <input
              id="month"
              type="month"
              name="month"
              defaultValue={monthValue}
              className="rounded-full border border-stroke bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="type">
              Төрөл
            </label>
            <select
              id="type"
              name="type"
              defaultValue={typeFilter ?? ""}
              className="rounded-full border border-stroke bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Бүгд</option>
              {TRANSACTION_TYPES.map((type) => {
                const label = type === "INCOME" ? "Орлого" : "Зарлага";
                return (
                  <option key={type} value={type}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>
          <Button type="submit" variant="secondary">
            Шүүх
          </Button>
        </form>
      </Card> */}

      <div className="space-y-3">
        {transactions.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-400">
              Энэ шүүлтүүртэй гүйлгээ алга.
            </p>
          </Card>
        ) : (
          transactions.map((txn) => (
            <Card
              key={txn.id}
              className="flex items-center justify-between transition hover:-translate-y-[1px]"
            >
              <div>
                <p className="text-sm font-semibold">
                  {displayCategory(txn.category)}
                </p>
                <p className="text-xs text-slate-400">
                  {formatDate(new Date(txn.occurredAt))} •{" "}
                  {txn.type === "INCOME" ? "Орлого" : "Зарлага"}
                </p>
                {txn.note ? (
                  <p className="text-xs text-slate-400">
                    Тэмдэглэл: {txn.note}
                  </p>
                ) : null}
              </div>
              <p
                className={`text-sm font-semibold ${
                  txn.type === "EXPENSE" ? "text-rose-500" : "text-emerald-600"
                }`}
              >
                {txn.type === "EXPENSE" ? "-" : "+"}
                {formatCurrency(Number(txn.amount), currency)}
              </p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
