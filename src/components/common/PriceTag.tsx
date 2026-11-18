import { formatINR } from "@/lib/utils/formatters";

interface PriceTagProps {
  amount: number;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  label?: string;
}

export function PriceTag({ amount, className = "", size = "md", label }: PriceTagProps) {
  const sizeClasses = {
    sm: "text-xs font-semibold",
    md: "text-sm font-bold",
    lg: "text-lg font-bold",
    xl: "text-2xl font-bold",
  };

  return (
    <span className={`inline-flex items-baseline gap-1 ${className}`}>
      {label && <span className="text-xs text-[var(--ink-muted)] font-normal">{label}</span>}
      <span className={`font-mono text-[var(--ink)] ${sizeClasses[size]}`}>
        {formatINR(amount)}
      </span>
    </span>
  );
}
