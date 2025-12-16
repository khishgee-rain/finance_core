"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { addDays, startOfDay } from "date-fns";

import { auth, signIn, signOut } from "@/auth";
import { prisma } from "./prisma";
import { TRANSACTION_CATEGORIES, TRANSACTION_TYPES } from "./constants";
import { ensureSalaryForCurrentMonth } from "./salary";

type ActionResult = { error?: string; success?: string };

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Нэвтрээгүй байна");
  }
  return session.user;
}

export async function logoutAction(_formData?: FormData) {
  await signOut({ redirectTo: "/login" });
}

export async function loginAction(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });
  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Имэйл, нууц үгээ зөв оруулна уу." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
    return { success: "Амжилттай нэвтэрлээ" };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Имэйл эсвэл нууц үг буруу." };
    }
    throw error;
  }
}

export async function registerAction(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    currency: z.string().min(3).max(5),
    salaryAmount: z.coerce.number().nonnegative(),
    payday15: z.coerce.boolean().optional(),
    payday30: z.coerce.boolean().optional(),
  });

  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    currency: formData.get("currency") || "MNT",
    salaryAmount: formData.get("salaryAmount") || 0,
    payday15: formData.get("payday15") === "on",
    payday30: formData.get("payday30") === "on",
  });

  if (!parsed.success) {
    return { error: "Шаардлагатай талбаруудыг зөв бөглөнө үү." };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { error: "Энэ имэйлээр бүртгэл үүссэн байна." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      currency: parsed.data.currency.toUpperCase(),
      salaryAmount: parsed.data.salaryAmount,
      payday15: parsed.data.payday15 ?? false,
      payday30: parsed.data.payday30 ?? false,
    },
  });

  await signIn("credentials", {
    email: parsed.data.email,
    password: parsed.data.password,
    redirectTo: "/dashboard",
  });

  return { success: "Бүртгэл үүсгэлээ" };
}

export async function createTransactionAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser();
  const schema = z.object({
    type: z.enum(TRANSACTION_TYPES),
    amount: z.coerce.number().positive(),
    category: z.enum(TRANSACTION_CATEGORIES),
    note: z.string().max(200).optional(),
    occurredAt: z.coerce.date(),
    loanId: z.string().optional(),
  });

  const parsed = schema.safeParse({
    type: formData.get("type"),
    amount: formData.get("amount"),
    category: formData.get("category"),
    note: formData.get("note") || undefined,
    occurredAt: formData.get("occurredAt"),
    loanId: formData.get("loanId") || undefined,
  });

  if (!parsed.success) {
    console.error("Validation error:", parsed.error.flatten());
    return { error: "Гүйлгээний мэдээлэл буруу байна." };
  }

  if (parsed.data.loanId) {
    const loan = await prisma.loan.findFirst({
      where: { id: parsed.data.loanId, userId: user.id },
    });
    if (!loan) {
      return { error: "Зээл олдсонгүй." };
    }
  }

  await prisma.transaction.create({
    data: {
      userId: user.id,
      type: parsed.data.type,
      category: parsed.data.category,
      amount: parsed.data.amount,
      note: parsed.data.note,
      occurredAt: parsed.data.occurredAt,
      loanId: parsed.data.loanId,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/loans");

  return { success: "Гүйлгээг хадгаллаа." };
}

export async function generateSalaryForMonth(
  _prevState: ActionResult,
  _formData?: FormData
): Promise<ActionResult> {
  const user = await requireUser();
  const result = await ensureSalaryForCurrentMonth(user.id);

  revalidatePath("/dashboard");
  revalidatePath("/transactions");

  return result;
}

export async function createLoanAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser();

  const schema = z.object({
    name: z.string().min(2),
    principal: z.coerce.number().positive(),
    interestRate: z.coerce.number().nonnegative().max(100).optional(),
    startDate: z.coerce.date(),
    repaymentDay: z.coerce.number().int().min(1).max(31),
    paymentInterval: z.coerce.number().int().positive().optional(),
    installments: z.coerce.number().int().positive().optional(),
    notes: z.string().max(240).optional(),
  });

  const parsed = schema.safeParse({
    name: formData.get("name"),
    principal: formData.get("principal"),
    interestRate: formData.get("interestRate"),
    startDate: formData.get("startDate"),
    repaymentDay: formData.get("repaymentDay"),
    paymentInterval: formData.get("paymentInterval"),
    installments: formData.get("installments"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { error: "Зээлийн мэдээллээ зөв оруулна уу." };
  }

  await prisma.loan.create({
    data: {
      userId: user.id,
      name: parsed.data.name,
      principal: parsed.data.principal,
      interestRate: parsed.data.interestRate ?? null,
      startDate: parsed.data.startDate,
      repaymentDay: parsed.data.repaymentDay,
      paymentInterval: parsed.data.paymentInterval ?? 15,
      installments: parsed.data.installments ?? 4,
      notes: parsed.data.notes,
    },
  });

  revalidatePath("/loans");
  revalidatePath("/dashboard");

  return { success: "Зээл нэмлээ." };
}

export async function recordPaymentAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser();
  const schema = z.object({
    loanId: z.string().min(1),
    amount: z.coerce.number().positive(),
    paidAt: z.coerce.date(),
  });

  const parsed = schema.safeParse({
    loanId: formData.get("loanId"),
    amount: formData.get("amount"),
    paidAt: formData.get("paidAt"),
  });

  if (!parsed.success) {
    return { error: "Төлбөрийн мэдээлэл буруу байна." };
  }

  const loan = await prisma.loan.findFirst({
    where: { id: parsed.data.loanId, userId: user.id },
  });
  if (!loan) {
    return { error: "Зээл олдсонгүй." };
  }

  const payment = await prisma.loanPayment.create({
    data: {
      loanId: loan.id,
      amount: parsed.data.amount,
      paidAt: parsed.data.paidAt,
    },
  });

  // Mirror the payment as an expense transaction for monthly summaries.
  await prisma.transaction.create({
    data: {
      userId: user.id,
      type: "EXPENSE",
      category: "LOAN_PAYMENT",
      amount: parsed.data.amount,
      note: `Зээлийн төлбөр: ${loan.name}`,
      occurredAt: parsed.data.paidAt,
      loanId: loan.id,
    },
  });

  revalidatePath("/loans");
  revalidatePath(`/loans/${loan.id}`);
  revalidatePath("/dashboard");
  revalidatePath("/transactions");

  return { success: `Төлбөр (${Number(payment.amount).toFixed(2)}) бүртгэгдлээ.` };
}

export async function updateProfileAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser();

  const schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    currency: z.string().min(3).max(5),
    salaryAmount: z.coerce.number().nonnegative(),
    payday15: z.coerce.boolean().optional(),
    payday30: z.coerce.boolean().optional(),
  });

  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    currency: formData.get("currency"),
    salaryAmount: formData.get("salaryAmount") || 0,
    payday15: formData.get("payday15") === "on",
    payday30: formData.get("payday30") === "on",
  });

  if (!parsed.success) {
    return { error: "Профайлын мэдээлэл буруу байна." };
  }

  const existingEmail = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existingEmail && existingEmail.id !== user.id) {
    return { error: "Энэ имэйл ашиглагдаж байна." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      currency: parsed.data.currency.toUpperCase(),
      salaryAmount: parsed.data.salaryAmount,
      payday15: parsed.data.payday15 ?? false,
      payday30: parsed.data.payday30 ?? false,
    },
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");

  return { success: "Мэдээллийг шинэчиллээ." };
}
