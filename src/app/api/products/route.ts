import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tripId = searchParams.get("tripId");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const where: any = {};

    if (tripId) {
      where.tripId = tripId;
    }
    if (category && category !== "all") {
      where.category = category;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { brand: { contains: search } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        trip: {
          select: {
            id: true,
            title: true,
            destinationCountry: true,
            destinationCity: true,
            purchaseCurrency: true,
            exchangeRateMode: true,
            manualExchangeRate: true,
            serviceFeePercent: true,
            flatServiceFee: true,
            status: true,
            orderDeadline: true,
          },
        },
        variants: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
