import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return null;
  }
  return session;
}

// GET: list all trips (admin)
export async function GET(req: NextRequest) {
  const session = await requireAdmin(req);
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const trips = await prisma.trip.findMany({
    include: { _count: { select: { products: true, orders: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(trips);
}

// POST: create a new trip
export async function POST(req: NextRequest) {
  const session = await requireAdmin(req);
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const {
      title, destinationCountry, destinationCity, originCity,
      departureDate, returnDate, orderOpenDate, orderDeadline,
      estimatedDeliveryDate, status, description, coverImage,
      purchaseCurrency, exchangeRateMode, manualExchangeRate,
      serviceFeePercent, flatServiceFee, termsAndNotes,
    } = body;

    if (!title || !destinationCountry || !destinationCity || !departureDate || !orderDeadline) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const trip = await prisma.trip.create({
      data: {
        title,
        destinationCountry,
        destinationCity,
        originCity: originCity || "Jakarta",
        departureDate: new Date(departureDate),
        returnDate: new Date(returnDate || departureDate),
        orderOpenDate: new Date(orderOpenDate || new Date()),
        orderDeadline: new Date(orderDeadline),
        estimatedDeliveryDate: new Date(estimatedDeliveryDate || orderDeadline),
        status: status || "DRAFT",
        description: description || "",
        coverImage,
        purchaseCurrency: purchaseCurrency || "SGD",
        exchangeRateMode: exchangeRateMode || "AUTO_LIVE",
        manualExchangeRate: manualExchangeRate ? parseFloat(manualExchangeRate) : null,
        serviceFeePercent: parseFloat(serviceFeePercent) || 10,
        flatServiceFee: parseFloat(flatServiceFee) || 0,
        termsAndNotes,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorId: (session.user as any).id,
        action: "CREATE_TRIP",
        entityType: "Trip",
        entityId: trip.id,
        details: JSON.stringify({ title, status }),
      },
    });

    return NextResponse.json(trip, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
