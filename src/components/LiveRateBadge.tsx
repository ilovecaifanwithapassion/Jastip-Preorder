import React from "react";
import { formatCurrency } from "@/lib/currency";
import { CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

interface LiveRateBadgeProps {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  source: string;
  isStale?: boolean;
  retrievedAt?: Date | string;
  className?: string;
  showDetails?: boolean;
}

export function LiveRateBadge({
  fromCurrency,
  toCurrency,
  rate,
  source,
  isStale = false,
  retrievedAt,
  className = "",
  showDetails = true,
}: LiveRateBadgeProps) {
  const isOverride = source === "ADMIN_OVERRIDE";
  const formattedRate = formatCurrency(rate, toCurrency);

  const timeString = retrievedAt
    ? new Date(retrievedAt).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
        isOverride
          ? "badge-override"
          : isStale
          ? "badge-stale"
          : "badge-live"
      } ${className}`}
      title={`Exchange rate source: ${source}`}
    >
      {isOverride ? (
        <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
      ) : isStale ? (
        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
      ) : (
        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
      )}

      <span>
        1 {fromCurrency} ≈ {formattedRate}
      </span>

      {showDetails && (
        <span className="opacity-75 text-[10px] pl-1 border-l border-current">
          {isOverride
            ? "Admin Rate"
            : isStale
            ? "Stale Rate"
            : `Live Rates ${timeString ? `(${timeString})` : ""}`}
        </span>
      )}
    </div>
  );
}
