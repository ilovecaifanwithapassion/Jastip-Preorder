import Decimal from "decimal.js";
import { prisma } from "./prisma";

export interface RateResult {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  source: "LIVE_API" | "DATABASE_CACHE" | "ADMIN_OVERRIDE" | "FALLBACK";
  retrievedAt: Date;
  isStale: boolean;
  provider: string;
}

export interface PricingBreakdown {
  originalPrice: number;
  originalCurrency: string;
  targetCurrency: string;
  exchangeRate: number;
  rateSource: string;
  rateTimestamp: Date;
  convertedProductPrice: number;
  serviceFeePercent: number;
  serviceFeeAmount: number;
  flatServiceFee: number;
  totalServiceFee: number;
  estimatedTotal: number;
  formattedOriginal: string;
  formattedConvertedProduct: string;
  formattedServiceFee: string;
  formattedTotal: string;
}

// Built-in emergency fallbacks if network is completely disconnected during offline tests
const DEFAULT_FALLBACK_RATES: Record<string, Record<string, number>> = {
  SGD: { IDR: 11950, USD: 0.76, EUR: 0.70, SGD: 1 },
  JPY: { IDR: 104.5, USD: 0.0067, EUR: 0.0062, JPY: 1 },
  USD: { IDR: 15650, SGD: 1.32, JPY: 149.5, USD: 1 },
  EUR: { IDR: 16900, SGD: 1.42, USD: 1.08, EUR: 1 },
  KRW: { IDR: 11.5, USD: 0.00073, KRW: 1 },
  HKD: { IDR: 2010, USD: 0.128, HKD: 1 },
  THB: { IDR: 450, USD: 0.029, THB: 1 },
  MYR: { IDR: 3520, USD: 0.22, MYR: 1 },
  GBP: { IDR: 19800, USD: 1.27, GBP: 1 },
  AUD: { IDR: 10250, USD: 0.65, AUD: 1 },
  IDR: { IDR: 1, SGD: 0.000084, USD: 0.000064, JPY: 0.0096, HKD: 0.000498, KRW: 0.087 },
};

/**
 * Format currency amount with regional rules
 */
export function formatCurrency(amount: number | string, currency: string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return `${currency} 0`;

  const curr = currency.toUpperCase();
  const fractionDigits = ["IDR", "JPY", "KRW"].includes(curr) ? 0 : 2;

  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: curr,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(num);
  } catch {
    return `${curr} ${num.toLocaleString("id-ID", {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    })}`;
  }
}

/**
 * Fetch exchange rate with multi-tier caching (DB Cache -> Live External API -> Stale Cache -> Fallback)
 */
export async function getExchangeRate(
  fromCurrency: string,
  toCurrency: string,
  options?: {
    forceRefresh?: boolean;
    tripManualRate?: number | null;
    rateMode?: string;
  }
): Promise<RateResult> {
  const from = fromCurrency.toUpperCase().trim();
  const to = toCurrency.toUpperCase().trim();

  // 1. Same currency identity
  if (from === to) {
    return {
      fromCurrency: from,
      toCurrency: to,
      rate: 1.0,
      source: "LIVE_API",
      retrievedAt: new Date(),
      isStale: false,
      provider: "Identity",
    };
  }

  // 2. Check if Trip has an active Admin Manual Override
  if (options?.rateMode === "MANUAL_OVERRIDE" && options.tripManualRate && options.tripManualRate > 0) {
    return {
      fromCurrency: from,
      toCurrency: to,
      rate: options.tripManualRate,
      source: "ADMIN_OVERRIDE",
      retrievedAt: new Date(),
      isStale: false,
      provider: "Administrator Manual Configuration",
    };
  }

  const now = new Date();
  const cacheTtlMinutes = parseInt(process.env.EXCHANGE_RATE_CACHE_TTL_MINUTES || "60", 10);

  // 3. Check Database Cache if not forcing refresh
  if (!options?.forceRefresh) {
    try {
      const cached = await prisma.exchangeRateCache.findUnique({
        where: {
          fromCurrency_toCurrency: {
            fromCurrency: from,
            toCurrency: to,
          },
        },
      });

      if (cached && cached.expiresAt > now) {
        return {
          fromCurrency: from,
          toCurrency: to,
          rate: cached.rate,
          source: "DATABASE_CACHE",
          retrievedAt: cached.retrievedAt,
          isStale: false,
          provider: cached.provider,
        };
      }
    } catch (err) {
      console.warn("Could not read rate cache from DB:", err);
    }
  }

  // 4. Fetch from External Live API
  try {
    const apiUrl = process.env.EXCHANGE_RATE_API_URL || "https://api.frankfurter.dev/v1/latest";
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`${apiUrl}?from=${from}&to=${to}`, {
      signal: controller.signal,
      next: { revalidate: 3600 },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const rate = data.rates?.[to];

      if (typeof rate === "number" && rate > 0) {
        const expiresAt = new Date(now.getTime() + cacheTtlMinutes * 60 * 1000);

        // Update database cache
        try {
          await prisma.exchangeRateCache.upsert({
            where: {
              fromCurrency_toCurrency: {
                fromCurrency: from,
                toCurrency: to,
              },
            },
            update: {
              rate,
              provider: "Frankfurter Live API",
              retrievedAt: now,
              expiresAt,
            },
            create: {
              fromCurrency: from,
              toCurrency: to,
              rate,
              provider: "Frankfurter Live API",
              retrievedAt: now,
              expiresAt,
            },
          });
        } catch (dbErr) {
          console.warn("Failed to persist rate to DB cache:", dbErr);
        }

        return {
          fromCurrency: from,
          toCurrency: to,
          rate,
          source: "LIVE_API",
          retrievedAt: now,
          isStale: false,
          provider: "Frankfurter (ECB Market Rates)",
        };
      }
    }
  } catch (apiErr) {
    console.warn(`External exchange rate fetch failed for ${from}->${to}:`, apiErr);
  }

  // 5. Fallback to Stale DB Cache if available
  try {
    const staleCached = await prisma.exchangeRateCache.findUnique({
      where: {
        fromCurrency_toCurrency: {
          fromCurrency: from,
          toCurrency: to,
        },
      },
    });

    if (staleCached) {
      return {
        fromCurrency: from,
        toCurrency: to,
        rate: staleCached.rate,
        source: "DATABASE_CACHE",
        retrievedAt: staleCached.retrievedAt,
        isStale: true,
        provider: `${staleCached.provider} (Stale Cached Rate)`,
      };
    }
  } catch (dbErr) {
    console.warn("Failed reading stale cache:", dbErr);
  }

  // 6. Final safety fallback
  const fallbackRate = DEFAULT_FALLBACK_RATES[from]?.[to] || 1.0;
  return {
    fromCurrency: from,
    toCurrency: to,
    rate: fallbackRate,
    source: "FALLBACK",
    retrievedAt: now,
    isStale: true,
    provider: "Emergency Configured Fallback",
  };
}

/**
 * Authoritative Decimal-safe price calculation
 */
export function calculatePricingBreakdown(params: {
  originalPrice: number;
  originalCurrency: string;
  targetCurrency: string;
  rateResult: RateResult;
  serviceFeePercent?: number;
  flatServiceFee?: number;
}): PricingBreakdown {
  const {
    originalPrice,
    originalCurrency,
    targetCurrency,
    rateResult,
    serviceFeePercent = 10,
    flatServiceFee = 0,
  } = params;

  const decPrice = new Decimal(originalPrice);
  const decRate = new Decimal(rateResult.rate);
  const decPercent = new Decimal(serviceFeePercent).dividedBy(100);
  const decFlat = new Decimal(flatServiceFee);

  // Converted product price = originalPrice * rate
  const decConvertedProduct = decPrice.times(decRate);

  // Service fee = (convertedProduct * percent) + flatServiceFee
  const decServiceFeePercentAmount = decConvertedProduct.times(decPercent);
  const decTotalServiceFee = decServiceFeePercentAmount.plus(decFlat);

  // Estimated total = convertedProduct + totalServiceFee
  const decTotal = decConvertedProduct.plus(decTotalServiceFee);

  // Currency rounding rules (IDR and JPY rounded to whole units, others to 2 decimal places)
  const isZeroDecimal = ["IDR", "JPY", "KRW"].includes(targetCurrency.toUpperCase());
  const roundMethod = Decimal.ROUND_HALF_UP;

  const finalConvertedProduct = isZeroDecimal
    ? decConvertedProduct.toDecimalPlaces(0, roundMethod).toNumber()
    : decConvertedProduct.toDecimalPlaces(2, roundMethod).toNumber();

  const finalServiceFee = isZeroDecimal
    ? decTotalServiceFee.toDecimalPlaces(0, roundMethod).toNumber()
    : decTotalServiceFee.toDecimalPlaces(2, roundMethod).toNumber();

  const finalTotal = isZeroDecimal
    ? decTotal.toDecimalPlaces(0, roundMethod).toNumber()
    : decTotal.toDecimalPlaces(2, roundMethod).toNumber();

  return {
    originalPrice,
    originalCurrency: originalCurrency.toUpperCase(),
    targetCurrency: targetCurrency.toUpperCase(),
    exchangeRate: rateResult.rate,
    rateSource: rateResult.source,
    rateTimestamp: rateResult.retrievedAt,
    convertedProductPrice: finalConvertedProduct,
    serviceFeePercent,
    serviceFeeAmount: decServiceFeePercentAmount.toNumber(),
    flatServiceFee,
    totalServiceFee: finalServiceFee,
    estimatedTotal: finalTotal,
    formattedOriginal: formatCurrency(originalPrice, originalCurrency),
    formattedConvertedProduct: formatCurrency(finalConvertedProduct, targetCurrency),
    formattedServiceFee: formatCurrency(finalServiceFee, targetCurrency),
    formattedTotal: formatCurrency(finalTotal, targetCurrency),
  };
}
