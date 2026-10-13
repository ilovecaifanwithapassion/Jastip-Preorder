import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

// PATCH: verify or reject a payment
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const { action, rejectionReason } = body; // action: "VERIFY" | "REJECT"

    if (!["VERIFY", "REJECT"].includes(action)) {
      return NextResponse.json({ error: "Invalid action. Use VERIFY or REJECT." }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: { order: true },
    });
    if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

    const newPaymentStatus = action === "VERIFY" ? "VERIFIED" : "REJECTED";
    const newOrderPaymentStatus = action === "VERIFY" ? "PAID_AND_VERIFIED" : "REJECTED";
    const newOrderFulfillment = action === "VERIFY" ? "CONFIRMED" : undefined;

    const result = await prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: params.id },
        data: {
          status: newPaymentStatus,
          verifiedByAdminId: (session.user as any).id,
          verifiedAt: new Date(),
          rejectionReason: action === "REJECT" ? rejectionReason : null,
        },
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: newOrderPaymentStatus,
          ...(newOrderFulfillment ? { fulfillmentStatus: newOrderFulfillment } : {}),
        },
      });

      const currentOrder = payment.order;
      await tx.orderStatusHistory.create({
        data: {
          orderId: payment.orderId,
          actorId: (session.user as any).id,
          type: "PAYMENT",
          previousStatus: currentOrder.paymentStatus,
          newStatus: newOrderPaymentStatus,
          notes: action === "VERIFY" ? "Pembayaran diverifikasi oleh admin." : `Pembayaran ditolak: ${rejectionReason}`,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: (session.user as any).id,
          action: action === "VERIFY" ? "VERIFY_PAYMENT" : "REJECT_PAYMENT",
          entityType: "Payment",
          entityId: params.id,
          details: JSON.stringify({ orderId: payment.orderId, action, rejectionReason }),
        },
      });

      return updatedPayment;
    });

    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
