import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

// GET: all orders (admin)
export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const tripId = searchParams.get("tripId");

  const orders = await prisma.order.findMany({
    where: {
      ...(status ? { fulfillmentStatus: status } : {}),
      ...(tripId ? { tripId } : {}),
    },
    include: {
      user: { select: { name: true, email: true } },
      trip: { select: { id: true, title: true, destinationCity: true } },
      items: { select: { productName: true, quantity: true, subtotal: true } },
      pricingSnapshot: { select: { totalPayable: true } },
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}
