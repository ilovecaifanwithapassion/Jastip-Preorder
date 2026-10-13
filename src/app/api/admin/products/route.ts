import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

// GET: admin list all products (optionally by trip)
export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const tripId = searchParams.get("tripId");

  const products = await prisma.product.findMany({
    where: tripId ? { tripId } : undefined,
    include: { variants: true, trip: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

// POST: create product
export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const {
      tripId, name, description, category, brand, sourceStore,
      externalUrl, originalPrice, originalCurrency, quantityLimit,
      availabilityStatus, images, variants,
    } = body;

    if (!tripId || !name || !originalPrice || !originalCurrency) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // Serialize images array
    const imagesJson = JSON.stringify(Array.isArray(images) ? images : [images].filter(Boolean));

    const product = await prisma.product.create({
      data: {
        tripId,
        name,
        description: description || "",
        category: category || "General",
        brand,
        sourceStore,
        externalUrl,
        originalPrice: parseFloat(originalPrice),
        originalCurrency,
        quantityLimit: quantityLimit ? parseInt(quantityLimit) : null,
        availabilityStatus: availabilityStatus || "AVAILABLE",
        images: imagesJson,
        variants: variants && Array.isArray(variants) ? {
          create: variants.map((v: any) => ({
            name: v.name,
            priceAdjustment: parseFloat(v.priceAdjustment) || 0,
            stockLimit: v.stockLimit ? parseInt(v.stockLimit) : null,
          })),
        } : undefined,
      },
      include: { variants: true },
    });

    await prisma.auditLog.create({
      data: {
        actorId: (session.user as any).id,
        action: "CREATE_PRODUCT",
        entityType: "Product",
        entityId: product.id,
        details: JSON.stringify({ name, tripId }),
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
