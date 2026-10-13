import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST: submit payment proof for an order
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const order = await prisma.order.findUnique({ where: { id: params.id } });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (order.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { amount, method, proofImageUrl, referenceNotes } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid payment amount." }, { status: 400 });
    }

    const payment = await prisma.$transaction(async (tx) => {
      const p = await tx.payment.create({
        data: {
          orderId: order.id,
          amount: parseFloat(amount),
          currency: "IDR",
          method: method || "MANUAL_BANK_TRANSFER",
          proofImageUrl,
          referenceNotes,
          status: "SUBMITTED",
        },
      });

      await tx.order.update({
        where: { id: order.id },
        data: { paymentStatus: "SUBMITTED_FOR_REVIEW" },
      });

      return p;
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
