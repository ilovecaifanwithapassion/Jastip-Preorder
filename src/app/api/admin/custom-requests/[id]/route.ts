import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

// PATCH: update custom request (quote, accept, decline)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const {
      status, quotedOriginalPrice, quotedCustomerPrice, quotedServiceFee,
      quoteNotes, quoteExpiresAt,
    } = body;

    const updated = await prisma.customRequest.update({
      where: { id: params.id },
      data: {
        ...(status ? { status } : {}),
        ...(quotedOriginalPrice !== undefined ? { quotedOriginalPrice: parseFloat(quotedOriginalPrice) } : {}),
        ...(quotedCustomerPrice !== undefined ? { quotedCustomerPrice: parseFloat(quotedCustomerPrice) } : {}),
        ...(quotedServiceFee !== undefined ? { quotedServiceFee: parseFloat(quotedServiceFee) } : {}),
        ...(quoteNotes ? { quoteNotes } : {}),
        ...(quoteExpiresAt ? { quoteExpiresAt: new Date(quoteExpiresAt) } : {}),
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: (session.user as any).id,
        action: "UPDATE_CUSTOM_REQUEST",
        entityType: "CustomRequest",
        entityId: params.id,
        details: JSON.stringify(body),
      },
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
