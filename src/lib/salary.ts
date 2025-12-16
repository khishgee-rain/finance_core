import { addDays, startOfDay } from "date-fns";
import { prisma } from "./prisma";

type SalaryResult = { success?: string; error?: string; createdDays?: number[] };

/**
 * Idempotently creates salary transactions for the current month
 * based on user payday flags (15 and/or 30). Only posts once the
 * calendar date has arrived (e.g., 15-ны 60%, 30-ны 40%).
 */
export async function ensureSalaryForCurrentMonth(userId: string): Promise<SalaryResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { salaryAmount: true, payday15: true, payday30: true },
  });

  if (!user) return { error: "Хэрэглэгч олдсонгүй." };
  if (!user.payday15 && !user.payday30) {
    return { error: "Тохиргоондоо 15 болон/эсвэл 30-ны өдрийг сонгоно уу." };
  }

  const salaryAmount = Number(user.salaryAmount);
  if (!salaryAmount || salaryAmount <= 0) {
    return { error: "Цалингийн дүнгээ эхлээд тохируулна уу." };
  }

  const now = new Date();
  const todayStart = startOfDay(now);
  const payDates: Date[] = [];
  const has15 = user.payday15;
  const has30 = user.payday30;
  if (has15) payDates.push(new Date(now.getFullYear(), now.getMonth(), 15));
  if (has30) payDates.push(new Date(now.getFullYear(), now.getMonth(), 30));

  let amount15 = salaryAmount;
  let amount30 = salaryAmount;
  if (has15 && has30) {
    amount15 = Number((salaryAmount * 0.6).toFixed(2));
    amount30 = Number((salaryAmount - amount15).toFixed(2));
  } else if (has15 && !has30) {
    amount30 = 0;
  } else if (!has15 && has30) {
    amount15 = 0;
  }

  const created: number[] = [];
  const pending: number[] = [];

  for (const date of payDates) {
    const payDateStart = startOfDay(date);
    if (payDateStart > todayStart) {
      pending.push(date.getDate());
      continue; // future payday — do not post yet
    }

    const nextDay = addDays(payDateStart, 1);
    const exists = await prisma.transaction.findFirst({
      where: {
        userId,
        type: "INCOME",
        category: "SALARY",
        occurredAt: { gte: payDateStart, lt: nextDay },
      },
    });

    if (!exists) {
      const amount =
        date.getDate() === 15
          ? amount15 || salaryAmount
          : has30
            ? amount30
            : salaryAmount;

      await prisma.transaction.create({
        data: {
          userId,
          type: "INCOME",
          category: "SALARY",
          amount,
          note: "Цалин олголт",
          occurredAt: date,
        },
      });
      created.push(date.getDate());
    }
  }

  if (created.length === 0) {
    if (pending.length > 0) {
      return { success: `Цалин ${pending.join(", ")}-нд бүртгэгдэнэ.`, createdDays: [] };
    }
    return { success: "Энэ сарын цалин бүртгэгдсэн байна.", createdDays: [] };
  }

  return { success: `Цалин нэмэгдлээ (өдөр: ${created.join(", ")})`, createdDays: created };
}
