import { addDays, startOfDay } from "date-fns";
import { prisma } from "./prisma";

type SalaryResult = { success?: string; error?: string; createdDays?: number[] };

/**
 * Idempotently creates salary transactions for the current month
 * based on user payday flags (15 and/or 30). Safe to call on every
 * dashboard render or after login.
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
  const dates: Date[] = [];
  const has15 = user.payday15;
  const has30 = user.payday30;
  if (has15) dates.push(new Date(now.getFullYear(), now.getMonth(), 15));
  if (has30) dates.push(new Date(now.getFullYear(), now.getMonth(), 30));

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
  for (const date of dates) {
    const start = startOfDay(date);
    const end = addDays(start, 1);
    const exists = await prisma.transaction.findFirst({
      where: {
        userId,
        type: "INCOME",
        category: "SALARY",
        occurredAt: { gte: start, lt: end },
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
    return { success: "Энэ сарын цалин бүртгэгдсэн байна.", createdDays: [] };
  }

  return { success: `Цалин нэмэгдлээ (өдөр: ${created.join(", ")})`, createdDays: created };
}
