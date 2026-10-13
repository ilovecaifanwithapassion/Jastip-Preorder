"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShoppingBag,
  Loader2,
  RefreshCw,
} from "lucide-react";

const FULFILLMENT_LABELS: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  PENDING_REVIEW: { label: "Menunggu Review", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: <Clock className="w-3.5 h-3.5" /> },
  AWAITING_PAYMENT: { label: "Menunggu Bayar", color: "text-orange-600", bg: "bg-orange-50 border-orange-200", icon: <AlertCircle className="w-3.5 h-3.5" /> },
  CONFIRMED: { label: "Terkonfirmasi", color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  PURCHASING: { label: "Sedang Dibeli", color: "text-violet-700", bg: "bg-violet-50 border-violet-200", icon: <ShoppingBag className="w-3.5 h-3.5" /> },
  PURCHASED: { label: "Sudah Dibeli", color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-200", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  IN_TRANSIT: { label: "Dalam Perjalanan", color: "text-sky-700", bg: "bg-sky-50 border-sky-200", icon: <Package className="w-3.5 h-3.5" /> },
  ARRIVED: { label: "Tiba di Indonesia", color: "text-teal-700", bg: "bg-teal-50 border-teal-200", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  READY_FOR_DELIVERY: { label: "Siap Kirim", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  COMPLETED: { label: "Selesai", color: "text-emerald-800", bg: "bg-emerald-100 border-emerald-300", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  CANCELLED: { label: "Dibatalkan", color: "text-red-600", bg: "bg-red-50 border-red-200", icon: <AlertCircle className="w-3.5 h-3.5" /> },
  REFUNDED: { label: "Direfund", color: "text-slate-600", bg: "bg-slate-50 border-slate-200", icon: <RefreshCw className="w-3.5 h-3.5" /> },
};

const PAYMENT_LABELS: Record<string, { label: string; color: string }> = {
  AWAITING_PAYMENT: { label: "Belum Bayar", color: "text-red-500" },
  SUBMITTED_FOR_REVIEW: { label: "Bukti Dikirim", color: "text-amber-600" },
  PAID_AND_VERIFIED: { label: "Lunas ✓", color: "text-emerald-600" },
  REJECTED: { label: "Ditolak", color: "text-red-600" },
  REFUNDED: { label: "Direfund", color: "text-slate-500" },
};

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?redirect=/orders");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/orders")
        .then((r) => r.json())
        .then((data) => setOrders(Array.isArray(data) ? data : []))
        .catch(() => setOrders([]))
        .finally(() => setLoading(false));
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Riwayat Pesanan</h1>
          <p className="text-sm text-slate-500 mt-1">Pantau status semua pesanan jastip Anda</p>
        </div>
        <Link href="/trips" className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md hover:bg-indigo-700 transition-colors">
          <ShoppingBag className="w-4 h-4" />
          Belanja Lagi
        </Link>
      </div>

      {orders.length === 0 && (
        <div className="py-24 text-center space-y-4">
          <Package className="w-16 h-16 text-slate-200 mx-auto" />
          <h3 className="text-xl font-bold text-slate-600">Belum Ada Pesanan</h3>
          <p className="text-sm text-slate-400">Mulai titip belanja dari trip yang sedang dibuka!</p>
          <Link href="/trips" className="inline-flex items-center gap-2 mt-4 px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-md hover:bg-indigo-700 transition-colors">
            <ArrowRight className="w-4 h-4" />
            Lihat Trip Tersedia
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {orders.map((order) => {
          const fulfillment = FULFILLMENT_LABELS[order.fulfillmentStatus] || { label: order.fulfillmentStatus, color: "text-slate-500", bg: "bg-slate-50 border-slate-200", icon: <Package className="w-3.5 h-3.5" /> };
          const payment = PAYMENT_LABELS[order.paymentStatus] || { label: order.paymentStatus, color: "text-slate-500" };
          const snapshot = order.pricingSnapshot;

          return (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-black text-slate-900 font-mono text-sm">{order.orderNumber}</span>
                    <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${fulfillment.bg} ${fulfillment.color}`}>
                      {fulfillment.icon}
                      {fulfillment.label}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 font-medium truncate">{order.trip?.title}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                    <span>{order.items?.length || 0} item</span>
                    <span>|</span>
                    <span className={`font-semibold ${payment.color}`}>{payment.label}</span>
                    <span>|</span>
                    <span>{new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right space-y-1">
                  {snapshot && (
                    <p className="font-extrabold text-indigo-700 text-base">
                      Rp {snapshot.totalPayable.toLocaleString("id-ID")}
                    </p>
                  )}
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors ml-auto" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
