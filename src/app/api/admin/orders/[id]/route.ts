import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

// GET: single order (admin full access)
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      trip: true,
      items: { include: { product: true } },
      pricingSnapshot: true,
      payments: { orderBy: { createdAt: "desc" } },
      statusHistory: {
        include: { actor: { select: { name: true, role: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}

// PATCH: update fulfillment status
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const { fulfillmentStatus, paymentStatus, notes } = body;

    const currentOrder = await prisma.order.findUnique({ where: { id: params.id } });
    if (!currentOrder) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: params.id },
        data: {
          ...(fulfillmentStatus ? { fulfillmentStatus } : {}),
          ...(paymentStatus ? { paymentStatus } : {}),
        },
      });

      if (fulfillmentStatus && fulfillmentStatus !== currentOrder.fulfillmentStatus) {
        await tx.orderStatusHistory.create({
          data: {
            orderId: params.id,
            actorId: (session.user as any).id,
            type: "FULFILLMENT",
            previousStatus: currentOrder.fulfillmentStatus,
            newStatus: fulfillmentStatus,
            notes,
          },
        });
      }

      if (paymentStatus && paymentStatus !== currentOrder.paymentStatus) {
        await tx.orderStatusHistory.create({
          data: {
            orderId: params.id,
            actorId: (session.user as any).id,
            type: "PAYMENT",
            previousStatus: currentOrder.paymentStatus,
            newStatus: paymentStatus,
            notes,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          actorId: (session.user as any).id,
          action: "UPDATE_ORDER_STATUS",
          entityType: "Order",
          entityId: params.id,
          details: JSON.stringify({ fulfillmentStatus, paymentStatus, notes }),
        },
      });

      return updated;
    });

    return NextResponse.json(updatedOrder);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
