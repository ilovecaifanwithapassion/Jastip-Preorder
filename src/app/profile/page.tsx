import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  PackageCheck,
  MessageCircle,
} from "lucide-react";
import { getWhatsAppSupportUrl } from "@/lib/whatsapp";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?callbackUrl=/profile");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      _count: {
        select: {
          orders: true,
          customRequests: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const whatsappUrl = getWhatsAppSupportUrl({ type: "GENERAL" });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Profil Akun Pelanggan
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Informasi kontak dan ringkasan aktivitas belanja jasa titip Anda
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Card: User Info */}
        <div className="md:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shadow-indigo-500/25">
              {user.name[0]?.toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {user.role === "ADMIN" ? "👑 Owner Admin" : "👤 Customer"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">ID: {user.id}</p>
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3 text-slate-700">
              <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div>
                <p className="text-[11px] text-slate-400 uppercase font-bold">Email</p>
                <p className="font-medium text-slate-900">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-700">
              <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div>
                <p className="text-[11px] text-slate-400 uppercase font-bold">Nomor WhatsApp / HP</p>
                <p className="font-medium text-slate-900">{user.phone || "Belum diisi"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-700">
              <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div>
                <p className="text-[11px] text-slate-400 uppercase font-bold">Tanggal Bergabung</p>
                <p className="font-medium text-slate-900">
                  {new Date(user.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Quick Activity Stats */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider text-slate-400">
              Aktivitas Jastip
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100 text-center">
                <PackageCheck className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
                <p className="text-2xl font-black text-indigo-950">{user._count.orders}</p>
                <p className="text-[11px] text-indigo-700 font-medium">Pesanan</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <ShoppingBag className="w-5 h-5 text-slate-600 mx-auto mb-1" />
                <p className="text-2xl font-black text-slate-900">
                  {user._count.customRequests}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">Custom Request</p>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <Link
                href="/orders"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
              >
                <span>Lihat Riwayat Pesanan</span>
              </Link>
              <Link
                href="/custom-request"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs transition-colors"
              >
                <span>Buat Custom Request</span>
              </Link>
            </div>
          </div>

          {/* Support help */}
          <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Butuh Bantuan Akun?</span>
            </div>
            <p className="text-[11px] text-emerald-700 leading-relaxed">
              Hubungi layanan pelanggan resmi kami jika ada perubahan nomor kontak atau alamat.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 underline"
            >
              Hubungi via WhatsApp →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
