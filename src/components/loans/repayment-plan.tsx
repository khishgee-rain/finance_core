"use client";

import { useMemo, useState } from "react";
import { addDays } from "date-fns";
import { formatCurrency, formatDate } from "@/lib/format";

interface RepaymentPlanProps {
  startDate: Date;
  outstanding: number;
  currency: string;
  defaultCount?: number;
  paymentInterval?: number;
}

// Build a schedule splitting the outstanding evenly with configurable interval.
function buildSchedule(startDate: Date, outstanding: number, count: number, interval: number) {
  const base = startDate;
  const perInstallment = Number((outstanding / count).toFixed(2));
  const items = Array.from({ length: count }).map((_, idx) => {
    const dueDate = addDays(base, idx * interval);
    return {
      index: idx + 1,
      dueDate,
      amount: perInstallment,
    };
  });

  // Adjust the last item to absorb rounding differences so totals match.
  const totalPlanned = items.reduce((sum, item) => sum + item.amount, 0);
  const delta = Number((outstanding - totalPlanned).toFixed(2));
  if (Math.abs(delta) > 0) {
    items[items.length - 1].amount = Number((items[items.length - 1].amount + delta).toFixed(2));
  }

  return items;
}

export function RepaymentPlan({ startDate, outstanding, currency, defaultCount, paymentInterval = 15 }: RepaymentPlanProps) {
  const [count, setCount] = useState(defaultCount && defaultCount > 0 ? defaultCount : 4);

  const schedule = useMemo(
    () => buildSchedule(startDate, outstanding, count, paymentInterval),
    [startDate, outstanding, count, paymentInterval]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Төлбөрийн хуваарь ({paymentInterval} хоног)</h3>
        <label className="text-xs text-slate-400 flex items-center gap-2">
          Хэдэд хуваах:
          <select
            className="rounded-full border border-white/15 bg-neutral-900 px-2 py-1 text-xs text-slate-100 focus:border-primary focus:ring-2 focus:ring-primary/30"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          >
            {[2, 3, 4, 5, 6, 8, 10, 12, 24].map((v) => (
              <option key={v} value={v}>
                {v} хэсэг
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="rounded-xl border border-white/10 bg-neutral-900/80 text-slate-100 shadow-card">
        <div className="grid grid-cols-3 border-b border-white/10 px-3 py-2 text-xs font-medium text-slate-400">
          <span>Хэсэг</span>
          <span>Огноо</span>
          <span className="text-right">Дүн</span>
        </div>
        <div className="divide-y divide-stroke">
          {schedule.map((item) => (
            <div key={item.index} className="grid grid-cols-3 px-3 py-2 text-xs sm:text-sm">
              <span>#{item.index}</span>
              <span>{formatDate(item.dueDate)}</span>
              <span className="text-right font-semibold">
                {formatCurrency(item.amount, currency)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
