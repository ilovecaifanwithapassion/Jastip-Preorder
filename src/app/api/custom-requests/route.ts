import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: list custom requests for current user
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const requests = await prisma.customRequest.findMany({
      where: { userId },
      include: {
        trip: { select: { id: true, title: true, destinationCity: true, destinationCountry: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(requests);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST: submit a new custom request
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const body = await req.json();
    const { tripId, productName, description, referenceUrl, referenceImage, quantity, variantSpecs } = body;

    if (!tripId || !productName || !description) {
      return NextResponse.json({ error: "Missing required fields: tripId, productName, description." }, { status: 400 });
    }

    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip || (trip.status !== "OPEN" && trip.status !== "PUBLISHED")) {
      return NextResponse.json({ error: "Trip not available for custom requests." }, { status: 400 });
    }

    const customRequest = await prisma.customRequest.create({
      data: {
        userId,
        tripId,
        productName,
        description,
        referenceUrl,
        referenceImage,
        quantity: parseInt(quantity) || 1,
        variantSpecs,
        status: "SUBMITTED",
      },
    });

    return NextResponse.json(customRequest, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
