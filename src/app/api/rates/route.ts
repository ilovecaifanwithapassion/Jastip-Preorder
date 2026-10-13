import { NextResponse } from "next/server";
import { getExchangeRate } from "@/lib/currency";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const from = (searchParams.get("from") || "").toUpperCase();
    const to = (searchParams.get("to") || "IDR").toUpperCase();
    const forceRefresh = searchParams.get("refresh") === "true";
    const getAll = searchParams.get("all") === "true" || from === "ALL" || !from;

    if (getAll) {
      const famousCurrencies = ["SGD", "JPY", "KRW", "HKD", "USD", "EUR", "GBP", "THB", "MYR", "AUD"];
      const results = await Promise.all(
        famousCurrencies.map(async (curr) => {
          try {
            const res = await getExchangeRate(curr, to, { forceRefresh });
            return res;
          } catch {
            return {
              fromCurrency: curr,
              toCurrency: to,
              rate: 1,
              source: "FALLBACK" as const,
              retrievedAt: new Date(),
              isStale: true,
              provider: "Fallback",
            };
          }
        })
      );

      const ratesMap: Record<string, number> = {};
      results.forEach((r) => {
        ratesMap[r.fromCurrency] = r.rate;
      });

      return NextResponse.json({
        success: true,
        toCurrency: to,
        rates: ratesMap,
        items: results,
      });
    }

    const rateResult = await getExchangeRate(from, to, { forceRefresh });

    return NextResponse.json({
      success: true,
      rate: rateResult.rate,
      data: rateResult,
    });
  } catch (error) {
    console.error("Rates API error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve exchange rate" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { tripId, exchangeRateMode, manualExchangeRate } = body;

    if (!tripId) {
      return NextResponse.json({ error: "Trip ID is required" }, { status: 400 });
    }

    const updatedTrip = await prisma.trip.update({
      where: { id: tripId },
      data: {
        exchangeRateMode: exchangeRateMode || "AUTO_LIVE",
        manualExchangeRate: manualExchangeRate ? parseFloat(manualExchangeRate) : null,
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "UPDATE_TRIP_EXCHANGE_RATE",
        entityType: "Trip",
        entityId: tripId,
        details: JSON.stringify({
          exchangeRateMode,
          manualExchangeRate,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Trip exchange rate settings updated successfully",
      trip: updatedTrip,
    });
  } catch (error) {
    console.error("Admin rate update error:", error);
    return NextResponse.json(
      { error: "Failed to update trip rate settings" },
      { status: 500 }
    );
  }
}
