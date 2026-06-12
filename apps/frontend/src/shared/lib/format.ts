const moneyFormatter = new Intl.NumberFormat("ru-RU", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactMoneyFormatter = new Intl.NumberFormat("ru-RU", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

/** "1 234,50 ₽" — full precision, with currency suffix. */
export function formatMoney(amount: number): string {
  return `${moneyFormatter.format(amount)} ₽`;
}

/** "1 235 ₽" — no fraction, for large headline figures. */
export function formatMoneyCompact(amount: number): string {
  return `${compactMoneyFormatter.format(Math.round(amount))} ₽`;
}

/** "18 мар. 2023" */
export function formatDate(date: string | Date): string {
  return dateFormatter.format(new Date(date));
}
