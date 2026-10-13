import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: specific order by id (customer can only see own orders)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const isAdmin = (session.user as any).role === "ADMIN";

  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        trip: { select: { id: true, title: true, destinationCity: true, destinationCountry: true, purchaseCurrency: true } },
        items: {
          include: { product: { select: { id: true, name: true, images: true } } },
        },
        pricingSnapshot: true,
        payments: { orderBy: { createdAt: "desc" } },
        statusHistory: {
          include: { actor: { select: { name: true, role: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (!isAdmin && order.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
