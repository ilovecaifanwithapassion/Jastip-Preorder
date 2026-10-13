import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getExchangeRate, calculatePricingBreakdown } from "@/lib/currency";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const tripId = searchParams.get("tripId");

  if (!productId || !tripId) {
    return NextResponse.json({ error: "Missing productId or tripId" }, { status: 400 });
  }

  try {
    const [product, trip] = await Promise.all([
      prisma.product.findUnique({ where: { id: productId } }),
      prisma.trip.findUnique({ where: { id: tripId } }),
    ]);

    if (!product || !trip) {
      return NextResponse.json({ error: "Product or trip not found" }, { status: 404 });
    }

    const rateResult = await getExchangeRate(product.originalCurrency, "IDR", {
      rateMode: trip.exchangeRateMode,
      tripManualRate: trip.manualExchangeRate,
    });

    const breakdown = calculatePricingBreakdown({
      originalPrice: product.originalPrice,
      originalCurrency: product.originalCurrency,
      targetCurrency: "IDR",
      rateResult,
      serviceFeePercent: trip.serviceFeePercent,
      flatServiceFee: trip.flatServiceFee,
    });

    return NextResponse.json(breakdown);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
