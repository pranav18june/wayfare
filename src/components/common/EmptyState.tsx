import { LucideIcon, AlertCircle } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon = AlertCircle,
  actionLabel,
  actionHref,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-md border border-[var(--line)] bg-[var(--surface)] p-8 text-center ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--canvas)] text-[var(--ink-muted)] mb-3">
        <Icon size={24} strokeWidth={1.5} />
      </div>
      <h3 className="text-sm font-semibold text-[var(--ink)]">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-[var(--ink-muted)]">{description}</p>

      {(actionLabel && actionHref) && (
        <Link
          href={actionHref}
          className="mt-4 rounded-md bg-[var(--brand)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--brand-ink)]"
        >
          {actionLabel}
        </Link>
      )}

      {(actionLabel && onAction && !actionHref) && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 rounded-md bg-[var(--brand)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--brand-ink)]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
