import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const customers = await prisma.user.findMany({
      where: { role: "CUSTOMER" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        orders: {
          select: {
            id: true,
            fulfillmentStatus: true,
            pricingSnapshot: {
              select: {
                totalPayable: true,
              },
            },
          },
        },
        customRequests: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = customers.map((c) => {
      const totalSpent = c.orders.reduce((acc, o) => {
        return acc + (o.pricingSnapshot?.totalPayable || 0);
      }, 0);
      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone || "-",
        createdAt: c.createdAt,
        totalOrders: c.orders.length,
        totalSpent,
        totalRequests: c.customRequests.length,
      };
    });

    return NextResponse.json(formatted);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
