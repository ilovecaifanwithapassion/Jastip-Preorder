import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

// GET: list custom requests (admin)
export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const requests = await prisma.customRequest.findMany({
    where: status ? { status } : undefined,
    include: {
      user: { select: { name: true, email: true, phone: true } },
      trip: { select: { title: true, destinationCity: true, purchaseCurrency: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(requests);
}
