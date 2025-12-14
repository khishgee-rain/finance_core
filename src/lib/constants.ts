export const TRANSACTION_CATEGORIES = [
  "SALARY",
  "HOUSING",
  "GROCERIES",
  "TRANSPORT",
  "UTILITIES",
  "ENTERTAINMENT",
  "LOAN_PAYMENT",
  "OTHER",
] as const;

export type TransactionCategory = (typeof TRANSACTION_CATEGORIES)[number];

export const TRANSACTION_TYPES = ["INCOME", "EXPENSE"] as const;
