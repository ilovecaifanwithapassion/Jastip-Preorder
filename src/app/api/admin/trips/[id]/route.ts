import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

// GET single trip
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const trip = await prisma.trip.findUnique({
    where: { id: params.id },
    include: {
      products: { include: { variants: true }, orderBy: { createdAt: "desc" } },
      _count: { select: { orders: true } },
    },
  });
  if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(trip);
}

// PATCH update trip
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();

    const updateData: any = { ...body };
    if (body.departureDate) updateData.departureDate = new Date(body.departureDate);
    if (body.returnDate) updateData.returnDate = new Date(body.returnDate);
    if (body.orderOpenDate) updateData.orderOpenDate = new Date(body.orderOpenDate);
    if (body.orderDeadline) updateData.orderDeadline = new Date(body.orderDeadline);
    if (body.estimatedDeliveryDate) updateData.estimatedDeliveryDate = new Date(body.estimatedDeliveryDate);
    if (body.manualExchangeRate !== undefined) updateData.manualExchangeRate = body.manualExchangeRate ? parseFloat(body.manualExchangeRate) : null;
    if (body.serviceFeePercent !== undefined) updateData.serviceFeePercent = parseFloat(body.serviceFeePercent);
    if (body.flatServiceFee !== undefined) updateData.flatServiceFee = parseFloat(body.flatServiceFee);

    const trip = await prisma.trip.update({
      where: { id: params.id },
      data: updateData,
    });

    try {
      if ((session.user as any)?.id) {
        await prisma.auditLog.create({
          data: {
            actorId: (session.user as any).id,
            action: "UPDATE_TRIP",
            entityType: "Trip",
            entityId: params.id,
            details: JSON.stringify(body),
          },
        });
      }
    } catch (auditErr) {
      console.warn("Audit log skipped:", auditErr);
    }

    return NextResponse.json(trip);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE trip
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await prisma.trip.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
