import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { Card } from "@/components/ui/card";
import { PaymentForm } from "@/components/loans/payment-form";
import { formatCurrency, formatDate } from "@/lib/format";
import { getLoanDetail } from "@/lib/data";
import { RepaymentPlan } from "@/components/loans/repayment-plan";

export default async function LoanDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const detail = await getLoanDetail(session.user.id, params.id);
  if (!detail) notFound();

  const currency = session.user.currency || "MNT";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-foreground/60">Зээлийн дэлгэрэнгүй</p>
          <h1 className="text-3xl font-semibold">{detail.loan.name}</h1>
          <p className="text-sm text-foreground/60">
            Эхэлсэн {formatDate(new Date(detail.loan.startDate))} • төлөх өдөр {detail.loan.repaymentDay}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-3">
          <h2 className="text-lg font-semibold">Төлөв</h2>
          <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
            <div>
              <p className="text-foreground/60">Үндсэн</p>
              <p className="font-semibold">
                {formatCurrency(Number(detail.loan.principal), currency)}
              </p>
            </div>
            <div>
              <p className="text-foreground/60">Төлсөн</p>
              <p className="font-semibold">{formatCurrency(detail.paid, currency)}</p>
            </div>
            <div>
              <p className="text-foreground/60">Үлдэгдэл</p>
              <p className="font-semibold">{formatCurrency(detail.outstanding, currency)}</p>
            </div>
            <div>
              <p className="text-foreground/60">Хүү</p>
              <p className="font-semibold">
                {detail.loan.interestRate ? `${Number(detail.loan.interestRate)}%` : "Тодорхойлоогүй"}
              </p>
            </div>
          </div>
          {detail.loan.notes ? (
            <p className="text-sm text-foreground/70">Тэмдэглэл: {detail.loan.notes}</p>
          ) : null}
          <div className="mt-2 h-2 w-full rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-foreground"
              style={{
                width: `${Math.min(
                  100,
                  (detail.paid / Math.max(Number(detail.loan.principal), 1)) * 100
                )}%`,
              }}
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Төлбөр нэмэх</h2>
          <p className="text-sm text-foreground/60">Төлбөр бүр зарлага гүйлгээнд бүртгэгдэнэ.</p>
          <div className="mt-3">
            <PaymentForm loanId={detail.loan.id} />
          </div>
        </Card>
      </div>

      <Card>
        {detail.loan && (
          <RepaymentPlan
            startDate={new Date(detail.loan.startDate)}
            outstanding={detail.outstanding}
            currency={currency}
            paymentInterval={(detail.loan as any).paymentInterval || 15}
            defaultCount={(detail.loan as any).installments || 4}
          />
        )}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">Төлбөрийн түүх</h2>
        <div className="mt-3 space-y-3">
          {detail.loan.payments.length === 0 ? (
            <p className="text-sm text-foreground/60">Төлбөр оруулаагүй байна.</p>
          ) : (
            detail.loan.payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between rounded-xl border border-stroke p-3"
              >
                <div>
                  <p className="text-sm font-semibold">{formatDate(new Date(payment.paidAt))}</p>
                  <p className="text-xs text-foreground/60">
                    Бүртгэгдсэн: {formatDate(new Date(payment.createdAt))}
                  </p>
                </div>
                <p className="text-sm font-semibold">
                  {formatCurrency(Number(payment.amount), currency)}
                </p>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
