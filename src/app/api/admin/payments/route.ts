import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

// GET: list pending payments (admin)
export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "SUBMITTED";

  const payments = await prisma.payment.findMany({
    where: { status },
    include: {
      order: {
        include: {
          user: { select: { name: true, email: true } },
          trip: { select: { title: true } },
          pricingSnapshot: { select: { totalPayable: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(payments);
}
