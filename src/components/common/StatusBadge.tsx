interface StatusBadgeProps {
  status: string;
  count?: number;
  className?: string;
}

export function StatusBadge({ status, count, className = "" }: StatusBadgeProps) {
  const norm = status.toUpperCase();

  let colorClasses = "bg-[#ECE8DF] text-[var(--ink-muted)] border-[#E3DFD6]";
  let label = status;

  if (norm === "AVL" || norm === "AVAILABLE" || norm === "CONFIRMED" || norm === "SUCCESS") {
    colorClasses = "bg-[#E6F4EA] text-[var(--ok)] border-[#CEEAD6]";
    label = norm === "AVL" && count !== undefined ? `AVL ${count}` : norm;
  } else if (norm === "RAC") {
    colorClasses = "bg-[#FEF7E0] text-[var(--warn)] border-[#FEEFC3]";
    label = count !== undefined ? `RAC ${count}` : "RAC";
  } else if (norm === "WL" || norm === "WAITLIST") {
    colorClasses = "bg-[#FCE8E6] text-[var(--danger)] border-[#FAD2CF]";
    label = count !== undefined ? `WL ${count}` : "WL";
  } else if (norm === "REGRET" || norm === "NOT_AVAILABLE" || norm === "CANCELLED" || norm === "FAILED") {
    colorClasses = "bg-[#ECE8DF] text-[var(--ink-muted)] border-[#DAD4C8]";
    label = norm;
  } else if (norm === "PENDING") {
    colorClasses = "bg-[#E8F0FE] text-[var(--info)] border-[#D2E3FC]";
    label = "PENDING";
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-mono font-medium border ${colorClasses} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      <span>{label}</span>
    </span>
  );
}
