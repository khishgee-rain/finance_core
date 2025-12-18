import { addMonths, endOfMonth, startOfMonth, subDays } from "date-fns";
import { prisma } from "./prisma";

function normalizeMonthParam(value?: string | string[] | null) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== "string") return undefined;
  if (!/^\d{4}-\d{2}$/.test(raw)) return undefined;
  return raw;
}

function normalizePeriodParam(value?: string | string[] | null) {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === "string" ? raw : undefined;
}

export function getMonthRange(monthParam?: string | string[] | null, periodParam?: string | string[] | null) {
  const now = new Date();
  const period = normalizePeriodParam(periodParam);

  // Quick period filters
  if (period) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let start = today;
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 1);
    nextMonth.setHours(0, 0, 0, 0);

    switch (period) {
      case "today":
        return { start: today, end: today, label: "Өнөөдөр", nextMonth };
      case "3days":
        start = subDays(today, 2);
        return { start, end: today, label: "Сүүлийн 3 хоног", nextMonth };
      case "7days":
        start = subDays(today, 6);
        return { start, end: today, label: "Сүүлийн 7 хоног", nextMonth };
      case "1month":
        start = subDays(today, 29);
        return { start, end: today, label: "Сүүлийн 30 хоног", nextMonth };
      case "3months":
        start = subDays(today, 89);
        return { start, end: today, label: "Сүүлийн 3 сар", nextMonth };
    }
  }

  // Month-based filter
  let year = now.getFullYear();
  let month = now.getMonth();

  const normalized = normalizeMonthParam(monthParam);

  if (normalized) {
    const [y, m] = normalized.split("-").map(Number);
    if (!Number.isNaN(y) && !Number.isNaN(m) && m >= 1 && m <= 12) {
      year = y;
      month = m - 1;
    }
  }

  const start = startOfMonth(new Date(year, month, 1));
  const end = endOfMonth(start);
  const label = `${year}-${String(month + 1).padStart(2, "0")}`;
  const nextMonth = addMonths(start, 1);

  return { start, end, label, nextMonth };
}

export async function getDashboardData(userId: string, monthParam?: string | string[] | null, periodParam?: string | string[] | null) {
  const { start, nextMonth, label } = getMonthRange(monthParam, periodParam);

  const [incomeAgg, expenseAgg, recentTransactions, monthTransactions, loans] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, type: "INCOME", occurredAt: { gte: start, lt: nextMonth } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: "EXPENSE", occurredAt: { gte: start, lt: nextMonth } },
      _sum: { amount: true },
    }),
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { occurredAt: "desc" },
      take: 5,
    }),
    prisma.transaction.findMany({
      where: { userId, occurredAt: { gte: start, lt: nextMonth } },
      orderBy: { occurredAt: "desc" },
    }),
    prisma.loan.findMany({
      where: { userId },
      include: { payments: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const income = Number(incomeAgg._sum.amount ?? 0);
  const expense = Number(expenseAgg._sum.amount ?? 0);
  const balance = income - expense;

  const loanSummaries = loans.map((loan) => {
    const paid = loan.payments.reduce((acc, payment) => acc + Number(payment.amount), 0);
    const outstanding = Math.max(0, Number(loan.principal) - paid);
    return { ...loan, paid, outstanding };
  });

  const outstandingTotal = loanSummaries.reduce((acc, loan) => acc + loan.outstanding, 0);

  return {
    monthLabel: label,
    totals: { income, expense, balance },
    monthTransactions,
    recentTransactions,
    loanSummaries,
    outstandingTotal,
  };
}

export async function getTransactionsData(
  userId: string,
  opts: {
    monthParam?: string | string[] | null;
    periodParam?: string | string[] | null;
    type?: "INCOME" | "EXPENSE";
  }
) {
  const { start, nextMonth, label } = getMonthRange(opts.monthParam, opts.periodParam);

  const where: any = {
    userId,
    occurredAt: { gte: start, lt: nextMonth },
  };
  if (opts.type) {
    where.type = opts.type;
  }

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { occurredAt: "desc" },
  });

  return { transactions, monthLabel: label };
}

export async function getUserProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
  });
}

export async function getLoans(userId: string) {
  const loans = await prisma.loan.findMany({
    where: { userId },
    include: { payments: true },
    orderBy: { createdAt: "desc" },
  });

  return loans.map((loan) => {
    const paid = loan.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const outstanding = Math.max(0, Number(loan.principal) - paid);
    return { ...loan, paid, outstanding };
  });
}

export async function getLoanDetail(userId: string, loanId: string) {
  if (!loanId) return null;
  const loan = await prisma.loan.findFirst({
    where: { id: loanId, userId },
    include: {
      payments: { orderBy: { paidAt: "desc" } },
    },
  });
  if (!loan) return null;
  const paid = loan.payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const outstanding = Math.max(0, Number(loan.principal) - paid);

  return { loan, paid, outstanding };
}
