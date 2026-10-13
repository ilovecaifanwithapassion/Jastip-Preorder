import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { variants: true, trip: true },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const { variants, images, ...rest } = body;

    const updateData: any = { ...rest };
    if (images !== undefined) updateData.images = JSON.stringify(Array.isArray(images) ? images : [images].filter(Boolean));
    if (rest.originalPrice !== undefined) updateData.originalPrice = parseFloat(rest.originalPrice);
    if (rest.quantityLimit !== undefined) updateData.quantityLimit = rest.quantityLimit ? parseInt(rest.quantityLimit) : null;

    const product = await prisma.product.update({
      where: { id: params.id },
      data: updateData,
      include: { variants: true },
    });

    // If variants supplied, replace them
    if (variants && Array.isArray(variants)) {
      await prisma.productVariant.deleteMany({ where: { productId: params.id } });
      if (variants.length > 0) {
        await prisma.productVariant.createMany({
          data: variants.map((v: any) => ({
            productId: params.id,
            name: v.name,
            priceAdjustment: parseFloat(v.priceAdjustment) || 0,
            stockLimit: v.stockLimit ? parseInt(v.stockLimit) : null,
          })),
        });
      }
    }

    await prisma.auditLog.create({
      data: {
        actorId: (session.user as any).id,
        action: "UPDATE_PRODUCT",
        entityType: "Product",
        entityId: params.id,
        details: JSON.stringify(body),
      },
    });

    return NextResponse.json(product);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
