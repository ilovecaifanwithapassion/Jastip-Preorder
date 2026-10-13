import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const trips = await prisma.trip.findMany({
      where: {
        status: { in: ["OPEN", "PUBLISHED", "CLOSED", "IN_PROGRESS", "COMPLETED"] },
      },
      include: { _count: { select: { products: true, orders: true } } },
      orderBy: { departureDate: "asc" },
    });
    return NextResponse.json(trips);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
