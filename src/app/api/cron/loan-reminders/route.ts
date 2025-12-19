import { NextResponse } from "next/server";
import { lastDayOfMonth } from "date-fns";

import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";

export const dynamic = "force-dynamic";

type ReminderEntry = {
  user: {
    email: string;
    name: string | null;
    currency?: string | null;
  };
  loans: { name: string; outstanding: number }[];
};

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
  }

  const today = new Date();
  const todayDay = today.getDate();
  const monthEndDay = lastDayOfMonth(today).getDate();

  try {
    const loans = await prisma.loan.findMany({
      where: { startDate: { lte: today } },
      include: {
        payments: true,
        user: { select: { email: true, name: true, currency: true } },
      },
    });

    const reminders = new Map<string, ReminderEntry>();

    for (const loan of loans) {
      const dueDay = Math.min(loan.repaymentDay, monthEndDay);
      if (dueDay !== todayDay) continue;

      const paid = loan.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
      const outstanding = Math.max(0, Number(loan.principal) - paid);

      const current = reminders.get(loan.user.email);
      const entry: ReminderEntry =
        current ??
        {
          user: {
            email: loan.user.email,
            name: loan.user.name ?? null,
            currency: loan.user.currency ?? "MNT",
          },
          loans: [],
        };

      entry.loans.push({ name: loan.name, outstanding });
      reminders.set(loan.user.email, entry);
    }

    const results: { email: string; count: number; preview: string }[] = [];

    for (const [, entry] of reminders) {
      const currency = entry.user.currency || "MNT";
      const lines = entry.loans
        .map(
          (loan) =>
            `• ${loan.name}: ${
              loan.outstanding <= 0
                ? "Төлбөр 100% төлөгдсөн 🎉"
                : `${formatCurrency(loan.outstanding, currency)} төлөх өдөр өнөөдөр`
            }`
        )
        .join("\n");

      // Mail sending removed; we expose the content for external delivery if needed.
      results.push({
        email: entry.user.email,
        count: entry.loans.length,
        preview: `Сайн уу${entry.user.name ? `, ${entry.user.name}` : ""}!\n\n${lines}`,
      });
    }

    return NextResponse.json({
      date: today.toISOString().split("T")[0],
      sent: results.reduce((acc, item) => acc + item.count, 0),
      recipients: results,
    });
  } catch (error) {
    console.error("Loan reminder error", error);
    return new NextResponse("Loan reminder failed", { status: 500 });
  }
}
