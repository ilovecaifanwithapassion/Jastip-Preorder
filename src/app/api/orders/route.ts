import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getExchangeRate, calculatePricingBreakdown } from "@/lib/currency";

// GET: list orders for current customer
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const orders = await prisma.order.findMany({
      where: { userId: (session.user as any).id },
      include: {
        trip: { select: { title: true, destinationCity: true, destinationCountry: true } },
        items: true,
        pricingSnapshot: true,
        payments: { orderBy: { createdAt: "desc" }, take: 1 },
        statusHistory: { orderBy: { createdAt: "desc" }, take: 5 },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orders);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST: create a new order
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const body = await req.json();
    const { tripId, customerName, customerPhone, deliveryAddress, deliveryNotes, items } = body;

    if (!tripId || !customerName || !customerPhone || !deliveryAddress || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) return NextResponse.json({ error: "Trip not found." }, { status: 404 });
    if (trip.status !== "OPEN") return NextResponse.json({ error: "Trip is not open for orders." }, { status: 400 });
    if (new Date(trip.orderDeadline) < new Date()) {
      return NextResponse.json({ error: "Order deadline has passed." }, { status: 400 });
    }

    // Load all products referenced
    const productIds = Array.from(new Set(items.map((i: any) => i.productId).filter(Boolean)));
    const products = await prisma.product.findMany({
      where: { id: { in: productIds as string[] }, tripId },
      include: { variants: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Get exchange rate once for all items
    const rateResult = await getExchangeRate(trip.purchaseCurrency, "IDR", {
      rateMode: trip.exchangeRateMode,
      tripManualRate: trip.manualExchangeRate,
    });

    // Calculate items
    let subtotalIDR = 0;
    const resolvedItems: any[] = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) return NextResponse.json({ error: `Product ${item.productId} not found in trip.` }, { status: 400 });
      if (product.availabilityStatus === "OUT_OF_STOCK" || product.availabilityStatus === "UNAVAILABLE") {
        return NextResponse.json({ error: `Product "${product.name}" is not available.` }, { status: 400 });
      }
      if (product.quantityLimit && item.quantity > product.quantityLimit) {
        return NextResponse.json({ error: `Product "${product.name}" has a quantity limit of ${product.quantityLimit}.` }, { status: 400 });
      }

      let priceAdjustment = 0;
      let variantName: string | undefined;
      if (item.variantId) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (variant) {
          priceAdjustment = variant.priceAdjustment;
          variantName = variant.name;
        }
      }

      const effectiveOriginalPrice = product.originalPrice + priceAdjustment;
      const pricing = calculatePricingBreakdown({
        originalPrice: effectiveOriginalPrice,
        originalCurrency: product.originalCurrency,
        targetCurrency: "IDR",
        rateResult,
        serviceFeePercent: trip.serviceFeePercent,
        flatServiceFee: 0,
      });

      subtotalIDR += pricing.convertedProductPrice * item.quantity;
      resolvedItems.push({
        productId: product.id,
        productName: product.name,
        variantName: variantName || item.variantName,
        quantity: item.quantity,
        originalUnitPrice: effectiveOriginalPrice,
        unitPrice: pricing.estimatedTotal,
        subtotal: pricing.estimatedTotal * item.quantity,
      });
    }

    // Generate order number
    const today = new Date();
    const datePart = today.toISOString().slice(0, 10).replace(/-/g, "");
    const orderCountToday = await prisma.order.count({
      where: { createdAt: { gte: new Date(today.toISOString().slice(0, 10)) } },
    });
    const orderNumber = `JST-${datePart}-${String(orderCountToday + 1).padStart(4, "0")}`;

    const serviceFeeAmount = (subtotalIDR * trip.serviceFeePercent) / 100 + trip.flatServiceFee;
    const totalPayable = subtotalIDR + serviceFeeAmount;

    // Create order + items + snapshot in transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          tripId,
          customerName,
          customerPhone,
          deliveryAddress,
          deliveryNotes,
          fulfillmentStatus: "PENDING_REVIEW",
          paymentStatus: "AWAITING_PAYMENT",
          items: {
            create: resolvedItems,
          },
        },
      });

      await tx.pricingSnapshot.create({
        data: {
          orderId: newOrder.id,
          subtotal: subtotalIDR,
          serviceFee: serviceFeeAmount,
          shippingFee: 0,
          taxesOrDuties: 0,
          totalPayable,
          currency: "IDR",
          tripCurrency: trip.purchaseCurrency,
          exchangeRate: rateResult.rate,
          exchangeRateSource: rateResult.source,
          rateTimestamp: rateResult.retrievedAt,
        },
      });

      return newOrder;
    });

    return NextResponse.json({ id: order.id, orderNumber: order.orderNumber }, { status: 201 });
  } catch (e: any) {
    console.error("Order creation error:", e);
    return NextResponse.json({ error: e.message || "Internal server error" }, { status: 500 });
  }
}
