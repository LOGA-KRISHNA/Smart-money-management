import { format } from "date-fns";
import type { DateValue } from "../types";

export const currency = new Intl.NumberFormat("en-IN", {
  currency: "INR",
  maximumFractionDigits: 0,
  style: "currency",
});

export function formatCurrency(value: number) {
  return currency.format(Math.round(value));
}

export function toDate(value: DateValue | Date | undefined) {
  if (!value) {
    return undefined;
  }

  return value instanceof Date ? value : new Date(value);
}

export function toMillis(value: DateValue | Date) {
  return value instanceof Date ? value.getTime() : value;
}

export function formatDate(value: DateValue | Date | undefined) {
  const date = toDate(value);

  if (!date) {
    return "Not available";
  }

  return format(date, "dd MMM yyyy");
}

export function monthKey(value: DateValue | Date) {
  const date = toDate(value) ?? new Date();
  return format(date, "MMM yy");
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
