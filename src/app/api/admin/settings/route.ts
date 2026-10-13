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
    const settingsList = await prisma.systemSetting.findMany();
    const settingsMap: Record<string, string> = {};
    settingsList.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    // Provide default fallbacks if not yet initialized
    const defaults: Record<string, string> = {
      whatsapp_number: "6281234567890",
      whatsapp_support_name: "Customer Care JastipPreorder",
      bank_bca_account: "1234567890",
      bank_bca_name: "PT Jastip Global Indonesia",
      bank_mandiri_account: "9876543210",
      bank_mandiri_name: "PT Jastip Global Indonesia",
      default_customer_currency: "IDR",
      exchange_rate_buffer_percent: "2.5",
      announcement_banner: "Open PO Japan Cherry Blossom Shopping! Kuota terbatas.",
      announcement_active: "true",
    };

    return NextResponse.json({ ...defaults, ...settingsMap });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();

    for (const [key, value] of Object.entries(body)) {
      if (typeof value === "string") {
        await prisma.systemSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        });
      }
    }

    await prisma.auditLog.create({
      data: {
        actorId: (session.user as any).id,
        action: "UPDATE_SYSTEM_SETTINGS",
        entityType: "SystemSetting",
        entityId: "global",
        details: JSON.stringify(body),
      },
    });

    return NextResponse.json({ success: true, message: "Pengaturan berhasil diperbarui." });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
