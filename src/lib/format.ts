const CATEGORY_LABELS: Record<string, string> = {
  SALARY: "Цалин",
  HOUSING: "Орон сууц",
  GROCERIES: "Хүнс",
  TRANSPORT: "Тээвэр",
  UTILITIES: "Коммунал",
  ENTERTAINMENT: "Энтертайнмент",
  LOAN_PAYMENT: "Зээлийн төлбөр",
  OTHER: "Бусад",
};

export function displayCategory(category: string) {
  return CATEGORY_LABELS[category] ?? category;
}

export function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("mn-MN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(input: Date) {
  return new Intl.DateTimeFormat("mn-MN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(input);
}
