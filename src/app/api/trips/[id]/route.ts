import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: params.id },
      include: {
        _count: { select: { products: true, orders: true } },
      },
    });
    if (!trip || trip.status === "DRAFT" || trip.status === "CANCELLED") {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }
    return NextResponse.json(trip);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
