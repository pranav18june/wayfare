import { format, parseISO } from "date-fns";

/**
 * Format currency in INR with standard Indian grouping (e.g. ₹1,23,456)
 */
export function formatINR(amount: number): string {
  if (isNaN(amount)) return "₹0";
  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));

  const str = absAmount.toString();
  let lastThree = str.substring(str.length - 3);
  const otherNumbers = str.substring(0, str.length - 3);
  if (otherNumbers !== "") {
    lastThree = "," + lastThree;
  }
  const res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  return `${isNegative ? "-" : ""}₹${res}`;
}

/**
 * Format a date string (YYYY-MM-DD or ISO) to display format e.g. "Wed, 18 Nov 2026"
 */
export function formatDate(dateInput: string | Date, formatStr = "EEE, d MMM yyyy"): string {
  try {
    const d = typeof dateInput === "string" ? (dateInput.includes("T") ? parseISO(dateInput) : new Date(dateInput)) : dateInput;
    return format(d, formatStr);
  } catch {
    return String(dateInput);
  }
}

/**
 * Convert 24h time to 12h time if requested, or keep 24h
 */
export function formatTime(time24: string, use12h = false): string {
  if (!time24) return "";
  if (!use12h) return time24;
  const [hStr, mStr] = time24.split(":");
  const h = parseInt(hStr, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${mStr} ${ampm}`;
}

/**
 * Format duration minutes into "2h 15m"
 */
export function formatDuration(durationMinutes: number): string {
  const h = Math.floor(durationMinutes / 60);
  const m = durationMinutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
